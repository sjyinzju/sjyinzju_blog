import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";

export default async function NotesPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("笔记"));
  return <SubPageContent title="笔记" posts={filtered} />;
}
