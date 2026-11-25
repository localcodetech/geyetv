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
      <h1 className="text-3xl heading sm:text-4xl">My List</h1>
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
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/75 opacity-100 ring-1 ring-line transition hover:bg-brand sm:opacity-0 sm:group-hover/item:opacity-100"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="grid place-items-center rounded-md bg-panel px-6 py-20 text-center ring-1 ring-line">
          <Bookmark className="mb-4 size-10 text-brand" />
          <p className="text-lg font-semibold">Your list is empty</p>
          <p className="mt-1 max-w-sm text-white/50">Tap &ldquo;My List&rdquo; on any movie or series to save it here.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/movies" className="btn btn-primary">
              Browse movies
            </Link>
            <Link href="/series" className="btn btn-secondary">
              Browse series
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
