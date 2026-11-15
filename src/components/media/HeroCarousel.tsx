"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Info, Star } from "lucide-react";
import { mediaHref, tmdbImage } from "@/lib/media";
import type { SavedItem } from "@/lib/viewer-prefs";
import { MyListButton } from "@/components/media/MyListButton";

const INTERVAL_MS = 8000;

/** Auto-rotating hero of featured titles with a cross-fade, pausable on hover */
export function HeroCarousel({ items, label = "TRENDING TODAY" }: { items: SavedItem[]; label?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const item = items[index % items.length];

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % items.length), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, paused, items.length]);

  if (!item) return null;

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${item.type}-${item.id}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, scale: { duration: INTERVAL_MS / 1000, ease: "linear" } }}
          className="absolute inset-0 -z-10"
        >
          <Image src={tmdbImage(item.backdropPath, "w1280")!} alt="" fill priority unoptimized className="object-cover object-top" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-surface via-surface/75 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-surface via-transparent to-surface/40" />

      <div className="mx-auto flex min-h-[68svh] max-w-350 flex-col justify-end px-4 pb-16 pt-24 sm:min-h-[78svh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand">
              {label}
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] tracking-wider text-white/80">{item.type === "tv" ? "SERIES" : "MOVIE"}</span>
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">{item.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
              {item.rating > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {item.rating.toFixed(1)}
                </span>
              )}
              <span>{item.year}</span>
            </div>
            <p className="mt-4 line-clamp-3 max-w-xl text-white/80 sm:text-lg">{item.overview}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={mediaHref(item)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-semibold shadow-[0_8px_24px_rgba(229,9,20,0.35)] transition-colors hover:bg-red-700"
              >
                <Info className="size-4" />
                More info
              </Link>
              <MyListButton item={item} />
            </div>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <div className="mt-8 flex gap-2" role="tablist">
            {items.map((it, i) => (
              <button
                key={`${it.type}-${it.id}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${it.title}`}
                onClick={() => setIndex(i)}
                className="relative h-1 w-10 overflow-hidden rounded-full bg-white/20"
              >
                {i === index && (
                  <motion.span
                    key={`${index}-${paused}`}
                    className="absolute inset-y-0 left-0 bg-white"
                    initial={{ width: paused ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: paused ? 0 : INTERVAL_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
