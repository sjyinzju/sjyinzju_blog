import { getPost } from "@/lib/api";
import ArticleContent from "@/components/ArticleContent";
import NotFound from "@/app/not-found";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getPost(slug);
  } catch {
    return <NotFound />;
  }

  if (!post) return <NotFound />;
  return <ArticleContent post={post} />;
}
