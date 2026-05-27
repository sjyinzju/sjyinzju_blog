import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";

export default async function ThoughtsPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("思考"));
  return <SubPageContent title="思考" posts={filtered} />;
}
