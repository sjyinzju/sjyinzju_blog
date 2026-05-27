"use client";

import InteractiveGrid from "./InteractiveGrid";
import SubPageHero from "./SubPageHero";

export default function SubPageContent({ title }: { title: string }) {
  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title={title} />
    </div>
  );
}
