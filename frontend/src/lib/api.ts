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
  const res = await fetch(`${API_BASE}/posts/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`请求失败 (${res.status})`);
  return res.json();
}
