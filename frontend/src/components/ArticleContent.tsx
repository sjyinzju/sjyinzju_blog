"use client";

import type { Post } from "@/types/post";
import { getCategoryUrl } from "@/lib/config";
import InteractiveGrid from "./InteractiveGrid";
import SubPageHero from "./SubPageHero";
import Link from "next/link";

export default function ArticleContent({ post }: { post: Post }) {
  const backHref = post.tags.length > 0
    ? `/${getCategoryUrl(post.tags[0])}`
    : "/";

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title={post.title} />

      {/* Back arrow */}
      <Link
        href={backHref}
        className="fixed top-[72px] left-6 z-50 text-2xl font-black text-[#FF4A00] transition-transform duration-300 ease-out hover:-translate-y-0.5"
      >
        &larr;
      </Link>

      {/* Article body */}
      <article className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        <div className="text-base leading-loose tracking-wide text-[#444] whitespace-pre-wrap">
          {post.content}
        </div>
        <div className="mt-12 pt-8 border-t border-[#e5e5e5] text-sm text-[#999] tracking-wide">
          {new Date(post.created_at).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </article>
    </div>
  );
}
