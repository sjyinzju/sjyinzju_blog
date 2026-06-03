"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { apiFetch } from "@/lib/fetch";
import { getCategoryUrl } from "@/lib/config";
import type { Post } from "@/types/post";

interface TagCount {
  tag: string;
  count: number;
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [topTags, setTopTags] = useState<TagCount[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    apiFetch("/posts/tags/top?limit=5")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTopTags(data))
      .catch(() => {});
  }, []);

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const res = await apiFetch(`/posts/search?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      setResults(await res.json());
    }
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      doSearch(query);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    doSearch(tag);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center bg-white/80 backdrop-blur-lg pt-32"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-xl flex flex-col gap-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* 搜索输入行 — 图片在左，输入框居中 */}
        <div className="relative flex items-center pb-2 border-b border-[#ddd]">
          <img
            src="/search.png"
            alt="搜索"
            className="absolute -left-44 w-36 h-36 object-contain flex-shrink-0"
          />
          <input
            type="text"
            className="w-full text-xl tracking-wide text-[#1a1a1a] bg-transparent border-0 outline-none placeholder:text-[#ccc]"
            placeholder="搜索标题或标签..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {/* 热门标签 */}
        {!searched && topTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#bbb] tracking-wide">常用标签：</span>
            {topTags.map((t) => (
              <button
                key={t.tag}
                onClick={() => handleTagClick(t.tag)}
                className="px-2.5 py-0.5 text-sm tracking-wide text-[#888] bg-[#f0ece5] rounded-sm hover:text-[#FF4A00] transition-colors"
              >
                {t.tag}
              </button>
            ))}
          </div>
        )}

        {/* 搜索结果 */}
        {searched && (
          <div className="max-h-[50vh] overflow-y-auto space-y-6">
            {results.length > 0 ? (
              results.map((post) => (
                <Link
                  key={post.id}
                  href={`/${getCategoryUrl(post.categories[0] || "")}/${post.slug}`}
                  onClick={onClose}
                  className="block group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FF4A00] rounded-full" />
                    <div>
                      <h3 className="text-base font-semibold tracking-wide text-[#1a1a1a] group-hover:text-[#FF4A00] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#888] tracking-wide mt-0.5 line-clamp-1">
                        {post.summary}
                      </p>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs tracking-wide text-[#aaa] bg-[#f5f3ef] rounded-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-[#bbb] tracking-wide">未找到相关文章</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
