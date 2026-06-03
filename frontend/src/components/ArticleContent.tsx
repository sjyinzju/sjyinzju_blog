"use client";

import type { Post } from "@/types/post";
import { getCategoryUrl } from "@/lib/config";
import SubPageHero from "./SubPageHero";
import Link from "next/link";
import TableOfContents from "./TableOfContents";

export default function ArticleContent({ post, children }: { post: Post; children: React.ReactNode }) {
  const backHref = post.categories.length > 0
    ? `/${getCategoryUrl(post.categories[0])}`
    : "/";

  const hasHeadings = /^#{1,6}\s+/m.test(post.content);

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
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
      <div className="relative z-10 -mt-16 pb-16 flex flex-col lg:flex-row-reverse gap-8">
        {/* 主内容区 */}
        <article className={`pr-[10%] w-full ${hasHeadings ? "lg:flex-1 pl-[4vw] md:pl-[8vw]" : "pl-[22vw] md:pl-[26vw]"}`}>
          {children}
        </article>

        {/* 导航大纲区 */}
        {hasHeadings && (
          <aside className="hidden lg:block lg:w-1/5 pl-12">
            <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <TableOfContents markdown={post.content} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
