"use client";

import type { Post } from "@/types/post";
import InteractiveGrid from "./InteractiveGrid";
import SubPageHero from "./SubPageHero";
import PostListItem from "./PostListItem";

export default function SubPageContent({
  title,
  posts,
}: {
  title: string;
  posts: Post[];
}) {
  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title={title} />

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16 space-y-6">
        {posts.map((post) => (
          <PostListItem key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-[#999] tracking-wide">暂无文章</p>
        )}
      </div>
    </div>
  );
}
