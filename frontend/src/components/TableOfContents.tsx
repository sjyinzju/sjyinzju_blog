"use client";

import { useMemo } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function TableOfContents({ markdown }: { markdown: string }) {
  const entries = useMemo<TocEntry[]>(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const result: TocEntry[] = [];
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      result.push({ id: slugify(text), text, level });
    }
    return result;
  }, [markdown]);

  if (entries.length === 0) return null;

  return (
    <nav className="space-y-1">
      <h2 className="text-sm font-semibold tracking-wide text-[#999] uppercase mb-4">
        目录
      </h2>
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          className={`block text-sm leading-relaxed text-[#888] hover:text-[#FF4A00] transition-colors duration-300 whitespace-normal break-words ${
            entry.level === 1
              ? ""
              : entry.level === 2
              ? "ml-2"
              : entry.level === 3
              ? "ml-4"
              : entry.level === 4
              ? "ml-6"
              : entry.level === 5
              ? "ml-8"
              : "ml-10"
          }`}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  );
}
