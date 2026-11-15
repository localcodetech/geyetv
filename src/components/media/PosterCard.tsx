"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Film, Star } from "lucide-react";
import { mediaHref, tmdbImage } from "@/lib/media";

export type PosterItem = {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: string;
  rating: number;
  posterPath: string | null;
};

/**
 * Poster tile linking to a movie or series. `subtitle` replaces the year (e.g. a role on a person page);
 * `free` marks titles that can be watched on G-Eye TV.
 */
export function PosterCard({ item, subtitle, free }: { item: PosterItem; subtitle?: string; free?: boolean }) {
  const poster = tmdbImage(item.posterPath, "w342");

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <Link href={mediaHref(item)} className="group block outline-none" title={item.title}>
        <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-[#1d1d21] ring-1 ring-white/10 transition-shadow group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] group-hover:ring-white/30 group-focus-visible:ring-2 group-focus-visible:ring-brand">
          {poster ? (
            // TMDB's CDN already serves resized posters, so skip Next's optimizer
            <Image src={poster} alt={item.title} fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="grid size-full place-items-center text-white/20">
              <Film className="size-10" />
            </div>
          )}
          {item.rating > 0 && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {item.rating.toFixed(1)}
            </span>
          )}
          {free && (
            <span className="absolute bottom-2 left-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-black">FREE</span>
          )}
          {item.type === "tv" && (
            <span className="absolute right-2 top-2 rounded-md bg-brand/90 px-1.5 py-0.5 text-[10px] font-bold tracking-wider">SERIES</span>
          )}
        </div>
        <p className="mt-2 truncate text-[13px] font-medium text-white/80 group-hover:text-white">{item.title}</p>
        <p className="truncate text-xs text-white/40">{subtitle ?? item.year}</p>
      </Link>
    </motion.div>
  );
}
