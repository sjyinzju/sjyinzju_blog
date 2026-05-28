import { getOriginalRepos } from "@/lib/github";
import InteractiveGrid from "@/components/InteractiveGrid";
import SubPageHero from "@/components/SubPageHero";
import PostListItem from "@/components/PostListItem";

export default async function ProjectsPage() {
  const repos = await getOriginalRepos("sjyinzju");
  const sorted = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title="项目开发" />

      <div className="relative z-10 max-w-2xl ml-[15%] pl-8 pr-8 py-16 space-y-10">
        {sorted.map((repo) => (
          <PostListItem
            key={repo.id}
            title={repo.name}
            summary={repo.description}
            date={repo.updated_at}
            stars={repo.stargazers_count}
            language={repo.language}
            externalUrl={repo.html_url}
          />
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-[#999] tracking-wide">暂无项目</p>
        )}
      </div>
    </div>
  );
}
