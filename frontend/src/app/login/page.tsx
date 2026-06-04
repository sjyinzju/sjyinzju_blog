"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import InteractiveGrid from "@/components/InteractiveGrid";
import FormPageHero from "@/components/FormPageHero";
import FieldRow from "@/components/FieldRow";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const inputClass =
  "w-full text-base tracking-wide text-[#1a1a1a] bg-transparent border-0 border-b border-[#ddd] rounded-none py-1.5 placeholder:text-[#ccc] focus:outline-none focus:border-[#FF4A00] transition-colors duration-200";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }
    if (!email.includes("@")) {
      setError("请在邮箱里包含 @");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data.detail || "登录失败，请重试");
      }
    } catch {
      setError("无法连接服务器，请确认后端已启动");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <FormPageHero title="登录" />

      <div className="relative z-10 max-w-xl ml-[15%] pl-8 pr-12 pt-0 pb-8 -mt-4 space-y-10">
        <form id="loginForm" onSubmit={handleSubmit} className="space-y-10">
          <FieldRow label="邮箱" fieldName="邮箱">
            <input
              type="text"
              className={inputClass}
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FieldRow>

          <FieldRow label="密码" fieldName="密码">
            <input
              type="password"
              className={inputClass}
              placeholder="输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldRow>
        </form>
      </div>

      {/* 按钮区 — 全宽居中，不受 ml-[15%] 约束 */}
      <div className="relative z-10 flex flex-col items-center gap-3 pb-16">
        <button
          type="submit"
          form="loginForm"
          disabled={loading}
          className="text-xl font-semibold tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
        >
          {loading ? "登录中..." : "登录"}
        </button>
        <span className="text-base tracking-wide text-[#888]">
          还没有账号？
          <Link
            href="/register"
            className="text-[#FF4A00] hover:underline ml-1"
          >
            去注册
          </Link>
        </span>
      </div>

      {/* 加载弹窗 — 模糊毛玻璃 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <img
            src="/loading.gif"
            alt="加载中..."
            className="w-84 h-84 object-contain"
          />
        </div>
      )}

      {/* 错误弹窗 — 模糊毛玻璃 */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.img
              src="/error.png"
              alt=""
              className="w-[250px] h-auto object-contain pointer-events-none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            <motion.p
              className="text-base text-[#999] tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {error}
            </motion.p>
            <motion.button
              onClick={() => setError("")}
              className="text-base text-[#1a1a1a] tracking-wide transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              关闭
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
