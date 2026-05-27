import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";

export default async function VideosPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("视频"));
  return <SubPageContent title="视频" posts={filtered} />;
}
