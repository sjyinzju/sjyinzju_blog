import { getBilibiliVideos } from "@/lib/bilibili";
import InteractiveGrid from "@/components/InteractiveGrid";
import SubPageHero from "@/components/SubPageHero";
import VideoListItem from "@/components/VideoListItem";
import videosImg from "../../../pictures/videos.png";

export default async function VideosPage() {
  const videos = await getBilibiliVideos();
  console.log("=== B站真实精选视频数据拉取成功 ===", videos);

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title="视频" image={videosImg.src} imageClassName="h-[20vh] md:h-[35vh]" imagePositionClass="bottom-[26%] md:bottom-[22%] left-[65%]" />

      <div className="relative z-10 max-w-5xl ml-[15%] pl-8 pr-12 pt-0 pb-16 -mt-20 space-y-10">
        {videos.map((video) => (
          <VideoListItem key={video.bvid} video={video} />
        ))}
        {videos.length === 0 && (
          <p className="text-center text-[#999] tracking-wide">暂无视频</p>
        )}
      </div>
    </div>
  );
}
