"""
Local-first CMS 同步脚本

遍历 CONTENT_DIR 下的分类子文件夹，解析 Markdown + YAML Frontmatter，
通过 POST /posts/ 上传至 FastAPI 后端（需管理员身份）。

用法：
    python sync_posts.py            # 扫描并上传所有文章（已存在的会跳过）
    python sync_posts.py --dry-run  # 仅打印将要上传的内容，不实际发送

鉴权：
    从 backend/.env 读取 ADMIN_EMAIL，密码优先读 BLOG_ADMIN_PASSWORD
    环境变量，否则交互式输入。
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
import frontmatter
import requests

# ── 加载 backend/.env ─────────────────────────────────────
_script_dir = Path(__file__).resolve().parent
_backend_dir = _script_dir.parent / "backend"
_env_path = _backend_dir / ".env"

if _env_path.exists():
    load_dotenv(_env_path)
else:
    print(f"[错误] 未找到 .env 文件（预期路径: {_env_path}）")
    sys.exit(1)

# ── 常量配置 ──────────────────────────────────────────────
CONTENT_DIR = "E:/backend_database"
API_BASE = "http://127.0.0.1:8000"
API_URL = f"{API_BASE}/posts/"

# 管理员凭据（从 .env 读取，不上传至 Git）
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
if not ADMIN_EMAIL:
    print("[错误] 请在 .env 文件中配置 ADMIN_EMAIL")
    sys.exit(1)


def _get_password() -> str:
    """优先读环境变量，否则交互式输入（输一次管整个脚本运行周期）。"""
    pw = os.getenv("BLOG_ADMIN_PASSWORD", "")
    if pw:
        return pw
    import getpass
    return getpass.getpass(f"请输入 {ADMIN_EMAIL} 的密码: ")

# 子文件夹名 → 对应的 tag（与前端 TAG_ROUTE_MAP 对齐）
FOLDER_TO_TAG: dict[str, str] = {
    "笔记": "笔记",
    "notes": "笔记",
    "思考": "思考",
    "thinkings": "思考",
    "视频": "视频",
    "videos": "视频",
    "项目开发": "项目开发",
    "projects": "项目开发",
    "灵感": "灵感",
    "inspirations": "灵感",
    "资源": "资源",
    "resources": "资源",
    "关于": "关于",
    "about": "关于",
}

# ── 辅助函数 ──────────────────────────────────────────────

def slugify(text: str) -> str:
    """将文本转为 URL 友好的 slug"""
    import re
    text = text.lower().strip()
    text = re.sub(r"[^\w一-鿿-]", "-", text)
    text = re.sub(r"-{2,}", "-", text)
    return text.strip("-")


def build_payload(md_file: Path, folder_name: str) -> dict | None:
    """
    解析单个 .md 文件，组装 API 所需的 JSON payload。

    返回 None 表示该文件应跳过。
    """
    try:
        with open(md_file, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)
    except Exception as e:
        print(f"  [错误] 无法读取 {md_file}: {e}")
        return None

    meta: dict = post.metadata or {}
    content: str = post.content or ""

    # --- title ---
    title = meta.get("title", "").strip()
    if not title:
        # 降级：使用文件名（去掉扩展名）
        title = md_file.stem.strip()
        print(f"  [警告] {md_file.name} 缺少 title，降级使用文件名 '{title}'")

    # --- slug ---
    slug = meta.get("slug", "").strip()
    if not slug:
        slug = slugify(md_file.stem)

    # --- summary ---
    summary = meta.get("summary", "").strip()
    if not summary:
        # 降级：取正文前 200 个字符
        plain = content.replace("#", "").replace("*", "").replace("`", "").strip()
        summary = plain[:200]
        print(f"  [警告] {md_file.name} 缺少 summary，降级使用正文前 200 字")

    # --- tags ---
    tags: list[str] = meta.get("tags", [])
    if not isinstance(tags, list):
        tags = [str(tags)]
    # 自动注入文件夹对应的分类 tag
    category_tag = FOLDER_TO_TAG.get(folder_name, folder_name)
    if category_tag not in tags:
        tags.insert(0, category_tag)

    # --- date (可选，存为自定义字段或忽略；API 自动生成 created_at) ---
    # 如果 frontmatter 中有 date，可在 summary 前面追加日期信息以供参考
    date_str = meta.get("date", "")
    if date_str:
        try:
            parsed = datetime.fromisoformat(str(date_str))
            date_str = parsed.strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            pass

    # --- is_published ---
    is_published = meta.get("is_published", True)
    if isinstance(is_published, str):
        is_published = is_published.lower() not in ("false", "no", "0")

    payload = {
        "title": title,
        "slug": slug,
        "content": content,
        "summary": summary,
        "tags": tags,
        "is_published": bool(is_published),
    }

    return payload


def login(session: requests.Session) -> bool:
    """管理员登录，获取 Cookie 存入 session。返回是否成功。"""
    password = _get_password()
    if not password:
        print("[错误] 密码为空，已取消。")
        return False

    print(f"[鉴权] 正在以 {ADMIN_EMAIL} 身份登录...")
    try:
        resp = session.post(
            f"{API_BASE}/auth/login",
            json={"email": ADMIN_EMAIL, "password": password},
            timeout=15,
        )
        if resp.status_code == 200:
            print(f"[鉴权] 登录成功")
            return True
        else:
            detail = resp.json().get("detail", resp.text)
            print(f"[错误] 登录失败 ({resp.status_code}): {detail}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"[错误] 无法连接后端 ({API_BASE})，请确认服务已启动")
        return False


def fetch_existing_slugs(session: requests.Session) -> set[str]:
    """从后端拉取已有文章的 slug 集合，用于去重检查"""
    try:
        resp = session.get(API_URL, timeout=15)
        if resp.status_code == 200:
            posts = resp.json()
            return {p["slug"] for p in posts if isinstance(p, dict) and "slug" in p}
        else:
            print(f"[警告] 无法获取已有文章列表 (HTTP {resp.status_code})，将尝试上传所有文章")
            return set()
    except Exception as e:
        print(f"[警告] 获取已有文章列表失败: {e}，将尝试上传所有文章")
        return set()


def sync(dry_run: bool = False) -> tuple[int, int, int]:
    """
    遍历 CONTENT_DIR，上传所有 .md 文件。

    返回 (成功数, 失败数, 跳过数)
    """
    content_path = Path(CONTENT_DIR)
    if not content_path.exists():
        print(f"[致命] 内容目录不存在: {CONTENT_DIR}")
        return 0, 1, 0

    # ── 登录 ──
    session = requests.Session()
    if not login(session):
        return 0, 1, 0

    success_count = 0
    fail_count = 0
    skip_count = 0

    # 预加载已有文章 slug 集合
    print("\n[检查] 正在获取已有文章列表...")
    existing_slugs = fetch_existing_slugs(session)
    print(f"[检查] 后端已有 {len(existing_slugs)} 篇文章\n")

    # 遍历子文件夹
    for folder in sorted(content_path.iterdir()):
        if not folder.is_dir():
            continue

        folder_name = folder.name
        if folder_name.startswith("."):
            continue

        category_tag = FOLDER_TO_TAG.get(folder_name)
        if category_tag is None:
            print(f"\n📁 {folder_name}/ [警告] 未识别的文件夹名，将使用文件夹名作为 tag")

        print(f"\n📁 {folder_name}/")

        md_files = sorted(folder.glob("*.md"))
        if not md_files:
            print("  (无 .md 文件)")
            continue

        for md_file in md_files:
            print(f"  📄 {md_file.name} ", end="")

            payload = build_payload(md_file, folder_name)
            if payload is None:
                fail_count += 1
                continue

            # 检查是否已存在
            if payload["slug"] in existing_slugs:
                print("→ ⏭️  已存在，跳过")
                skip_count += 1
                continue

            if dry_run:
                print("→ [DRY-RUN]")
                print(f"     title:   {payload['title']}")
                print(f"     slug:    {payload['slug']}")
                print(f"     tags:    {payload['tags']}")
                print(f"     summary: {payload['summary'][:60]}...")
                success_count += 1
                continue

            try:
                resp = session.post(
                    API_URL,
                    json=payload,
                    timeout=30,
                )

                if resp.status_code in (200, 201):
                    print(f"→ ✅ {resp.status_code}")
                    success_count += 1
                elif resp.status_code == 409:
                    # 假设 slug 冲突（后端目前返回 400 或 422，视具体校验而定）
                    print(f"→ ⚠️  已存在 (slug: {payload['slug']})")
                    fail_count += 1
                else:
                    detail = ""
                    try:
                        detail = resp.json().get("detail", "")
                    except Exception:
                        detail = resp.text[:200]
                    print(f"→ ❌ {resp.status_code} {detail}")
                    fail_count += 1

            except requests.exceptions.ConnectionError:
                print(f"→ ❌ 无法连接后端 ({API_URL})，请确认服务已启动")
                return success_count, fail_count + 1, skip_count
            except requests.exceptions.Timeout:
                print(f"→ ❌ 请求超时")
                fail_count += 1
            except Exception as e:
                print(f"→ ❌ {e}")
                fail_count += 1

    return success_count, fail_count, skip_count


# ── 入口 ──────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="同步 Markdown 文章至后端")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="仅预览将要上传的内容，不实际发送请求",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("Local-first CMS 同步脚本")
    print(f"  内容目录: {CONTENT_DIR}")
    print(f"  API 地址: {API_URL}")
    if args.dry_run:
        print("  模式: DRY-RUN（仅预览）")
    print("=" * 60)

    ok, bad, skipped = sync(dry_run=args.dry_run)

    print(f"\n{'─' * 60}")
    print(f"完成: ✅ {ok} 篇新增, ⏭️  {skipped} 篇已存在, ❌ {bad} 篇失败")
    if args.dry_run:
        print("（本次为 dry-run，未实际发送任何请求）")
