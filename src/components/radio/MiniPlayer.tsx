"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, Pause, Play, X } from "lucide-react";
import { stationCode } from "@/lib/radio";
import { useRadio } from "@/components/radio/RadioProvider";
import { StationArt } from "@/components/radio/RadioPlayer";
import { Visualizer } from "@/components/radio/Visualizer";

/** Bar that keeps the radio controllable on every page except the radio page itself */
export function MiniPlayer() {
  const radio = useRadio();
  const pathname = usePathname();
  const { station, status } = radio;
  const show = station && pathname !== "/radio";
  const np = station ? radio.nowPlaying[stationCode(station.streamUrl) ?? ""] : undefined;
  const playing = status === "playing";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          // Sits above the phone tab bar
          className="fixed inset-x-2 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-90 md:inset-x-auto md:bottom-4 md:right-4 md:w-96"
        >
          <div className="flex items-center gap-3 overflow-hidden rounded-md bg-black p-2 pr-3 ring-1 ring-line">
            <Link href="/radio" className="relative size-12 shrink-0 overflow-hidden rounded ring-1 ring-line" aria-label="Open radio player">
              <StationArt station={station} className="size-full" />
            </Link>
            <Link href="/radio" className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{np?.song.title || station.title}</p>
              <p className="truncate text-xs text-white/55">{np?.song.artist ? `${np.song.artist} · ${station.title}` : station.title}</p>
            </Link>
            <Visualizer analyser={radio.analyser} active={playing} className="hidden h-6 w-12 shrink-0 sm:block" />
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={radio.toggle}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-black transition-transform active:scale-90"
            >
              {status === "loading" ? <LoaderCircle className="size-5 animate-spin" /> : playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
            </button>
            <button type="button" aria-label="Stop radio" onClick={radio.stop} className="grid size-8 shrink-0 place-items-center rounded-full text-white/50 hover:bg-raised hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
