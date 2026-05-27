import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";

export default async function ResourcesPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("资源"));
  return <SubPageContent title="资源" posts={filtered} />;
}
