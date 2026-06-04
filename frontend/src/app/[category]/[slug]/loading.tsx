export default function ArticleLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
      <img
        src="/loading.gif"
        alt="加载中..."
        className="w-84 h-84 object-contain"
      />
    </div>
  );
}
