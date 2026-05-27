"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
  { label: "笔记", href: "/notes" },
  { label: "思考", href: "/thoughts" },
  { label: "视频", href: "/videos" },
  { label: "项目开发", href: "/projects" },
  { label: "灵感与分享", href: "/inspiration" },
  { label: "资源", href: "/resources" },
  { label: "关于", href: "/about" },
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
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/20">
      <div className="flex items-center h-16 pl-[15%]">
        <motion.ul
          className="flex items-center gap-8 text-base tracking-wide text-[#555]"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <motion.li key={item.label} variants={child}>
                <Link
                  href={item.href}
                  className={`relative inline-block py-1 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#1a1a1a] ${
                    isActive ? "font-bold text-[#1a1a1a]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </nav>
  );
}
