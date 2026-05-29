import type { GithubRepo } from "@/types/github";

const CONTRIBUTED_REPOS: string[] = [
  "Marigold1122/WebUtau",
];

async function fetchContributedRepos(): Promise<GithubRepo[]> {
  if (CONTRIBUTED_REPOS.length === 0) return [];

  const results = await Promise.all(
    CONTRIBUTED_REPOS.map(async (repoFullName) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repoFullName}`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) return null;
        return res.json() as Promise<GithubRepo>;
      } catch {
        return null;
      }
    })
  );

  return results.filter((r): r is GithubRepo => r !== null);
}

export async function getOriginalRepos(username: string): Promise<{
  own: GithubRepo[];
  contributed: GithubRepo[];
}> {
  try {
    const [ownRepos, contributedRepos] = await Promise.all([
      fetch(
        `https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=50`,
        { next: { revalidate: 300 } }
      ).then((res) => (res.ok ? (res.json() as Promise<GithubRepo[]>) : [])),
      fetchContributedRepos(),
    ]);

    return {
      own: ownRepos.filter((repo) => repo.fork === false).sort((a, b) => b.stargazers_count - a.stargazers_count),
      contributed: contributedRepos.filter((repo) => repo.fork === false).sort((a, b) => b.stargazers_count - a.stargazers_count),
    };
  } catch {
    return { own: [], contributed: [] };
  }
}
