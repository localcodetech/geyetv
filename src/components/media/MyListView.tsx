"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, X } from "lucide-react";
import { toggleSaved, useMyList } from "@/lib/viewer-prefs";
import { PosterCard } from "@/components/media/PosterCard";

/** Titles saved with the "My List" button, stored in this browser */
export function MyListView() {
  const items = useMyList();

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">My List</h1>
      <p className="mb-8 mt-1 text-white/50">Movies and series you&apos;ve saved on this device.</p>

      {items.length ? (
        <motion.div layout className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-7">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group/item relative"
              >
                <PosterCard item={item} />
                <button
                  type="button"
                  aria-label={`Remove ${item.title} from My List`}
                  onClick={() => toggleSaved(item)}
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/75 opacity-100 ring-1 ring-white/20 transition hover:bg-brand sm:opacity-0 sm:group-hover/item:opacity-100"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="grid place-items-center rounded-2xl bg-white/[0.03] px-6 py-20 text-center ring-1 ring-white/10">
          <Bookmark className="mb-4 size-10 text-brand" />
          <p className="text-lg font-semibold">Your list is empty</p>
          <p className="mt-1 max-w-sm text-white/50">Tap &ldquo;My List&rdquo; on any movie or series to save it here.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/movies" className="rounded-lg bg-brand px-5 py-2.5 font-semibold hover:bg-red-700">
              Browse movies
            </Link>
            <Link href="/series" className="rounded-lg bg-white/10 px-5 py-2.5 font-semibold ring-1 ring-white/15 hover:bg-white/20">
              Browse series
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
