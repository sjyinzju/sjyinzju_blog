"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const initParticles = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;

      // Retina: scale canvas buffer by dpr, display at CSS size
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      const cols = Math.floor(cssW / SPACING);
      const rows = Math.floor(cssH / SPACING);
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
    };

    const animate = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        // Repulsion: vector from mouse to anchor point
        const dx = p.baseX - mx;
        const dy = p.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.baseX;
        let targetY = p.baseY;

        if (dist < REPULSION_RADIUS && dist > 0.001) {
          const force = 1 - dist / REPULSION_RADIUS; // 1 → 0
          const offset = force * MAX_DISPLACEMENT;
          targetX = p.baseX + (dx / dist) * offset;
          targetY = p.baseY + (dy / dist) * offset;
        }

        // Spring lerp toward target
        p.x += (targetX - p.x) * LERP_FACTOR;
        p.y += (targetY - p.y) * LERP_FACTOR;

        // Draw 1px dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(60, 60, 60, 0.25)";
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

    const onResize = () => {
      initParticles();
    };

    // Initialize
    initParticles();
    rafRef.current = requestAnimationFrame(animate);

    // Window-level listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}
