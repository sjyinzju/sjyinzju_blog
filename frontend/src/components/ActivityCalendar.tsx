"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/fetch";

const Calendar = dynamic(
  () => import("react-activity-calendar").then((m) => m.ActivityCalendar),
  { ssr: false }
);

interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

const ORANGE_THEME = {
  light: ["#F8F7F3", "#ffedd5", "#fdba74", "#f97316", "#FF4A00"] as [string, string, string, string, string],
};

export default function ActivityCalendar({
  onSelectDate,
}: {
  onSelectDate?: (date: string) => void;
}) {
  const [data, setData] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    apiFetch("/stats/heatmap")
      .then((res) => (res.ok ? res.json() : []))
      .then((d) => setData(d as HeatmapDay[]))
      .catch(() => {});
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <img src="/loading.gif" alt="" className="w-16 h-16 object-contain" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <Calendar
        data={data}
        theme={ORANGE_THEME}
        blockMargin={5}
        blockRadius={4}
        blockSize={15}
        fontSize={14}
        weekStart={0}
      />
    </div>
  );
}
