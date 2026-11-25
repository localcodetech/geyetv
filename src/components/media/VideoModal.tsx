"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

const noSubscribe = () => () => {};

/** Full-screen YouTube player. Pass `youtubeKey={null}` to close. */
export function VideoModal({ youtubeKey, title, onClose }: { youtubeKey: string | null; title: string; onClose: () => void }) {
  // The modal is portalled to <body>, which only exists in the browser
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  useEffect(() => {
    if (!youtubeKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [youtubeKey, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {youtubeKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-300 grid place-items-center bg-black/85 p-4"
          role="dialog"
          aria-label={title}
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
              aria-label="Close video"
              onClick={onClose}
              className="absolute -top-11 right-0 grid size-9 place-items-center rounded-full bg-raised hover:bg-line"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video overflow-hidden rounded bg-black ring-1 ring-line">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0`}
                title={title}
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
  );
}
