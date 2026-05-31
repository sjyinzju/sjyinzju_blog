"""
Local-first CMS 同步脚本

遍历 CONTENT_DIR 下的分类子文件夹，解析 Markdown + YAML Frontmatter，
通过 POST /posts/ 上传至 FastAPI 后端。

用法：
    python sync_posts.py            # 扫描并上传所有文章（已存在的会 400，跳过）
    python sync_posts.py --dry-run  # 仅打印将要上传的内容，不实际发送
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

import frontmatter
import requests

# ── 常量配置 ──────────────────────────────────────────────
CONTENT_DIR = "E:/backend_database"
API_URL = "http://127.0.0.1:8000/posts/"

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


def sync(dry_run: bool = False) -> tuple[int, int]:
    """
    遍历 CONTENT_DIR，上传所有 .md 文件。

    返回 (成功数, 失败数)
    """
    content_path = Path(CONTENT_DIR)
    if not content_path.exists():
        print(f"[致命] 内容目录不存在: {CONTENT_DIR}")
        return 0, 1

    success_count = 0
    fail_count = 0

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

            if dry_run:
                print("→ [DRY-RUN]")
                print(f"     title:   {payload['title']}")
                print(f"     slug:    {payload['slug']}")
                print(f"     tags:    {payload['tags']}")
                print(f"     summary: {payload['summary'][:60]}...")
                success_count += 1
                continue

            try:
                resp = requests.post(
                    API_URL,
                    json=payload,
                    timeout=30,
                    headers={"Content-Type": "application/json"},
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
                return success_count, fail_count + 1
            except requests.exceptions.Timeout:
                print(f"→ ❌ 请求超时")
                fail_count += 1
            except Exception as e:
                print(f"→ ❌ {e}")
                fail_count += 1

    return success_count, fail_count


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

    ok, bad = sync(dry_run=args.dry_run)

    print(f"\n{'─' * 60}")
    print(f"完成: ✅ {ok} 篇成功, ❌ {bad} 篇失败")
    if args.dry_run:
        print("（本次为 dry-run，未实际发送任何请求）")
