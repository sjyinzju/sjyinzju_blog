"use client";

import { useRouter } from "next/navigation";

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#FF4A00] mb-4">加载失败</h1>
        <p className="text-sm text-[#888] tracking-wide mb-8">
          {error.message || "文章页面加载出现问题"}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="text-[#FF4A00] tracking-wide hover:-translate-y-0.5 transition-transform"
          >
            重试
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-[#888] tracking-wide hover:-translate-y-0.5 transition-transform"
          >
            &larr; 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
