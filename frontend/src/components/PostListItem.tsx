"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Ruby: "#701516",
  Shell: "#89e051",
  Vue: "#41b883",
  PHP: "#4F5D95",
  Lua: "#000080",
  R: "#198CE7",
  Makefile: "#427819",
  Dockerfile: "#384d54",
  Jupyter: "#DA5B0B",
  MDX: "#1fc297",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface PostListItemProps {
  title: string;
  summary: string | null;
  date: string;
  href?: string;
  externalUrl?: string;
  stars?: number;
  language?: string | null;
  tags?: string[];
  slug?: string;
  isAdmin?: boolean;
  onDelete?: (slug: string) => void;
}

export default function PostListItem({
  title,
  summary,
  date,
  href,
  externalUrl,
  stars,
  language,
  tags,
  slug,
  isAdmin,
  onDelete,
}: PostListItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const linkClass =
    "inline-block text-lg font-semibold tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]";

  return (
    <motion.div
      ref={ref}
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Date */}
      <div className="w-[80px] flex-shrink-0 text-right text-sm tracking-wide text-[#bbb] whitespace-nowrap">
        {formatDate(date)}
      </div>

      {/* Orange vertical line */}
      <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FF4A00] rounded-full" />

      {/* Inner content: left-right split */}
      <div className="flex flex-row justify-between items-start w-full">
        {/* Left: Title + Summary */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            {externalUrl ? (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {title}
              </a>
            ) : href ? (
              <Link href={href} className={linkClass}>
                {title}
              </Link>
            ) : (
              <span className={linkClass}>{title}</span>
            )}
            {isAdmin && slug && onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[#bbb] hover:text-[#FF4A00] hover:bg-[#f0ece5] transition-colors text-xs leading-none"
                title="删除"
              >
                ×
              </button>
            )}
          </div>
          {summary && (
            <p className="text-base leading-relaxed tracking-wide text-[#888] mt-1 line-clamp-2">
              {summary}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs tracking-wide text-[#888] bg-[#f0ece5] rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: GitHub meta */}
        <div className="flex-shrink-0 flex items-center gap-4 mt-1">
          {stars !== undefined && (
            <>
              {language && (
                <span className="flex items-center gap-1.5 text-sm text-[#888]">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        LANGUAGE_COLORS[language] || "#bbb",
                    }}
                  />
                  {language}
                </span>
              )}
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-sm text-[#666] border border-[#ddd] rounded-full flex-shrink-0">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="text-[#eac54f]"
                >
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
                </svg>
                {stars}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
          >
            <p className="text-xl font-semibold text-[#1a1a1a] tracking-wide mb-2">
              确认删除
            </p>
            <p className="text-base text-[#888] tracking-wide mb-8">
              删除后文章将不再公开展示，可在数据库中恢复。
            </p>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="text-base font-medium tracking-wide text-[#888] hover:text-[#FF4A00] transition-colors"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  if (!slug || !onDelete) return;
                  setDeleting(true);
                  await onDelete(slug);
                  setDeleting(false);
                  setShowConfirm(false);
                }}
                disabled={deleting}
                className="text-base font-medium tracking-wide text-[#FF4A00] hover:text-[#e04300] transition-colors disabled:opacity-50"
              >
                {deleting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
