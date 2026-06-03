"use client";

import dynamic from "next/dynamic";
import InteractiveGrid from "@/components/InteractiveGrid";
import FormPageHero from "@/components/FormPageHero";

const KnowledgeGraph = dynamic(() => import("@/components/KnowledgeGraph"), { ssr: false });

export default function ConnectionsPage() {
  return (
    <div className="relative min-h-screen bg-[#F8F7F3] flex flex-col">
      <InteractiveGrid />
      <FormPageHero title="连接" />

      {/* 图谱占据剩余视口高度 */}
      <div className="relative z-10 flex-1">
        <KnowledgeGraph />
      </div>
    </div>
  );
}
