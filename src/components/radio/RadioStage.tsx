"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { LoaderCircle, Maximize2, Pause, Play, RotateCw } from "lucide-react";
import type { Channel } from "@/lib/channels";
import { stationCode } from "@/lib/radio";
import { useRadio } from "@/components/radio/RadioProvider";
import { StationArt } from "@/components/radio/RadioPlayer";
import { Visualizer } from "@/components/radio/Visualizer";

/** 16:9 radio display used in place of the video player on the Live TV page */
export function RadioStage({ station }: { station: Channel }) {
  const radio = useRadio();
  const isCurrent = radio.station?.id === station.id;
  const status = isCurrent ? radio.status : "idle";
  const playing = status === "playing";
  const np = radio.nowPlaying[stationCode(station.streamUrl) ?? ""];

  return (
    <div className="relative isolate aspect-video w-full overflow-hidden bg-[#0c0c0f]">
      <StationArt station={station} className="absolute inset-0 -z-10 size-full scale-125 opacity-40 blur-3xl saturate-150" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/30 to-black/50" />

      <div className="flex h-full items-center gap-5 px-6 sm:gap-10 sm:px-12">
        <motion.div
          animate={{ scale: playing ? 1 : 0.94 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative aspect-square h-[58%] shrink-0 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/15"
        >
          <StationArt station={station} className="size-full" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-widest text-brand sm:text-xs">{np?.isLive ? "LIVE ON AIR" : "ON AIR"}</p>
          <p className="truncate text-lg font-extrabold sm:text-3xl">{station.title}</p>
          <p className="truncate text-xs text-white/65 sm:text-base">{np ? [np.song.artist, np.song.title].filter(Boolean).join(" - ") : "G-Eye Radio"}</p>
          <Visualizer analyser={isCurrent ? radio.analyser : null} active={playing} className="mt-3 hidden h-12 w-full sm:block" />
          <div className="mt-3 flex items-center gap-3 sm:mt-5">
            <motion.button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              whileTap={{ scale: 0.92 }}
              onClick={() => (isCurrent ? radio.toggle() : radio.play(station))}
              className="grid size-11 place-items-center rounded-full bg-brand shadow-[0_8px_24px_rgba(229,9,20,0.45)] hover:bg-red-700 sm:size-14"
            >
              {status === "loading" ? (
                <LoaderCircle className="size-6 animate-spin" />
              ) : status === "error" ? (
                <RotateCw className="size-6" />
              ) : playing ? (
                <Pause className="size-6 fill-current" />
              ) : (
                <Play className="ml-0.5 size-6 fill-current" />
              )}
            </motion.button>
            <Link href="/radio" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-medium ring-1 ring-white/15 hover:bg-white/20 sm:text-sm">
              <Maximize2 className="size-3.5" />
              Radio player
            </Link>
            {(status === "blocked" || status === "idle") && <span className="hidden text-sm text-white/50 sm:inline">Tap play to listen</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
