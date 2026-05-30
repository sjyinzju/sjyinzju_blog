"use client";

import { motion } from "framer-motion";

const LINES = ["解放思想", "实事求是", "守正创新"];

function MottoLine({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      className="relative inline-block text-xl md:text-2xl font-medium tracking-[0.15em] text-[#1a1a1a]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.8 + index * 0.2,
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      · {text}
      <motion.span
        className="absolute bottom-0 left-0 w-full h-[0.45em] pointer-events-none"
        style={{
          background: "rgba(255, 74, 0, 0.45)",
          transformOrigin: "left",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          delay: 1.1 + index * 0.2,
          duration: 0.55,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
    </motion.div>
  );
}

export default function MottoLines() {
  return (
    <div className="flex flex-col gap-2 items-start">
      {LINES.map((text, i) => (
        <MottoLine key={text} text={text} index={i} />
      ))}
    </div>
  );
}
