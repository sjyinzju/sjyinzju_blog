import { getPosts } from "@/lib/api";
import PageContent from "@/components/PageContent";

export default async function Home() {
  const posts = await getPosts();
  return <PageContent posts={posts} />;
}
