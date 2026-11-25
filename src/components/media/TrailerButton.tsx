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
            ? "btn btn-primary"
            : "btn btn-secondary"
        }
      >
        <Play className="size-4 fill-current" />
        Watch trailer
      </motion.button>
      <VideoModal youtubeKey={open ? youtubeKey : null} title={`${title} trailer`} onClose={() => setOpen(false)} />
    </>
  );
}
