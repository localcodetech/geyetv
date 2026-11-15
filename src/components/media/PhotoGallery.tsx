"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { tmdbImage } from "@/lib/media";
import { ScrollRow } from "@/components/media/ScrollRow";

const noSubscribe = () => () => {};

/** Row of backdrop stills with a full-screen lightbox (← / → / Esc) */
export function PhotoGallery({ paths, title = "Photos" }: { paths: string[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % paths.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + paths.length) % paths.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, paths.length]);

  const step = (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + paths.length) % paths.length));

  return (
    <>
      <ScrollRow title={title} itemClassName="w-[72%] sm:w-80">
        {paths.map((p, i) => (
          <motion.button key={p} type="button" whileHover={{ y: -4 }} onClick={() => setOpen(i)} className="group block w-full">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#1d1d21] ring-1 ring-white/10 group-hover:ring-white/30">
              <Image src={tmdbImage(p, "w780")!} alt="" fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
          </motion.button>
        ))}
      </ScrollRow>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(null)}
                className="fixed inset-0 z-300 grid place-items-center bg-black/90 p-4"
                role="dialog"
                aria-label="Photo viewer"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={open}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-xl"
                  >
                    <Image src={tmdbImage(paths[open], "original")!} alt="" fill unoptimized className="object-contain" />
                  </motion.div>
                </AnimatePresence>
                {([-1, 1] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    aria-label={dir < 0 ? "Previous photo" : "Next photo"}
                    onClick={(e) => {
                      e.stopPropagation();
                      step(dir);
                    }}
                    className={`absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 ${dir < 0 ? "left-4" : "right-4"}`}
                  >
                    {dir < 0 ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
                  </button>
                ))}
                <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                  <X className="size-5" />
                </button>
                <p className="absolute bottom-4 text-sm text-white/60">
                  {open + 1} / {paths.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
