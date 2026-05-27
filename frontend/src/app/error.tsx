"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#FF4A00] mb-4">
          出错了
        </h1>
        <p className="text-[#888] tracking-wide mb-8">
          页面加载出现问题
        </p>
        <button
          onClick={reset}
          className="text-[#FF4A00] tracking-wide hover:-translate-y-0.5 transition-transform"
        >
          重试
        </button>
      </div>
    </div>
  );
}
