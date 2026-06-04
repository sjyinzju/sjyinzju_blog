"use client";

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center gap-6">
      <img
        src="/error.png"
        alt=""
        className="w-[400px] h-auto object-contain pointer-events-none"
      />
      <p className="text-base text-[#999] tracking-wide">
        {error.message || "文章加载失败"}
      </p>
      <button
        onClick={reset}
        className="text-base text-[#1a1a1a] tracking-wide transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
      >
        重试
      </button>
    </div>
  );
}
