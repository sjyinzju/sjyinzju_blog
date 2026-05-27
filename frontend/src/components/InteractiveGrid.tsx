"use client";

import { useEffect, useRef, useCallback } from "react";

const SPACING = 30;
const DOT_RADIUS = 1;
const REPULSION_RADIUS = 150;
const MAX_DISPLACEMENT = 20;
const LERP_FACTOR = 0.1;

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
}

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);
  const mountedRef = useRef(true);
  const listenersRef = useRef<{
    onMouseMove: (e: MouseEvent) => void;
    onResize: () => void;
  } | null>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const onResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = parent.clientWidth;
    const cssH = parent.clientHeight;

    if (cssW === 0 || cssH === 0) return;

    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const cols = Math.floor(cssW / SPACING);
    const rows = Math.floor(cssH / SPACING);
    if (cols === 0 || rows === 0) return;

    const offsetX = (cssW - cols * SPACING) / 2 + SPACING / 2;
    const offsetY = (cssH - rows * SPACING) / 2 + SPACING / 2;

    const particles: Particle[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = c * SPACING + offsetX;
        const by = r * SPACING + offsetY;
        particles.push({ baseX: bx, baseY: by, x: bx, y: by });
      }
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Store callbacks in ref to avoid stale closures in RAF
    listenersRef.current = { onMouseMove, onResize };

    // Initial setup — delay one tick to ensure layout is settled
    const initTimer = setTimeout(() => {
      if (!mountedRef.current) return;
      onResize();
    }, 0);

    const animate = () => {
      if (!mountedRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        const dx = p.baseX - mx;
        const dy = p.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.baseX;
        let targetY = p.baseY;

        if (dist < REPULSION_RADIUS && dist > 0.001) {
          const force = 1 - dist / REPULSION_RADIUS;
          const offset = force * MAX_DISPLACEMENT;
          targetX = p.baseX + (dx / dist) * offset;
          targetY = p.baseY + (dy / dist) * offset;
        }

        p.x += (targetX - p.x) * LERP_FACTOR;
        p.y += (targetY - p.y) * LERP_FACTOR;

        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(60, 60, 60, 0.25)";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, [onMouseMove, onResize]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}
