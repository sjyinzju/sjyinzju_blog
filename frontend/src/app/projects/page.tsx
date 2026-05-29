import { getOriginalRepos } from "@/lib/github";
import InteractiveGrid from "@/components/InteractiveGrid";
import SubPageHero from "@/components/SubPageHero";
import PostListItem from "@/components/PostListItem";

const sectionTitleClass = "text-2xl font-bold tracking-wide text-[#1a1a1a] mb-6";

export default async function ProjectsPage() {
  const { own, contributed } = await getOriginalRepos("sjyinzju");

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title="项目开发" />

      <div className="relative z-10 max-w-5xl ml-[15%] pl-8 pr-12 py-16 space-y-10">
        {/* Own projects section */}
        {own.length > 0 && (
          <>
            <h3 className={sectionTitleClass}>我开发的项目</h3>
            {own.map((repo) => (
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
          </>
        )}

        {/* Contributed projects section */}
        {contributed.length > 0 && (
          <>
            <h3 className={sectionTitleClass}>我参与的项目</h3>
            {contributed.map((repo) => (
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
          </>
        )}

        {own.length === 0 && contributed.length === 0 && (
          <p className="text-center text-[#999] tracking-wide">暂无项目</p>
        )}
      </div>
    </div>
  );
}
