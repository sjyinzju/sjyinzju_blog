"use client";

import { useEffect, useRef } from "react";

const SPACING = 40;
const RADIUS = 1.5;
const REPULSION_DIST = 100;
const REPULSION_STRENGTH = 20;

interface Dot {
  rx: number;
  ry: number;
  cx: number;
  cy: number;
}

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initDots = () => {
      const { width, height } = canvas;
      const cols = Math.floor(width / SPACING);
      const rows = Math.floor(height / SPACING);
      const offsetX = (width - cols * SPACING) / 2 + SPACING / 2;
      const offsetY = (height - rows * SPACING) / 2 + SPACING / 2;
      const dots: Dot[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + offsetX;
          const y = r * SPACING + offsetY;
          dots.push({ rx: x, ry: y, cx: x, cy: y });
        }
      }
      dotsRef.current = dots;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { clientWidth: w, clientHeight: h } = parent;
      canvas.width = w;
      canvas.height = h;
      initDots();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const dot of dotsRef.current) {
        const dx = dot.cx - mx;
        const dy = dot.cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPULSION_DIST && dist > 0.1) {
          const force = (1 - dist / REPULSION_DIST) ** 2;
          const tx = dot.rx + (dx / dist) * force * REPULSION_STRENGTH;
          const ty = dot.ry + (dy / dist) * force * REPULSION_STRENGTH;
          dot.cx += (tx - dot.cx) * 0.25;
          dot.cy += (ty - dot.cy) * 0.25;
        } else {
          dot.cx += (dot.rx - dot.cx) * 0.08;
          dot.cy += (dot.ry - dot.cy) * 0.08;
        }

        ctx.beginPath();
        ctx.arc(dot.cx, dot.cy, RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    resize();
    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-20 pointer-events-auto"
    />
  );
}
