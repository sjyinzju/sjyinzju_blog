"use client";

import { motion } from "framer-motion";
import Typewriter from "./Typewriter";
import MottoLines from "./MottoLines";

export default function HeroSection({ image, imageClassName, imagePositionClass, clipImage }: { image?: string; imageClassName?: string; imagePositionClass?: string; clipImage?: boolean }) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Orange shape slides in from top */}
      <motion.svg
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{ height: "90%" }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <path
          d="M 1440 700 Q 840 940 0 500 L 0 0 L 1440 0 Z"
          fill="#FA9819"
        />
      </motion.svg>

      {/* 装饰图片 */}
      {image && (
        <motion.div
          className={`absolute z-[5] left-[68%] -translate-x-1/2 ${imagePositionClass || "bottom-[8%] md:bottom-[3.2%]"}`}
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

      {/* 曲线下方遮罩层 */}
      {image && clipImage && (
        <motion.svg
          className="absolute top-0 left-0 w-full pointer-events-none z-[6]"
          style={{ height: "90%" }}
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <path
            d="M 0 500 Q 840 940 1440 700 L 1440 815 L 0 815 Z"
            fill="#F8F7F3"
          />
        </motion.svg>
      )}

      {/* Typewriter floats up from below */}
      <motion.div
        className="absolute top-[22vh] left-0 right-0 z-10 pl-[18vw] md:pl-[22vw]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <Typewriter />
      </motion.div>

      {/* Motto lines */}
      <div className="absolute top-[38vh] left-0 right-0 z-10 pl-[18vw] md:pl-[22vw]">
        <MottoLines />
      </div>
    </section>
  );
}
