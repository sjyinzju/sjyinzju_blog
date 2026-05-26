"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import HeroSection from "./HeroSection";
import SectionBlock from "./SectionBlock";
import HighlightText from "./HighlightText";
import InteractiveGrid from "./InteractiveGrid";

const sections = [
  {
    title: "笔记",
    align: "left" as const,
    content: (
      <>
        这里记录着我的技术笔记与学习心得。从
        <HighlightText delay={0.8}>前端工程化</HighlightText>到后端架构，从算法思维到系统设计。每一篇文章都是对知识的梳理与沉淀，力求用简洁的语言把复杂的概念讲清楚。
      </>
    ),
  },
  {
    title: "思考",
    align: "right" as const,
    content: (
      <>
        技术之外，我热衷于思考
        <HighlightText delay={0.8}>产品与人的关系</HighlightText>。好的产品不只是代码的堆砌，而是对用户行为的深刻理解。在这里，我会分享关于产品设计、用户体验和职业成长的一些想法。
      </>
    ),
  },
  {
    title: "视频",
    align: "left" as const,
    content: (
      <>
        用影像记录创作的过程。从
        <HighlightText delay={0.8}>教程录制</HighlightText>到 Vlog 拍摄，从剪辑技巧到内容策划。视频是一种更直观的表达方式，让我能够用画面和声音传递更多的想法与故事。
      </>
    ),
  },
  {
    title: "项目开发",
    align: "right" as const,
    content: (
      <>
        从 0 到 1 构建产品的全过程。涵盖
        <HighlightText delay={0.8}>全栈开发</HighlightText>、性能优化、部署运维。每一个项目都是一次完整的实践，从需求分析到技术选型，从代码实现到上线交付。
      </>
    ),
  },
  {
    title: "灵感与分享",
    align: "left" as const,
    content: (
      <>
        收集那些一闪而过的
        <HighlightText delay={0.8}>创意火花</HighlightText>。好的灵感往往来源于跨界的碰撞——设计、摄影、音乐、文学。这里是我收集和分享那些让我眼前一亮的事物的角落。
      </>
    ),
  },
  {
    title: "资源",
    align: "right" as const,
    content: (
      <>
        整理和分享我常用的
        <HighlightText delay={0.8}>工具与资源</HighlightText>。从开发环境的配置到效率工具的推荐，从学习资料到设计素材。好的工具能让创作事半功倍，这里是我筛选过的实用清单。
      </>
    ),
  },
  {
    title: "关于",
    align: "left" as const,
    content: (
      <>
        我是
        <HighlightText delay={0.8}>开发者、写作者、跑者、剪辑师、UP主、创造者</HighlightText>
        。多重身份的背后，是对创造这件事始终如一的热爱。这个博客是我在数字世界的一片自留地，欢迎你来逛逛。
      </>
    ),
  },
];

export default function PageContent() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -180]);

  return (
    <>
      {/* Parallax Hero wrapper — clipped at 100vh, no gap */}
      <div className="h-screen overflow-hidden relative z-0 bg-[#F8F7F3]">
        <motion.div style={{ y: heroY }}>
          <HeroSection />
        </motion.div>
      </div>

      {/* Zigzag content sections — continuous dot grid */}
      <div className="relative z-10 bg-[#F8F7F3]">
        <InteractiveGrid />
        {sections.map((s) => (
          <SectionBlock
            key={s.title}
            title={s.title}
            content={s.content}
            align={s.align}
          />
        ))}
      </div>
    </>
  );
}
