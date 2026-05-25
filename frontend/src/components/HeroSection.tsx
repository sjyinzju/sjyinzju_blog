"use client";

import Typewriter from "./Typewriter";
import InteractiveGrid from "./InteractiveGrid";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#F8F7F3] flex flex-col overflow-hidden">
      {/* Orange shape with dramatic asymmetric bezier curve */}
      <svg
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{ height: "90%" }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path
          d="M 1440 700 Q 840 940 0 500 L 0 0 L 1440 0 Z"
          fill="#FA9819"
        />
      </svg>

      {/* Upper zone: Typewriter — offset right for asymmetric composition */}
      <div className="relative z-10 flex items-center h-[48vh] w-full max-w-5xl mx-auto pl-20 md:pl-28">
        <Typewriter />
      </div>

      {/* Lower zone: Interactive dot grid */}
      <div className="relative flex-1 z-0">
        <InteractiveGrid />
      </div>
    </section>
  );
}
