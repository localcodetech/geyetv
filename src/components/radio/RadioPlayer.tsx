"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, Pause, Play, Radio, RotateCw, SkipBack, SkipForward, Users, Volume1, Volume2, VolumeX } from "lucide-react";
import type { Channel } from "@/lib/channels";
import { stationCode } from "@/lib/radio";
import { useRadio } from "@/components/radio/RadioProvider";
import { Visualizer } from "@/components/radio/Visualizer";
import { formatClock, useSongProgress } from "@/components/radio/useSongProgress";

/** Station artwork from Supabase, with a neutral placeholder */
export function StationArt({ station, className = "", priority = false }: { station: Channel; className?: string; priority?: boolean }) {
  return station.logoUrl ? (
    <Image
      src={station.logoUrl}
      alt=""
      width={480}
      height={480}
      priority={priority}
      // Logos are entered in Supabase and may be on any host; only local ones go through the optimizer
      unoptimized={!station.logoUrl.startsWith("/")}
      className={`object-cover ${className}`}
    />
  ) : (
    <div className={`grid place-items-center bg-panel ${className}`}>
      <Radio className="size-1/3 text-white/30" />
    </div>
  );
}

/** Full-size player for the station that's on (or `fallback` before anything has been played) */
export function RadioPlayer({ fallback }: { fallback?: Channel }) {
  const radio = useRadio();
  const station = radio.station ?? fallback ?? radio.stations[0];
  const np = station ? radio.nowPlaying[stationCode(station.streamUrl) ?? ""] : undefined;
  const progress = useSongProgress(np);
  if (!station) return null;

  const isCurrent = radio.station?.id === station.id;
  const status = isCurrent ? radio.status : "idle";
  const playing = status === "playing";
  const VolumeIcon = radio.muted || radio.volume === 0 ? VolumeX : radio.volume < 0.5 ? Volume1 : Volume2;

  return (
    <section className="overflow-hidden rounded-md border-t-4 border-brand bg-panel">

      <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="relative mx-auto w-56 sm:w-72 md:w-full">
          <motion.div
            key={station.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-square overflow-hidden rounded ring-1 ring-line"
          >
            <StationArt station={station} className="size-full" priority />
          </motion.div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag">
              <span className={`size-1.5 rounded-full bg-white ${playing ? "animate-pulse" : "opacity-60"}`} />
              {np?.isLive ? `Live${np.streamer ? ` · ${np.streamer}` : ""}` : "On air"}
            </span>
            {np && np.listeners > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-muted">
                <Users className="size-3" />
                {np.listeners} listening
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl heading sm:text-5xl">{station.title}</h1>

          <AnimatePresence mode="wait">
            <motion.div
              key={np ? `${np.song.artist}|${np.song.title}` : "none"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-4 min-h-14"
            >
              {np ? (
                <>
                  <p className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Now playing</p>
                  <p className="truncate text-lg font-semibold sm:text-xl">{np.song.title}</p>
                  {np.song.artist && <p className="truncate text-white/65">{np.song.artist}</p>}
                </>
              ) : (
                <p className="text-white/50">G-Eye Radio · live stream</p>
              )}
            </motion.div>
          </AnimatePresence>

          {progress && (
            <div className="mt-4 flex items-center gap-3 text-xs tabular-nums text-white/50">
              <span>{formatClock(progress.elapsed)}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-white/80 transition-[width] duration-1000 ease-linear" style={{ width: `${(progress.elapsed / progress.duration) * 100}%` }} />
              </div>
              <span>{formatClock(progress.duration)}</span>
            </div>
          )}

          <Visualizer analyser={isCurrent ? radio.analyser : null} active={playing} className="mt-6 h-16 w-full sm:h-20" />

          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ControlButton label="Previous station" onClick={() => radio.step(-1)}>
              <SkipBack className="size-5 fill-current" />
            </ControlButton>
            <motion.button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              whileTap={{ scale: 0.92 }}
              onClick={() => (isCurrent ? radio.toggle() : radio.play(station))}
              className="grid size-16 place-items-center rounded-full bg-brand transition-colors hover:bg-brand-dark"
            >
              {status === "loading" ? (
                <LoaderCircle className="size-7 animate-spin" />
              ) : status === "error" ? (
                <RotateCw className="size-7" />
              ) : playing ? (
                <Pause className="size-7 fill-current" />
              ) : (
                <Play className="ml-1 size-7 fill-current" />
              )}
            </motion.button>
            <ControlButton label="Next station" onClick={() => radio.step(1)}>
              <SkipForward className="size-5 fill-current" />
            </ControlButton>

            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <button type="button" aria-label={radio.muted ? "Unmute" : "Mute"} onClick={radio.toggleMute} className="text-white/70 hover:text-white">
                <VolumeIcon className="size-5" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={radio.muted ? 0 : radio.volume}
                onChange={(e) => radio.setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="w-28 accent-brand"
              />
            </div>
          </div>

          <p className="mt-4 min-h-5 text-sm text-white/50">
            {status === "blocked"
              ? "Tap play to start listening."
              : status === "error"
                ? "This station isn't responding right now. Tap to retry."
                : np?.next
                  ? `Up next: ${np.next}`
                  : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="grid size-12 place-items-center rounded-full bg-raised ring-1 ring-line transition-colors hover:bg-line"
    >
      {children}
    </motion.button>
  );
}
