"use client";

import type { Post } from "@/types/post";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroSection from "./HeroSection";
import SectionBlock from "./SectionBlock";
import HighlightText from "./HighlightText";
import InteractiveGrid from "./InteractiveGrid";
const TAG_ORDER = ["笔记", "思考", "视频", "项目开发", "灵感与分享", "资源", "关于"];

const alignMap: Record<string, "left" | "right"> = {
  "笔记": "left",
  "思考": "right",
  "视频": "left",
  "项目开发": "right",
  "灵感与分享": "left",
  "资源": "right",
  "关于": "left",
};

const descriptions: Record<string, React.ReactNode> = {
  "笔记": <>这里记录着我的技术笔记与学习心得。从<HighlightText delay={0.8}>前端工程化</HighlightText>到后端架构，从算法思维到系统设计。</>,
  "思考": <>技术之外，我热衷于思考<HighlightText delay={0.8}>产品与人的关系</HighlightText>。好的产品不只是代码的堆砌，而是对用户行为的深刻理解。</>,
  "视频": <>用影像记录创作的过程。从<HighlightText delay={0.8}>教程录制</HighlightText>到 Vlog 拍摄，从剪辑技巧到内容策划。</>,
  "项目开发": <>从 0 到 1 构建产品的全过程。涵盖<HighlightText delay={0.8}>全栈开发</HighlightText>、性能优化、部署运维。</>,
  "灵感与分享": <>收集那些一闪而过的<HighlightText delay={0.8}>创意火花</HighlightText>。好的灵感往往来源于跨界的碰撞。</>,
  "资源": <>整理和分享我常用的<HighlightText delay={0.8}>工具与资源</HighlightText>。好的工具能让创作事半功倍。</>,
  "关于": <>我是<HighlightText delay={0.8}>开发者、写作者、跑者、剪辑师、UP主、创造者</HighlightText>。多重身份的背后，是对创造这件事始终如一的热爱。</>,
};

export default function PageContent({ posts }: { posts: Post[] }) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -180]);

  const sections = TAG_ORDER.map((tag) => {
    return {
      title: tag,
      align: alignMap[tag],
      content: (
        <div>
          <p className="mb-6">{descriptions[tag]}</p>
        </div>
      ),
    };
  });

  return (
    <div className="relative bg-[#F8F7F3]">
      <InteractiveGrid />

      <div className="h-screen overflow-hidden relative z-0">
        <motion.div style={{ y: heroY }}>
          <HeroSection />
        </motion.div>
      </div>

      <div className="relative z-10">
        {sections.map((s) => (
          <SectionBlock
            key={s.title}
            title={s.title}
            content={s.content}
            align={s.align}
          />
        ))}
      </div>
    </div>
  );
}
