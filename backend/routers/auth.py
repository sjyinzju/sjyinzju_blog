from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from core.deps import get_current_user
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


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
def register(data: UserCreate, db: Session = Depends(get_db)):
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
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
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

    # ── 写入 Cookie ──
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    # ── 更新最近登录时间 ──
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    return user


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    """用 refresh_token（HttpOnly Cookie）换取新的 access_token。

    - 无 cookie / 解码失败 / type 非 "refresh" → 401
    - 用户不存在 / 已封禁 → 401 / 403
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

    # ── 签发新 access_token ──
    new_access_token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

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
        contents = await avatar_file.read()
        avatar_url = upload_file_to_s3(
            contents, avatar_file.filename, avatar_file.content_type or "image/png"
        )
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
