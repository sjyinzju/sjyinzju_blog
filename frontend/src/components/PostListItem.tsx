"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Post } from "@/types/post";

export default function PostListItem({ post }: { post: Post }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <motion.div
      ref={ref}
      className="flex gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Orange vertical line */}
      <div className="w-[2px] flex-shrink-0 bg-[#FF4A00] rounded-full" />

      <div className="flex-1 min-w-0">
        <Link
          href={`/posts/${post.slug}`}
          className="inline-block text-base font-semibold tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
        >
          {post.title}
        </Link>
        <p className="text-sm leading-relaxed tracking-wide text-[#888] mt-1 line-clamp-2">
          {post.summary}
        </p>
      </div>
    </motion.div>
  );
}
