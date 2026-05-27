import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#FF4A00] mb-4">404</h1>
        <p className="text-lg text-[#888] tracking-wide mb-8">
          页面不存在
        </p>
        <Link
          href="/"
          className="inline-block text-[#FF4A00] tracking-wide hover:-translate-y-0.5 transition-transform"
        >
          &larr; 返回首页
        </Link>
      </div>
    </div>
  );
}
