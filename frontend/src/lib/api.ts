import type { Post } from "@/types/post";

const API_BASE = "http://localhost:8000";

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE}/posts/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
