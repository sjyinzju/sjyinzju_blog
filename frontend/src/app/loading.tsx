export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F7F3] bg-opacity-80 backdrop-blur-sm">
      <img
        src="/loading.gif"
        alt="加载中..."
        className="w-84 h-84 object-contain"
      />
    </div>
  );
}
