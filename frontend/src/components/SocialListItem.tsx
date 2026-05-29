"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export interface SocialAccount {
  platform: string;
  avatar: string;
  username: string;
  link: string | null;
  bio: string;
  localAvatar?: boolean;
}

export default function SocialListItem({ account }: { account: SocialAccount }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  const content = (
    <div className="flex flex-row justify-between items-start w-full">
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-6">
        <img
          src={account.avatar}
          alt={account.username}
          referrerPolicy={account.localAvatar ? undefined : "no-referrer"}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-lg font-semibold tracking-wide text-[#1a1a1a] transition-colors duration-300 group-hover:text-[#FF4A00]">
            {account.username}
          </span>
          <p className="text-base leading-relaxed tracking-wide text-[#888] mt-1">
            {account.bio}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Platform label */}
      <div className="w-[80px] flex-shrink-0 text-right text-sm tracking-wide text-[#bbb] whitespace-nowrap">
        {account.platform}
      </div>

      {/* Orange vertical line */}
      <div className="w-[2px] flex-shrink-0 self-stretch bg-[#FF4A00] rounded-full" />

      {/* Content */}
      {account.link ? (
        <a
          href={account.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full group transition-transform duration-300 ease-out hover:-translate-y-0.5"
        >
          {content}
        </a>
      ) : (
        <div className="w-full">{content}</div>
      )}
    </motion.div>
  );
}
