"use client";

import { motion } from "framer-motion";

const navItems = [
  { label: "笔记", href: "#" },
  { label: "思考", href: "#" },
  { label: "视频", href: "#" },
  { label: "项目开发", href: "#" },
  { label: "灵感与分享", href: "#" },
  { label: "经历", href: "#" },
  { label: "关于", href: "#" },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const child = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const },
  },
};

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/20">
      <div className="flex items-center h-16 pl-[15%]">
        <motion.ul
          className="flex items-center gap-8 text-base tracking-wide text-[#555]"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((item) => (
            <motion.li key={item.label} variants={child}>
              <a
                href={item.href}
                className="relative inline-block py-1 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#1a1a1a]"
              >
                {item.label}
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </nav>
  );
}
