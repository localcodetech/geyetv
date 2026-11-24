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
    <div className={`grid place-items-center bg-[#1d1d21] ${className}`}>
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
    <section className="relative isolate overflow-hidden rounded-3xl bg-[#121215] ring-1 ring-white/10">
      {/* Blurred station artwork as the backdrop */}
      <AnimatePresence initial={false}>
        <motion.div key={station.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0 -z-10">
          <StationArt station={station} className="size-full scale-125 opacity-50 blur-3xl saturate-150" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/30 via-black/50 to-[#121215]" />

      <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,320px)_1fr]">
        {/* Artwork with a pulsing ring while on air */}
        <div className="relative mx-auto w-56 sm:w-72 md:w-full">
          {playing && (
            <motion.span
              className="absolute -inset-3 rounded-[2rem] ring-2 ring-brand/60"
              animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <motion.div
            key={station.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: playing ? 1 : 0.96, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative aspect-square overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/15"
          >
            <StationArt station={station} className="size-full" priority />
          </motion.div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-widest">
            <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 ${np?.isLive ? "bg-brand" : "bg-white/10"}`}>
              <span className={`size-1.5 rounded-full ${playing ? "animate-pulse bg-white" : "bg-white/60"}`} />
              {np?.isLive ? `LIVE${np.streamer ? ` · ${np.streamer.toUpperCase()}` : ""}` : "ON AIR"}
            </span>
            {np && np.listeners > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 tracking-normal">
                <Users className="size-3" />
                {np.listeners} listening
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{station.title}</h1>

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
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Now playing</p>
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
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
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
              className="grid size-16 place-items-center rounded-full bg-brand shadow-[0_10px_30px_rgba(229,9,20,0.45)] transition-colors hover:bg-red-700"
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
      className="grid size-12 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20"
    >
      {children}
    </motion.button>
  );
}
