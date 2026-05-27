import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";

export default async function ProjectsPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("项目开发"));
  return <SubPageContent title="项目开发" posts={filtered} />;
}
