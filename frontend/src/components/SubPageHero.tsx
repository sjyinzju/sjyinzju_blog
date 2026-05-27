"use client";

import { motion } from "framer-motion";

export default function SubPageHero({ title }: { title: string }) {
  return (
    <section className="relative h-[35vh] overflow-hidden pt-16">
      {/* Small orange section */}
      <motion.svg
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{ height: "100%" }}
        viewBox="0 0 1440 350"
        preserveAspectRatio="none"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <path
          d="M 1440 270 Q 840 350 0 230 L 0 0 L 1440 0 Z"
          fill="#FA9819"
        />
      </motion.svg>

      {/* Title */}
      <motion.div
        className="absolute top-[50%] left-0 right-0 z-10 pl-[18vw] md:pl-[22vw]"
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
