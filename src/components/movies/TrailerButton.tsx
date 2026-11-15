"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Play, X } from "lucide-react";

const noSubscribe = () => () => {};

/** Opens the YouTube trailer in a full-screen modal */
export function TrailerButton({ youtubeKey, title, variant = "primary" }: { youtubeKey: string; title: string; variant?: "primary" | "ghost" }) {
  const [open, setOpen] = useState(false);
  // The modal is portalled to <body>, which only exists in the browser
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? "inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-semibold shadow-[0_8px_24px_rgba(229,9,20,0.35)] transition-colors hover:bg-red-700"
            : "inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 font-semibold ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20"
        }
      >
        <Play className="size-4 fill-current" />
        Watch trailer
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-300 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
                role="dialog"
                aria-label={`${title} trailer`}
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl"
                >
                  <button
                    type="button"
                    aria-label="Close trailer"
                    onClick={() => setOpen(false)}
                    className="absolute -top-11 right-0 grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <X className="size-5" />
                  </button>
                  <div className="aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0`}
                      title={`${title} trailer`}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="size-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
