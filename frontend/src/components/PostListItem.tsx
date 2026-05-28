"use client";

import Link from "next/link";
import { useRef } from "react";
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
}

export default function PostListItem({
  title,
  summary,
  date,
  href,
  externalUrl,
  stars,
  language,
}: PostListItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

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

      <div className="flex-1 min-w-0 flex items-center">
        <div className="flex-1 min-w-0">
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
          {summary && (
            <p className="text-base leading-relaxed tracking-wide text-[#888] mt-1 line-clamp-2">
              {summary}
            </p>
          )}
        </div>

        {/* Right: GitHub meta */}
        {stars !== undefined ? (
          <div className="flex-shrink-0 flex items-center justify-end gap-2.5 pl-4">
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
          </div>
        ) : (
          <div className="w-[80px] flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}
