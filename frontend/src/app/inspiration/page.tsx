import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";

export default async function InspirationPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("灵感与分享"));
  return <SubPageContent title="灵感" posts={filtered} />;
}
