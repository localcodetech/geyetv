"use client";

import { useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/radio";

/** Seconds into the current song, ticking locally between now-playing polls */
export function useSongProgress(np: NowPlaying | undefined) {
  // 0 until the first tick, so nothing time-based runs during server rendering
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!np?.duration) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [np?.duration]);

  if (!np?.duration) return null;
  const elapsed = Math.min(np.duration, np.elapsed + Math.max(0, ((now || np.fetchedAt) - np.fetchedAt) / 1000));
  return { elapsed, duration: np.duration };
}

export const formatClock = (secs: number) => {
  const s = Math.floor(secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};
