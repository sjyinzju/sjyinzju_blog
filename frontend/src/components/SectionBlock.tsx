"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

interface Props {
  title: string;
  content: React.ReactNode;
  align: "left" | "right";
  href?: string;
}

export default function SectionBlock({ title, content, align, href }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const isLeft = align === "left";

  const titleElement = href ? (
    <Link
      href={href}
      className="inline-block text-2xl font-bold mb-6 tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
    >
      {title}
    </Link>
  ) : (
    <h2 className="text-2xl font-bold mb-6 tracking-wide text-[#1a1a1a]">
      {title}
    </h2>
  );

  return (
    <section
      ref={ref}
      className={`min-h-[40vh] flex items-center max-w-4xl mx-auto px-8 py-6 gap-6 ${
        isLeft ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {/* Decorative wavy line */}
      <div className="w-10 flex-shrink-0 flex justify-center">
        <svg
          width="2"
          height="200"
          viewBox="0 0 2 200"
          fill="none"
          className="overflow-visible"
        >
          <motion.path
            d="M 1 0 C 0 35, 2 70, 1 100 C 0 130, 2 165, 1 200"
            stroke="#FF4A00"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
        </svg>
      </div>

      {/* Text block */}
      <motion.div
        className="flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.76, 0, 0.24, 1] }}
      >
        {titleElement}
        <div className="text-base leading-loose tracking-wide text-[#666]">
          {content}
        </div>
      </motion.div>
    </section>
  );
}
