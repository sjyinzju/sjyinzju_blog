import ReactMarkdown from "react-markdown";

export default function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
}
