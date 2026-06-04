from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from core.deps import get_current_user
from core.limiter import limiter
from core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from models.user import User
from schemas.user import PasswordChange, UserCreate, UserLogin, UserOut
from utils.storage import upload_file_to_s3

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """统一写入双 HttpOnly Cookie，上线时在 .env 设 SECURE_COOKIES=true。"""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.SECURE_COOKIES,
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.SECURE_COOKIES,
        path="/",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("5/minute")
def register(request: Request, data: UserCreate, db: Session = Depends(get_db)):
    """用户注册。校验邮箱/用户名唯一性，哈希密码后写入数据库。"""
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=get_password_hash(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=UserOut)
@limiter.limit("5/minute")
def login(request: Request, data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """用户登录。校验凭据，签发双 Token 并写入 httponly Cookie。"""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # ── 签发双 Token ──
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    _set_auth_cookies(response, access_token, refresh_token)

    # ── 更新最近登录时间 ──
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    return user


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    """滚动刷新：验证 refresh_token，签发全新的 access_token + refresh_token。

    - 无 cookie / 解码失败 / type 非 "refresh" → 401
    - 用户不存在 / 已封禁 → 401 / 403
    - 成功后 refresh_token 有效期重新从 7 天开始计算
    """
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    # ── 解码 refresh token ──
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not a refresh token",
        )

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # ── 查库 ──
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    # ── 滚动签发：同时更新 access_token 和 refresh_token ──
    token_data = {"sub": str(user.id)}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    _set_auth_cookies(response, new_access_token, new_refresh_token)

    return {"msg": "Token refreshed"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """返回当前登录用户的信息（需携带有效 access_token Cookie）。"""
    return current_user


@router.put("/me", response_model=UserOut)
async def update_me(
    username: str | None = Form(None),
    avatar: str | None = Form(None),
    bio: str | None = Form(None),
    website: str | None = Form(None),
    avatar_file: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新当前用户的个人资料。

    头像可通过两种方式更新：
    - ``avatar`` form 字段：直接传 URL 字符串
    - ``avatar_file`` 文件上传：上传到 S3 后使用返回的 URL（优先级更高）
    """
    # 处理头像文件上传
    if avatar_file is not None and avatar_file.filename:
        # ── 校验文件类型与大小 ──
        AVATAR_MAX_SIZE = 2 * 1024 * 1024  # 2 MB
        ALLOWED_MIME = {
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/gif": ".gif",
            "image/webp": ".webp",
        }

        contents = await avatar_file.read()
        if len(contents) > AVATAR_MAX_SIZE:
            raise HTTPException(status_code=413, detail="头像文件不能超过 2 MB")

        if avatar_file.content_type not in ALLOWED_MIME:
            raise HTTPException(
                status_code=400,
                detail="仅支持 PNG / JPEG / GIF / WebP 格式的头像",
            )

        # 根据客户端声明的 MIME 推导扩展名（不再信任客户端直传 content-type）
        ext = ALLOWED_MIME[avatar_file.content_type]
        safe_content_type = avatar_file.content_type

        avatar_url = upload_file_to_s3(contents, f"avatar{ext}", safe_content_type)
        current_user.avatar = avatar_url
    elif avatar is not None:
        current_user.avatar = avatar

    # 更新其他字段
    if username is not None and username != current_user.username:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            raise HTTPException(status_code=409, detail="Username already taken")
        current_user.username = username

    if bio is not None:
        current_user.bio = bio

    if website is not None:
        current_user.website = website

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """修改密码（需验证旧密码）。"""
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"msg": "Password changed successfully"}
