"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { VideoModal } from "@/components/media/VideoModal";

export function TrailerButton({ youtubeKey, title, variant = "primary" }: { youtubeKey: string; title: string; variant?: "primary" | "ghost" }) {
  const [open, setOpen] = useState(false);

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
      <VideoModal youtubeKey={open ? youtubeKey : null} title={`${title} trailer`} onClose={() => setOpen(false)} />
    </>
  );
}
