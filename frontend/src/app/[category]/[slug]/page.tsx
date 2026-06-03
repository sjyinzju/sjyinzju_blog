import { getPost } from "@/lib/api";
import ArticleContent from "@/components/ArticleContent";
import MarkdownViewer from "@/components/MarkdownViewer";
import CommentsSection from "@/components/CommentsSection";
import NotFound from "@/app/not-found";

export const dynamic = "force-dynamic";

export default async function CategoryPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getPost(slug);
  } catch {
    return <NotFound />;
  }

  if (!post) return <NotFound />;
  return (
    <ArticleContent post={post}>
      <MarkdownViewer content={post.content} />
      <CommentsSection slug={slug} />
    </ArticleContent>
  );
}
