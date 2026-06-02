"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { User } from "@/types/user";

const navItems = [
  { label: "笔记", href: "/notes" },
  { label: "思考", href: "/thoughts" },
  { label: "视频", href: "/videos" },
  { label: "项目开发", href: "/projects" },
  { label: "灵感", href: "/inspiration" },
  { label: "资源", href: "/resources" },
  { label: "关于", href: "/about" },
];

const API_BASE = "http://localhost:8000";

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
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const linkClass =
    "relative inline-block py-1 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#1a1a1a]";

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/20">
      <motion.div
        className="flex items-center h-16 pl-[20%]"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Brand */}
        <motion.div variants={child}>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                router.push("/");
              }
            }}
            className="text-lg font-bold tracking-wide text-[#FF4A00] mr-10 transition-transform duration-300 ease-out hover:-translate-y-0.5"
          >
            Sjy_in_zju
          </a>
        </motion.div>

        {/* 左侧导航 */}
        <ul className="flex items-center gap-8 text-base tracking-wide text-[#555]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <motion.li key={item.label} variants={child}>
                <Link
                  href={item.href}
                  className={`${linkClass} ${
                    isActive ? "font-bold text-[#1a1a1a]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* 右侧鉴权入口 */}
        <div className="ml-auto pr-[20%] flex items-center gap-8 text-base tracking-wide text-[#555]">
          {user === undefined ? (
            /* 加载中，占位避免布局抖动 */
            <div className="w-32" />
          ) : (
            <>
              <motion.div variants={child}>
                <Link href="/register" className={linkClass}>
                  注册
                </Link>
              </motion.div>
              <motion.div variants={child}>
                <Link href="/login" className={linkClass}>
                  登录
                </Link>
              </motion.div>
              <motion.div variants={child}>
                <Link href="/settings" className={linkClass}>
                  设置
                </Link>
              </motion.div>
              {user?.is_admin && (
                <motion.div variants={child}>
                  <Link href="/publish" className={linkClass}>
                    发布
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
