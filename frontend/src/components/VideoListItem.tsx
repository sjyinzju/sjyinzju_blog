"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { BilibiliVideo } from "@/lib/bilibili";

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatCount(n: number): string {
  if (n >= 10000) {
    return (n / 10000).toFixed(1) + "万";
  }
  return String(n);
}

export default function VideoListItem({ video }: { video: BilibiliVideo }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <motion.div
      ref={ref}
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Date */}
      <div className="w-[80px] flex-shrink-0 text-right text-sm tracking-wide text-[#bbb] whitespace-nowrap">
        {video.pubdate ? formatDate(video.pubdate) : ""}
      </div>

      {/* Orange vertical line */}
      <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FF4A00] rounded-full" />

      {/* Inner content: left-right split */}
      <div className="flex flex-row justify-between items-start w-full">
        {/* Left: cover + title/desc */}
        <div className="flex items-start gap-4 flex-1 min-w-0 pr-6">
          {/* Cover image */}
          <a
            href={`https://www.bilibili.com/video/${video.bvid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 block"
          >
            <img
              src={video.cover}
              alt={video.title}
              referrerPolicy="no-referrer"
              className="w-[160px] h-[90px] object-cover rounded-md"
              loading="lazy"
            />
          </a>

          {/* Title + Description */}
          <div className="flex-1 min-w-0">
            <a
              href={`https://www.bilibili.com/video/${video.bvid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-lg font-semibold tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
            >
              {video.title}
            </a>
            {video.desc && (
              <p className="text-base leading-relaxed tracking-wide text-[#888] mt-1 line-clamp-2">
                {video.desc}
              </p>
            )}
          </div>
        </div>

        {/* Right: Metrics */}
        <div className="flex-shrink-0 flex flex-col gap-1 text-right">
          <span className="text-sm text-[#888] tracking-wide">
            播放 {formatCount(video.view)}
          </span>
          <span className="text-sm text-[#888] tracking-wide">
            点赞 {formatCount(video.like)}
          </span>
          <span className="text-sm text-[#888] tracking-wide">
            投币 {formatCount(video.coin)}
          </span>
          <span className="text-sm text-[#888] tracking-wide">
            收藏 {formatCount(video.favorite)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
