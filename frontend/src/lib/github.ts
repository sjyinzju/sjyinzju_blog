import type { GithubRepo } from "@/types/github";

export async function getOriginalRepos(username: string): Promise<GithubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=50`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const repos: GithubRepo[] = await res.json();
    return repos.filter((repo) => repo.fork === false);
  } catch {
    return [];
  }
}
