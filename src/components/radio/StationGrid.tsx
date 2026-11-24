"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Users } from "lucide-react";
import { stationCode } from "@/lib/radio";
import { useRadio } from "@/components/radio/RadioProvider";
import { StationArt } from "@/components/radio/RadioPlayer";

/** Every station with what it's playing right now */
export function StationGrid() {
  const radio = useRadio();
  const { watchNowPlaying } = radio;

  // Keep now-playing fresh for all stations while this list is on screen
  useEffect(() => watchNowPlaying(), [watchNowPlaying]);

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold sm:text-xl">
        All stations <span className="ml-1 text-sm font-normal text-white/40">{radio.stations.length}</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {radio.stations.map((s) => {
          const np = radio.nowPlaying[stationCode(s.streamUrl) ?? ""];
          const current = radio.station?.id === s.id;
          const playing = current && radio.status === "playing";
          return (
            <motion.button
              key={s.id}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => (current ? radio.toggle() : radio.play(s))}
              className={`flex items-center gap-4 rounded-2xl p-3 text-left ring-1 transition-colors ${
                current ? "bg-brand/15 ring-brand" : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]"
              }`}
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                <StationArt station={s} className="size-full" />
                {playing && (
                  <span className="absolute inset-0 flex items-end justify-center gap-[3px] bg-black/40 pb-2" aria-hidden>
                    {[0, 0.2, 0.4, 0.1].map((d) => (
                      <motion.span key={d} className="w-1 rounded-full bg-white" animate={{ height: ["25%", "70%", "40%", "60%", "25%"] }} transition={{ duration: 1, repeat: Infinity, delay: d }} />
                    ))}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{s.title}</p>
                <p className="truncate text-sm text-white/55">{np ? [np.song.artist, np.song.title].filter(Boolean).join(" - ") : "Live stream"}</p>
                {np && np.listeners > 0 && (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/40">
                    <Users className="size-3" />
                    {np.listeners}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
