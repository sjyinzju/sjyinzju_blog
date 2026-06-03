"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InteractiveGrid from "@/components/InteractiveGrid";
import FormPageHero from "@/components/FormPageHero";
import FieldRow from "@/components/FieldRow";
import type { User } from "@/types/user";
import { apiFetch } from "@/lib/fetch";

const inputClass =
  "w-full text-base tracking-wide text-[#1a1a1a] bg-transparent border-0 border-b border-[#ddd] rounded-none py-1.5 placeholder:text-[#ccc] focus:outline-none focus:border-[#FF4A00] transition-colors duration-200";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // ── 个人资料 ──
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // ── 修改密码 ──
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    apiFetch("/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        if (data) {
          setUsername(data.username);
          setAvatar(data.avatar || "");
          setAvatarPreview(data.avatar || "");
          setBio(data.bio || "");
          setWebsite(data.website || "");
        }
      })
      .catch(() => setUser(null));
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio || "");
      formData.append("website", website || "");
      // 优先传文件；若无新文件则传现有 URL
      if (avatarFile) {
        formData.append("avatar_file", avatarFile);
      } else if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await apiFetch("/auth/me", {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        setProfileSuccess("资料已更新");
      } else {
        const text = await res.text();
        let detail = text;
        try {
          const data = JSON.parse(text);
          detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data);
        } catch {}
        setProfileError(`[${res.status}] ${detail}`);
      }
    } catch {
      setProfileError("[0] 无法连接服务器");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (newPassword.length < 6) {
      setPwdError("新密码长度至少 6 位");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await apiFetch("/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      if (res.ok) {
        setPwdSuccess("密码已修改");
        setOldPassword("");
        setNewPassword("");
      } else {
        const text = await res.text();
        let detail = text;
        try {
          const data = JSON.parse(text);
          detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data);
        } catch {}
        setPwdError(`[${res.status}] ${detail}`);
      }
    } catch {
      setPwdError("[0] 无法连接服务器");
    } finally {
      setPwdLoading(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="relative min-h-screen bg-[#F8F7F3]">
        <InteractiveGrid />
        <FormPageHero title="设置" />
        <div className="relative z-10 flex justify-center pt-8 pb-16">
          <p className="text-[#999] tracking-wide">加载中...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="relative min-h-screen bg-[#F8F7F3]">
        <InteractiveGrid />
        <FormPageHero title="设置" />
        <div className="relative z-10 flex flex-col items-center pt-8 pb-16 gap-6">
          <motion.img
            src="/error.png"
            alt="提示"
            className="w-[250px] h-auto object-contain pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          />
          <p className="text-base text-[#999] tracking-wide">
            请先
            <a href="/login" className="text-[#FF4A00] hover:underline mx-1">
              登录
            </a>
            后访问设置页
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <FormPageHero title="设置" />

      <div className="relative z-10 ml-[15%] pl-8 pt-0 pb-8 -mt-4 space-y-16">
        {/* ── 个人资料 ── */}
        <div className="relative">
          <form id="profileForm" onSubmit={handleProfileSubmit} className="max-w-xl pr-12 space-y-10">
            <FieldRow label="资料" fieldName="用户名">
              <input
                type="text"
                className={inputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FieldRow>

            <FieldRow label="资料" fieldName="头像">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#e0ddd5]">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center text-[#ccc] text-xs">
                      头像
                    </div>
                  )}
                </div>
                <label className="text-sm text-[#FF4A00] tracking-wide cursor-pointer hover:underline transition-colors">
                  选择图片
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
            </FieldRow>

            <FieldRow label="资料" fieldName="个人简介">
              <textarea
                className={inputClass}
                rows={2}
                placeholder="介绍一下自己..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </FieldRow>

            <FieldRow label="资料" fieldName="个人网站">
              <input
                type="text"
                className={inputClass}
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </FieldRow>
          </form>
          <button
            type="submit"
            form="profileForm"
            disabled={profileLoading}
            className="absolute top-1/2 -translate-y-1/2 text-xl font-semibold tracking-wide text-[#1a1a1a] whitespace-nowrap transition-transform duration-300 ease-out hover:translate-x-0.5 hover:text-[#FF4A00]"
          style={{ right: "37vw" }}
          >
            {profileLoading ? "保存中..." : "保存资料"}
          </button>
        </div>

        {/* ── 修改密码 ── */}
        <div className="relative">
          <form id="passwordForm" onSubmit={handlePasswordSubmit} className="max-w-xl pr-12 space-y-10">
            <FieldRow label="密码" fieldName="旧密码">
              <input
                type="password"
                className={inputClass}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </FieldRow>

            <FieldRow label="密码" fieldName="新密码">
              <input
                type="password"
                className={inputClass}
                placeholder="至少 6 位"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </FieldRow>
          </form>
          <button
            type="submit"
            form="passwordForm"
            disabled={pwdLoading}
            className="absolute top-1/2 -translate-y-1/2 text-xl font-semibold tracking-wide text-[#1a1a1a] whitespace-nowrap transition-transform duration-300 ease-out hover:translate-x-0.5 hover:text-[#FF4A00]"
            style={{ right: "37vw" }}
          >
            {pwdLoading ? "修改中..." : "修改密码"}
          </button>
        </div>
      </div>

      {/* 加载弹窗 */}
      {(profileLoading || pwdLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <img
            src="/loading.gif"
            alt="加载中..."
            className="w-84 h-84 object-contain"
          />
        </div>
      )}

      {/* 错误弹窗 — 保存资料 */}
      {profileError && (
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
              {profileError}
            </motion.p>
            <motion.button
              onClick={() => setProfileError("")}
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

      {/* 错误弹窗 — 修改密码 */}
      {pwdError && (
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
              {pwdError}
            </motion.p>
            <motion.button
              onClick={() => setPwdError("")}
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

      {/* 成功弹窗 — 保存资料 */}
      {profileSuccess && (
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
              {profileSuccess}
            </motion.p>
            <motion.button
              onClick={() => setProfileSuccess("")}
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

      {/* 成功弹窗 — 修改密码 */}
      {pwdSuccess && (
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
              className="w-[250px] h-auto object-contain pointer-events-none"
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
              {pwdSuccess}
            </motion.p>
            <motion.button
              onClick={() => setPwdSuccess("")}
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
