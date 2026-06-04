"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  const errorCode = error.digest || "500";
  const reason = error.message || "未知错误";

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#F8F7F3] flex items-center justify-center font-sans">
        <div className="relative max-w-md w-full mx-8 text-center">
          {/* 错误插图 */}
          <div className="mb-10 flex justify-center">
            <img
              src="/error.png"
              alt=""
              className="w-[400px] h-auto object-contain pointer-events-none"
            />
          </div>

          {/* 错误代码 */}
          <p className="text-3xl font-bold text-[#FF4A00] tracking-wide mb-6">
            {errorCode}
          </p>

          {/* 错误原因 */}
          <p className="text-sm text-[#888] tracking-wide leading-relaxed mb-10 px-4">
            {reason}
          </p>

          {/* 操作按钮组 */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={reset}
              className="px-8 py-2.5 rounded-full text-sm font-medium tracking-wide text-white bg-[#FF4A00] hover:bg-[#e04300] transition-colors duration-200"
            >
              重试
            </button>
            <Link
              href="/"
              className="px-8 py-2.5 rounded-full text-sm font-medium tracking-wide text-[#888] border border-[#ddd] hover:border-[#FF4A00] hover:text-[#FF4A00] transition-colors duration-200"
            >
              退出到首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
