"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  children: string;
  delay?: number;
}

export default function HighlightText({ children, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <span ref={ref} className="relative inline">
      {children}
      <motion.span
        className="absolute bottom-[0.1em] left-0 w-full h-[0.35em] -z-10 pointer-events-none"
        style={{ background: "rgba(255, 74, 0, 0.4)", transformOrigin: "left" }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.55, delay, ease: [0.76, 0, 0.24, 1] }}
      />
    </span>
  );
}
