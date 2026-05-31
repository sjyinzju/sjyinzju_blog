"use client";

import type { Post } from "@/types/post";
import { getCategoryUrl } from "@/lib/config";
import InteractiveGrid from "./InteractiveGrid";
import SubPageHero from "./SubPageHero";
import Link from "next/link";
import MarkdownViewer from "./MarkdownViewer";
import TableOfContents from "./TableOfContents";

export default function ArticleContent({ post }: { post: Post }) {
  const backHref = post.tags.length > 0
    ? `/${getCategoryUrl(post.tags[0])}`
    : "/";

  const hasHeadings = /^#{1,6}\s+/m.test(post.content);

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero
        title={post.title}
        subtitle={new Date(post.created_at).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />

      {/* Back arrow */}
      <Link
        href={backHref}
        className="fixed top-[72px] left-6 z-50 text-2xl font-black text-[#FF4A00] transition-transform duration-300 ease-out hover:-translate-y-0.5"
      >
        &larr;
      </Link>

      {/* Article body */}
      <div className="relative z-10 -mt-16 pb-16 flex flex-col lg:flex-row-reverse gap-16">
        {/* 主内容区 */}
        <article className={`pl-[20vw] md:pl-[24vw] pr-[15%] ${hasHeadings ? "lg:w-3/4" : "w-full"}`}>
          <MarkdownViewer content={post.content} />
        </article>

        {/* 导航大纲区 */}
        {hasHeadings && (
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <TableOfContents markdown={post.content} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
