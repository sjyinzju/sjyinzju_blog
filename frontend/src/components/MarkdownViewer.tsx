import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-|-$/g, "");
}

// 服务端 rehype 插件：为标题元素注入 id，与 TableOfContents 的 slugify 保持一致
function rehypeHeadingIds() {
  return (tree: any) => {
    const stack = [tree];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        const text = (node.children || [])
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.value)
          .join("")
          .trim();
        if (text) {
          node.properties = node.properties || {};
          if (!node.properties.id) {
            node.properties.id = slugify(text);
          }
        }
      }
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i]);
        }
      }
    }
  };
}

export default function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none [&>h1:first-child]:hidden prose-headings:scroll-mt-32 prose-a:text-[#FF4A00] hover:prose-a:underline prose-ol:list-decimal prose-ul:list-disc">
      <ReactMarkdown rehypePlugins={[rehypeHeadingIds, rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
