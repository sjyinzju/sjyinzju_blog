"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WORDS = ["开发者", "写作者", "跑者", "剪辑师", "UP主", "创造者"];
const TYPE_SPEED = 100;
const DELETE_SPEED = 50;
const PAUSE_DURATION = 3000;

export default function Typewriter() {
  const [displayText, setDisplayText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNextIndex = useCallback((current: number): number => {
    if (WORDS.length === 1) return 0;
    let next: number;
    do {
      next = Math.floor(Math.random() * WORDS.length);
    } while (next === current && WORDS.length > 1);
    return next;
  }, []);

  useEffect(() => {
    const currentWord = WORDS[currentWordIndex];

    if (!isDeleting && displayText === currentWord) {
      timerRef.current = setTimeout(() => {
        setIsDeleting(true);
      }, PAUSE_DURATION);
      return;
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => getNextIndex(prev));
      return;
    }

    const speed = isDeleting ? DELETE_SPEED : TYPE_SPEED;
    timerRef.current = setTimeout(() => {
      setDisplayText((prev) => {
        if (isDeleting) {
          return prev.slice(0, -1);
        }
        return currentWord.slice(0, prev.length + 1);
      });
    }, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [displayText, currentWordIndex, isDeleting, getNextIndex]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl md:text-5xl font-bold text-black tracking-wide">
        我是 &gt;{" "}
      </span>
      <span className="text-3xl md:text-5xl font-bold tracking-wide text-[#FF4A00]">
        {displayText}
        <span className="inline-block w-[3px] h-[1em] bg-[#FF4A00] ml-0.5 align-middle animate-pulse" />
      </span>
    </div>
  );
}
