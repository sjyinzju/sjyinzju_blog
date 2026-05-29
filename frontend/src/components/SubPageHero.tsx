"use client";

import { motion } from "framer-motion";

export default function SubPageHero({ title, image, imageClassName, imagePositionClass, clipImage }: { title: string; image?: string; imageClassName?: string; imagePositionClass?: string; clipImage?: number | boolean }) {
  const partialRight = typeof clipImage === "number" ? clipImage : 0;

  return (
    <section className="relative h-[60vh] overflow-hidden pt-16">
      {/* 橙色背景弧线 */}
      <motion.svg
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{ height: "100%" }}
        viewBox="0 0 1440 750"
        preserveAspectRatio="none"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <path
          d="M 1440 460 Q 840 750 0 370 L 0 0 L 1440 0 Z"
          fill="#FA9819"
        />
      </motion.svg>

      {/* 装饰图片 */}
      {image && (
        <motion.div
          className={`absolute z-[5] left-[62%] -translate-x-1/2 ${imagePositionClass || "bottom-[8%] md:bottom-[3.2%]"}`}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <img
            src={image}
            alt="hero decor"
            className={`w-auto object-contain pointer-events-none drop-shadow-2xl ${imageClassName || "h-[35vh] md:h-[55vh]"}`}
          />
        </motion.div>
      )}

      {/* 全宽曲线遮罩：遮挡图片超出橙色曲线的部分 (clipImage=true) */}
      {image && clipImage === true && (
        <motion.svg
          className="absolute top-0 left-0 w-full pointer-events-none z-[6]"
          style={{ height: "100%" }}
          viewBox="0 0 1440 750"
          preserveAspectRatio="none"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <path
            d="M 0 370 Q 840 750 1440 460 L 1440 750 L 0 750 Z"
            fill="#F8F7F3"
          />
        </motion.svg>
      )}

      {/* 部分曲线遮罩：只遮挡右侧 N% 超出曲线的部分 (clipImage=number) */}
      {image && partialRight > 0 && partialRight < 100 && (
        <motion.svg
          className="absolute top-0 left-0 w-full pointer-events-none z-[6]"
          style={{ height: "100%" }}
          viewBox="0 0 1440 750"
          preserveAspectRatio="none"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <defs>
            <clipPath id="partialOverlayClip">
              <rect
                x={(1440 * (100 - partialRight)) / 100}
                y="0"
                width={(1440 * partialRight) / 100}
                height="750"
              />
            </clipPath>
          </defs>
          <path
            d="M 0 370 Q 840 750 1440 460 L 1440 750 L 0 750 Z"
            fill="#F8F7F3"
            clipPath="url(#partialOverlayClip)"
          />
        </motion.svg>
      )}

      {/* 页面标题 */}
      <motion.div
        className="absolute top-[30%] left-0 right-0 z-10 pl-[18vw] md:pl-[22vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-wide text-[#FF4A00]">
          {title}
        </h1>
      </motion.div>
    </section>
  );
}
