"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Film, Star } from "lucide-react";
import type { MovieSummary } from "@/lib/tmdb";

const POSTER = "https://image.tmdb.org/t/p/w342";

export function PosterCard({ movie }: { movie: MovieSummary }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <Link href={`/movies/${movie.id}`} className="group block outline-none" title={movie.title}>
        <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-[#1d1d21] ring-1 ring-white/10 transition-shadow group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] group-hover:ring-white/30 group-focus-visible:ring-2 group-focus-visible:ring-brand">
          {movie.posterPath ? (
            // TMDB's CDN already serves resized posters, so skip Next's optimizer
            <Image
              src={POSTER + movie.posterPath}
              alt={movie.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-white/20">
              <Film className="size-10" />
            </div>
          )}
          {movie.rating > 0 && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {movie.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-2 truncate text-[13px] font-medium text-white/80 group-hover:text-white">{movie.title}</p>
        <p className="text-xs text-white/40">{movie.year}</p>
      </Link>
    </motion.div>
  );
}
