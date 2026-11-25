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
    <div className="relative aspect-video w-full overflow-hidden bg-panel">

      <div className="flex h-full items-center gap-5 px-6 sm:gap-10 sm:px-12">
        <div className="relative aspect-square h-[58%] shrink-0 overflow-hidden rounded ring-1 ring-line">
          <StationArt station={station} className="size-full" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="tag">{np?.isLive ? "Live on air" : "On air"}</span>
          <p className="heading mt-2 truncate text-2xl sm:text-4xl">{station.title}</p>
          <p className="truncate text-xs text-white/65 sm:text-base">{np ? [np.song.artist, np.song.title].filter(Boolean).join(" - ") : "G-Eye Radio"}</p>
          <Visualizer analyser={isCurrent ? radio.analyser : null} active={playing} className="mt-3 hidden h-12 w-full sm:block" />
          <div className="mt-3 flex items-center gap-3 sm:mt-5">
            <motion.button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              whileTap={{ scale: 0.92 }}
              onClick={() => (isCurrent ? radio.toggle() : radio.play(station))}
              className="grid size-11 place-items-center rounded-full bg-brand hover:bg-brand-dark sm:size-14"
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
            <Link href="/radio" className="inline-flex items-center gap-1.5 rounded bg-raised px-3 py-2 text-xs font-medium ring-1 ring-line hover:bg-line sm:text-sm">
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
