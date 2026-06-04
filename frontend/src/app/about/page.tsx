"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import InteractiveGrid from "@/components/InteractiveGrid";
import SubPageHero from "@/components/SubPageHero";
import SocialListItem from "@/components/SocialListItem";
import ActivityCalendar from "@/components/ActivityCalendar";
import { getCategoryUrl } from "@/lib/config";
import { apiFetch } from "@/lib/fetch";
import type { SocialAccount } from "@/components/SocialListItem";
import aboutImg from "../../../pictures/about.png";

const accounts: SocialAccount[] = [
  {
    platform: "GitHub",
    avatar: "https://github.com/sjyinzju.png",
    username: "Sjy_in_zju",
    link: "https://github.com/sjyinzju",
    bio: "sjyinzju",
  },
  {
    platform: "B站",
    avatar: "/bilibili-avatar.jpg",
    username: "Takagi_loving",
    link: "https://space.bilibili.com/542036974",
    bio: "为能够成为自己而挺起胸膛",
    localAvatar: true,
  },
  {
    platform: "QQ",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=2129381179&s=640",
    username: "2129381179",
    link: null,
    bio: "凉宫春日应援团视频组、开发组成员",
  },
];

interface DayDetail {
  date: string;
  posts: {
    title: string;
    slug: string;
    summary: string;
    categories: string[];
    tags: string[];
    created_at: string;
  }[];
  comments: {
    id: number;
    user_id: number;
    username: string;
    content: string;
    post_id: number;
    created_at: string;
  }[];
}

export default function AboutPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetails, setDayDetails] = useState<DayDetail | null>(null);

  const handleDateClick = async (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      setDayDetails(null);
      return;
    }
    setSelectedDate(date);
    const res = await apiFetch(`/stats/activity?date=${date}`);
    if (res.ok) {
      setDayDetails(await res.json());
    } else {
      setDayDetails(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero
        title="关于"
        image={aboutImg.src}
        imageClassName="h-[24vh] md:h-[40vh]"
        imagePositionClass="bottom-[23%] md:bottom-[19.9%] left-[63%]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-0 pb-16 -mt-16">
        <h3 className="text-2xl font-bold tracking-wide text-[#1a1a1a] mb-10 ml-[15%]">
          为能够成为自己而挺起胸膛
        </h3>

        {/* 双栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左栏：社交账号 */}
          <div className="space-y-8 ml-[15%] lg:ml-0">
            {accounts.map((account) => (
              <SocialListItem key={account.platform} account={account} />
            ))}
          </div>

          {/* 右栏：活跃度热力图 */}
          <div className="lg:pt-0 overflow-hidden min-w-0">
            <ActivityCalendar onSelectDate={handleDateClick} />
          </div>
        </div>

        {/* 下钻详情 */}
        {selectedDate && dayDetails && (
          <motion.div
            className="mt-12 border-t border-[#e5e5e5] pt-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          >
            <h3 className="text-lg font-bold text-[#1a1a1a] tracking-wide mb-6">
              {selectedDate} 动态
            </h3>

            {dayDetails.posts.length === 0 && dayDetails.comments.length === 0 && (
              <p className="text-sm text-[#bbb] tracking-wide">这天没有动态</p>
            )}

            {/* 文章 */}
            {dayDetails.posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${getCategoryUrl(post.categories[0] || "")}/${post.slug}`}
                className="block group mb-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FF4A00] rounded-full" />
                  <div>
                    <span className="text-xs text-[#FA9819] font-medium tracking-wide bg-[#fff7ed] px-2 py-0.5 rounded-sm">
                      文章
                    </span>
                    <h4 className="text-base font-semibold text-[#1a1a1a] mt-1 group-hover:text-[#FF4A00] transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-sm text-[#888] tracking-wide mt-1 line-clamp-2">
                      {post.summary}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {/* 评论 */}
            {dayDetails.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 mb-4">
                <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FA9819] rounded-full" />
                <div>
                  <span className="text-xs text-[#888] font-medium tracking-wide bg-[#f5f5f5] px-2 py-0.5 rounded-sm">
                    评论
                  </span>
                  <p className="text-sm font-medium text-[#1a1a1a] mt-1">
                    {comment.username}
                  </p>
                  <p className="text-sm text-[#666] tracking-wide mt-0.5">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
