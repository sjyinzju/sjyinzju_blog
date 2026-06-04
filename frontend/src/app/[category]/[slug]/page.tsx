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
  } catch (err) {
    // 非 404 的错误（网络故障、500 等）向上抛出，触发 error.tsx
    throw err;
  }

  if (!post) return <NotFound />;
  return (
    <ArticleContent post={post}>
      <MarkdownViewer content={post.content} />
      <CommentsSection slug={slug} />
    </ArticleContent>
  );
}
