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

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !password || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }
    if (!email.includes("@")) {
      setError("请在邮箱里包含 @");
      return;
    }
    if (username.length < 1) {
      setError("请输入用户名");
      return;
    }
    if (password.length < 6) {
      setError("密码长度至少 6 位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (res.ok) {
        setSuccess("注册成功！即将跳转到登录页...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.detail || "注册失败，请重试");
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
      <FormPageHero title="注册" />

      <div className="relative z-10 max-w-xl ml-[15%] pl-8 pr-12 pt-0 pb-8 -mt-4 space-y-10">
        <form id="registerForm" onSubmit={handleSubmit} className="space-y-10">
          <FieldRow label="用户名" fieldName="用户名">
            <input
              type="text"
              className={inputClass}
              placeholder="你的用户名（注册后不可修改邮箱，用户名可修改）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FieldRow>

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
              placeholder="至少 6 位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldRow>

          <FieldRow label="密码" fieldName="确认密码">
            <input
              type="password"
              className={inputClass}
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FieldRow>
        </form>
      </div>

      {/* 按钮区 — 全宽居中，不受 ml-[15%] 约束 */}
      <div className="relative z-10 flex flex-col items-center gap-3 pb-16">
        <button
          type="submit"
          form="registerForm"
          disabled={loading}
          className="text-xl font-semibold tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
        >
          {loading ? "注册中..." : "注册"}
        </button>
        <span className="text-base tracking-wide text-[#888]">
          已有帐号？
          <Link
            href="/login"
            className="text-[#FF4A00] hover:underline ml-1"
          >
            去登陆
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
              className="w-[400px] h-auto object-contain pointer-events-none"
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

      {/* 成功弹窗 */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.img
              src="/success.png"
              alt=""
              className="w-[400px] h-auto object-contain pointer-events-none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            <motion.p
              className="text-xl text-green-600 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {success}
            </motion.p>
            <motion.button
              onClick={() => setSuccess("")}
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
