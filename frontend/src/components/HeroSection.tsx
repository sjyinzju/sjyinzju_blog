"use client";

import Typewriter from "./Typewriter";
import InteractiveGrid from "./InteractiveGrid";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#faf9f5] flex flex-col overflow-hidden">
      {/* Orange shape with asymmetric SVG bezier curve */}
      <svg
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{ height: "58%" }}
        viewBox="0 0 1440 580"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 0 L 1440 0 L 1440 400 C 960 470, 480 330, 0 450 Z"
          fill="#FA9819"
        />
      </svg>

      {/* Upper zone: Typewriter */}
      <div className="relative z-10 flex items-center h-[52vh] w-full max-w-5xl mx-auto px-8">
        <Typewriter />
      </div>

      {/* Lower zone: Interactive dot grid */}
      <div className="relative flex-1 z-0">
        <InteractiveGrid />
      </div>
    </section>
  );
}
