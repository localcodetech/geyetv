"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { toggleSaved, useMyList, type SavedItem } from "@/lib/viewer-prefs";

/** Adds / removes a movie or series from "My List" (stored in this browser) */
export function MyListButton({ item }: { item: SavedItem }) {
  const saved = useMyList().some((i) => i.id === item.id && i.type === item.type);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() =>
        toggleSaved({
          id: item.id,
          type: item.type,
          title: item.title,
          year: item.year,
          rating: item.rating,
          posterPath: item.posterPath,
          backdropPath: item.backdropPath,
          overview: item.overview,
        })
      }
      aria-pressed={saved}
      className="btn btn-secondary"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={String(saved)}
          initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {saved ? <Check className="size-4" /> : <Plus className="size-4" />}
        </motion.span>
      </AnimatePresence>
      {saved ? "In My List" : "My List"}
    </motion.button>
  );
}
