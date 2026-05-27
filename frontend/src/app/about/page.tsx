import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";

export default async function AboutPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("关于"));
  return <SubPageContent title="关于" posts={filtered} />;
}
