"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import * as d3 from "d3-force";
import { apiFetch } from "@/lib/fetch";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type GNode = {
  id?: string | number;
  label?: string;
  group?: string;
  val?: number;
  slug?: string;
  x?: number;
  y?: number;
  [key: string]: unknown;
};

interface GraphData {
  nodes: GNode[];
  links: { source: string; target: string }[];
}

const COLORS: Record<string, string> = {
  category: "#FF4A00",
  tag: "#FA9819",
  article: "#D1D5DB",
};

export default function KnowledgeGraph() {
  const router = useRouter();
  const fgRef = useRef<any>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });

  useEffect(() => {
    apiFetch("/posts/graph")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) {
          const cx = size.w / 2;
          const cy = size.h / 2;
          for (const n of d.nodes) {
            n.x = cx + (Math.random() - 0.5) * 60;
            n.y = cy + (Math.random() - 0.5) * 60;
          }
        }
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err.message || "图谱加载失败"));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !fgRef.current) return;
    const t = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg) return;
      fg.d3Force("charge", (d3 as any).forceManyBody().strength(-200));
      fg.d3Force("center", (d3 as any).forceCenter(size.w / 2, size.h / 2).strength(2));
      fg.d3Force("link", null);
      fg.d3Force("link", (d3 as any).forceLink(data.links).id((d: any) => d.id).distance(30));
      fg.zoomToFit?.(400, 80);
    }, 500);
    return () => clearTimeout(t);
  }, [data, size]);

  // Keep ref in sync with state so canvas callback reads the latest value
  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  const nodeCanvasObject = useCallback(
    (node: GNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = ((node.val || 5) / 1.5) / globalScale;
      const color = COLORS[(node.group as string) || ""] || "#999";

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Show label on hover (read from ref for latest value)
      if (hoveredIdRef.current === String(node.id ?? "")) {
        const fs = 14 / globalScale;
        ctx.font = `500 ${fs}px "Noto Serif SC", Georgia, serif`;
        ctx.fillStyle = "#1a1a1a";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.label || "", node.x!, node.y! + r + 3);
      }
    },
    []
  );

  const handleNodeHover = useCallback((node: GNode | null) => {
    const nid = node?.id ? String(node.id) : null;
    setHoveredId(nid);
  }, []);

  const handleNodeClick = useCallback(
    (node: GNode) => {
      if (node.group === "article" && node.slug) {
        router.push(`/notes/${String(node.slug)}`);
      }
    },
    [router]
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <img
          src="/error.png"
          alt=""
          className="w-[400px] h-auto object-contain pointer-events-none"
        />
        <p className="text-base text-[#999] tracking-wide">{error}</p>
        <button
          onClick={() => { setError(null); setData(null); }}
          className="text-base text-[#1a1a1a] tracking-wide transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#FF4A00]"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <img src="/loading.gif" alt="加载中..." className="w-32 h-32 object-contain" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <ForceGraph2D
        graphData={data}
        width={size.w}
        height={size.h}
        ref={fgRef}
        nodeVal={(node: GNode) => ((node.val as number) ?? 5) / 1.5}
        nodeColor={(node: GNode) => COLORS[(node.group as string) || ""] || "#999"}
        linkColor={() => "#E5E7EB"}
        linkWidth={1}
        nodeCanvasObject={nodeCanvasObject}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        cooldownTicks={150}
        d3AlphaDecay={0.06}
        enableNodeDrag={true}
        enableZoomInteraction={false}
      />
    </div>
  );
}
