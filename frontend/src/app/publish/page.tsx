"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InteractiveGrid from "@/components/InteractiveGrid";
import FormPageHero from "@/components/FormPageHero";
import FieldRow from "@/components/FieldRow";
import type { User } from "@/types/user";
import { apiFetch } from "@/lib/fetch";

const inputClass =
  "w-full text-base tracking-wide text-[#1a1a1a] bg-transparent border-0 border-b border-[#ddd] rounded-none py-1.5 placeholder:text-[#ccc] focus:outline-none focus:border-[#FF4A00] transition-colors duration-200";

export default function PublishPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !slug || !content || !summary) {
      setError("标题、Slug、摘要和内容为必填项");
      return;
    }

    const catList = categories
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const res = await apiFetch("/posts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          summary,
          content,
          categories: catList,
          tags: tags,
          is_published: isPublished,
        }),
      });
      const data = await res.json();
      if (res.ok || res.status === 201) {
        setSuccess(`发布成功！Slug: ${data.slug}`);
        setTitle("");
        setSlug("");
        setSummary("");
        setCategories("");
        setTags([]);
        setTagInput("");
        setContent("");
        setIsPublished(true);
      } else {
        setError(data.detail || "发布失败");
      }
    } catch {
      setError("无法连接服务器");
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="relative min-h-screen bg-[#F8F7F3]">
        <InteractiveGrid />
        <FormPageHero title="发布" />
        <div className="relative z-10 flex justify-center pt-8 pb-16">
          <p className="text-[#999] tracking-wide">加载中...</p>
        </div>
      </div>
    );
  }

  if (user === null || !user.is_admin) {
    return (
      <div className="relative min-h-screen bg-[#F8F7F3]">
        <InteractiveGrid />
        <FormPageHero title="发布" />
        <div className="relative z-10 flex flex-col items-center pt-8 pb-16 gap-6">
          <motion.img
            src="/error.png"
            alt="提示"
            className="w-[400px] h-auto object-contain pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          />
          <p className="text-base text-[#999] tracking-wide">
            仅管理员可访问此页面。请先
            <a href="/login" className="text-[#FF4A00] hover:underline mx-1">
              登录
            </a>
            管理员账号
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <FormPageHero title="发布" />

      <div className="relative z-10 max-w-xl ml-[15%] pl-8 pr-12 pt-0 pb-8 -mt-4 space-y-10">
        <form id="publishForm" onSubmit={handleSubmit} className="space-y-10">
          <FieldRow label="标题" fieldName="标题">
            <input
              type="text"
              className={inputClass}
              placeholder="文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FieldRow>

          <FieldRow label="链接" fieldName="Slug">
            <input
              type="text"
              className={inputClass}
              placeholder="url-friendly-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </FieldRow>

          <FieldRow label="分类" fieldName="分类">
            <input
              type="text"
              className={inputClass}
              placeholder="笔记, 思考, 灵感, 资源"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
          </FieldRow>

          <FieldRow label="标签" fieldName="Tags">
            <div className="space-y-2">
              {/* 已添加的标签 */}
              <div className="flex flex-wrap gap-2 min-h-[28px]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="group relative inline-flex items-center px-2.5 py-0.5 text-sm tracking-wide text-[#1a1a1a] bg-[#f0ece5] rounded-sm cursor-default"
                  >
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="ml-1.5 text-[#bbb] hover:text-[#FF4A00] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {/* 输入行 */}
              <input
                type="text"
                className={inputClass}
                placeholder="输入标签，按回车添加"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = tagInput.trim();
                    if (val && !tags.includes(val)) {
                      setTags([...tags, val]);
                      setTagInput("");
                    }
                  }
                }}
              />
            </div>
          </FieldRow>

          <FieldRow label="摘要" fieldName="摘要">
            <textarea
              className={inputClass}
              rows={2}
              placeholder="简短描述..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </FieldRow>

          <FieldRow label="内容" fieldName="内容（Markdown）">
            <textarea
              className={inputClass}
              rows={14}
              placeholder="在此撰写 Markdown 内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FieldRow>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-[#FA9819]"
            />
            <label htmlFor="isPublished" className="text-sm text-[#555] tracking-wide">
              发布（取消勾选则为草稿）
            </label>
          </div>
        </form>
      </div>

      <div className="relative z-10 flex justify-center pb-16">
        <button
          type="submit"
          form="publishForm"
          disabled={loading}
          className="text-xl font-semibold tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
        >
          {loading ? "发布中..." : "发布文章"}
        </button>
      </div>

      {/* 加载弹窗 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <img
            src="/loading.gif"
            alt="加载中..."
            className="w-84 h-84 object-contain"
          />
        </div>
      )}

      {/* 错误弹窗 */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.img
              src="/error.png"
              alt=""
              className="w-[400px] h-auto object-contain pointer-events-none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            <motion.p
              className="text-base text-[#999] tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {error}
            </motion.p>
            <motion.button
              onClick={() => setError("")}
              className="text-base text-[#1a1a1a] tracking-wide transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              关闭
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* 成功弹窗 */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.img
              src="/success.png"
              alt=""
              className="w-[400px] h-auto object-contain pointer-events-none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            <motion.p
              className="text-xl text-green-600 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {success}
            </motion.p>
            <motion.button
              onClick={() => setSuccess("")}
              className="text-base text-[#1a1a1a] tracking-wide transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              关闭
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
