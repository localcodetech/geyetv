"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MovieSummary } from "@/lib/tmdb";
import { PosterCard } from "@/components/movies/PosterCard";

/** Horizontally scrolling row of movie posters */
export function PosterRow({ id, title, movies }: { id?: string; title: string; movies: MovieSummary[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="scroll-mt-24"
    >
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
        <div className="hidden gap-1 sm:flex">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir < 0 ? "Scroll left" : "Scroll right"}
              onClick={() => page(dir)}
              className="grid size-8 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
            >
              {dir < 0 ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          ))}
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 pt-1 sm:gap-4">
        {movies.map((m) => (
          <div key={m.id} className="w-[36%] shrink-0 snap-start sm:w-40 lg:w-44">
            <PosterCard movie={m} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
