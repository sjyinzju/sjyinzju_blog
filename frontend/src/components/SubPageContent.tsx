"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import type { User } from "@/types/user";
import { getCategoryUrl } from "@/lib/config";
import { apiFetch } from "@/lib/fetch";
import InteractiveGrid from "./InteractiveGrid";
import SubPageHero from "./SubPageHero";
import PostListItem from "./PostListItem";

export default function SubPageContent({
  title,
  posts: initialPosts,
  image,
  imageClassName,
  imagePositionClass,
  clipImage,
}: {
  title: string;
  posts: Post[];
  image?: string;
  imageClassName?: string;
  imagePositionClass?: string;
  clipImage?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    apiFetch("/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleDelete = async (slug: string) => {
    const res = await apiFetch(`/posts/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title={title} image={image} imageClassName={imageClassName} imagePositionClass={imagePositionClass} clipImage={clipImage} />

      <div className="relative z-10 ml-[15%] pl-8 pr-8 py-16 space-y-6">
        {posts.map((post) => (
          <PostListItem
            key={post.id}
            title={post.title}
            summary={post.summary}
            date={post.created_at}
            tags={post.tags}
            href={`/${getCategoryUrl(post.categories[0])}/${post.slug}`}
            slug={post.slug}
            isAdmin={user?.is_admin ?? false}
            onDelete={handleDelete}
          />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-[#999] tracking-wide">暂无文章</p>
        )}
      </div>
    </div>
  );
}
