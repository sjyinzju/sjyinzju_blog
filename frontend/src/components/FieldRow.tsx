"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type FieldRowProps = {
  label: string;
  fieldName: string;
  children: React.ReactNode;
};

export default function FieldRow({ label, fieldName, children }: FieldRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <motion.div
      ref={ref}
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* 字段标签（左侧小字） */}
      <div className="w-[80px] flex-shrink-0 text-right text-sm tracking-wide text-[#bbb] whitespace-nowrap">
        {label}
      </div>

      {/* 橙色竖线 */}
      <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FF4A00] rounded-full" />

      {/* 输入区 */}
      <div className="flex-1 min-w-0">
        <div className="text-lg font-semibold tracking-wide text-[#1a1a1a] mb-2">
          {fieldName}
        </div>
        {children}
      </div>
    </motion.div>
  );
}
