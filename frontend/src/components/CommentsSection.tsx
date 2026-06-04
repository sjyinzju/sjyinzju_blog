"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { apiFetch } from "@/lib/fetch";
import type { User } from "@/types/user";

// ── types ──

interface CommentData {
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  post_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  replies: CommentData[];
}

interface LikeData {
  liked: boolean;
  count: number;
}

const inputClass =
  "w-full text-base tracking-wide text-[#1a1a1a] bg-transparent border-0 border-b border-[#ddd] rounded-none py-1.5 placeholder:text-[#ccc] focus:outline-none focus:border-[#FF4A00] transition-colors duration-200";

// ── helpers ──

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ── single comment row ──

function CommentRow({ comment, isReply }: { comment: CommentData; isReply?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-[80px] flex-shrink-0 flex justify-end">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#e0ddd5] flex-shrink-0">
            {comment.avatar ? (
              <img src={comment.avatar} alt="" className="w-full h-full object-cover" />
            ) : comment.username ? (
              <div className="w-full h-full bg-[#FA9819] flex items-center justify-center text-white text-sm font-bold">
                {comment.username[0].toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full bg-[#ddd] flex items-center justify-center text-white text-sm" />
            )}
          </div>
        </div>

        {/* Orange vertical line */}
        <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FF4A00] rounded-full" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-base font-semibold tracking-wide text-[#1a1a1a]">
              {comment.username}
            </span>
            <span className="text-sm tracking-wide text-[#bbb]">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-base leading-relaxed tracking-wide text-[#555]">
            {comment.content}
          </p>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className={`${isReply ? "ml-0" : "ml-[88px]"} mt-6 space-y-8`}>
          {comment.replies.map((reply) => (
            <CommentRow key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── main section ──

export default function CommentsSection({ slug }: { slug: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [like, setLike] = useState<LikeData>({ liked: false, count: 0 });
  const [comments, setComments] = useState<CommentData[]>([]);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = () => {
    setLoadError(null);
    setComments([]);

    // 加载当前用户（非关键，失败不影响主UI）
    apiFetch("/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));

    // 加载评论（关键数据）
    apiFetch(`/posts/${slug}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { setComments(data); setLoadError(null); })
      .catch((err) => setLoadError(err.message || "评论加载失败"));

    // 加载点赞（非关键）
    apiFetch(`/posts/${slug}/like/status`)
      .then((res) => (res.ok ? res.json() : { liked: false, count: 0 }))
      .then((data) => setLike(data))
      .catch(() => setLike({ liked: false, count: 0 }));
  };

  useEffect(() => { loadData(); }, [slug]);

  const handleLike = async () => {
    const res = await apiFetch(`/posts/${slug}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLike(data);
    }
  };

  const handleComment = async () => {
    if (!myComment.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await apiFetch(`/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: myComment }),
    });
    if (res.ok) {
      const newComment = await res.json();
      // 简单追加以免重新拉树
      setMyComment("");
      // 重新拉完整评论树
      const refreshed = await apiFetch(`/posts/${slug}/comments`);
      if (refreshed.ok) {
        setComments(await refreshed.json());
      }
    } else {
      const text = await res.text();
      try {
        const d = JSON.parse(text);
        setError(typeof d.detail === "string" ? d.detail : "发表失败");
      } catch {
        setError("发表失败");
      }
    }
    setSubmitting(false);
  };

  if (loadError) {
    return (
      <section className="mt-16 flex flex-col items-center gap-6">
        <img
          src="/error.png"
          alt=""
          className="w-[400px] h-auto object-contain pointer-events-none"
        />
        <p className="text-base text-[#999] tracking-wide">{loadError}</p>
        <button
          onClick={loadData}
          className="text-base text-[#1a1a1a] tracking-wide transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
        >
          重试
        </button>
      </section>
    );
  }

  return (
    <section className="mt-16">
      {/* ── 点赞 ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleLike}
          className="text-xl tracking-wide transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
          style={{ color: like.liked ? "#FF4A00" : "#1a1a1a" }}
        >
          {like.liked ? "♥" : "♡"} 点赞 {like.count}
        </button>
      </div>

      {/* ── 评论标题 ── */}
      <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-wide mb-8">
        评论
      </h2>

      {/* ── 评论输入 ── */}
      {user ? (
        <div className="ml-[88px] max-w-xl mb-10">
          <textarea
            className={inputClass}
            rows={2}
            placeholder="写下你的评论..."
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
          />
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleComment}
              disabled={submitting || !myComment.trim()}
              className="text-base font-semibold tracking-wide text-[#1a1a1a] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00] disabled:text-[#ccc]"
            >
              {submitting ? "发表中..." : "发表"}
            </button>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
        </div>
      ) : (
        <p className="ml-[88px] text-sm text-[#bbb] tracking-wide mb-10">
          请先登录后发表评论
        </p>
      )}

      {/* ── 评论列表 ── */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} />
        ))}
        {comments.length === 0 && (
          <p className="ml-[88px] text-sm text-[#ccc] tracking-wide">暂无评论</p>
        )}
      </div>
    </section>
  );
}
