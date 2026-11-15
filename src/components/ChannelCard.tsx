"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import type { Channel } from "@/lib/channels";

const FALLBACK_IMG = "https://i.imgur.com/PRL4asG.jpeg";

type Props = {
  channel: Channel;
  active: boolean;
  favorite: boolean;
  onSelect: () => void;
};

export function ChannelCard({ channel, active, favorite, onSelect }: Props) {
  const [src, setSrc] = useState(channel.logoUrl || FALLBACK_IMG);
  const isRadio = channel.type === "radio";

  return (
    <motion.button
      type="button"
      data-id={channel.id}
      data-active={active || undefined}
      onClick={onSelect}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group block w-full cursor-pointer text-left outline-none"
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#26262b] to-[#151518] ring-1 transition-shadow ${
          isRadio ? "aspect-square" : "aspect-video"
        } ${
          active
            ? "ring-2 ring-brand shadow-[0_0_24px_rgba(229,9,20,0.35)]"
            : "ring-white/10 group-hover:ring-white/30 group-focus-visible:ring-2 group-focus-visible:ring-brand"
        }`}
      >
        <div className={`channel-logo absolute inset-0 ${isRadio ? "p-4" : "is-cropped"}`}>
          <Image
            src={src}
            alt=""
            width={320}
            height={320}
            sizes="(max-width: 640px) 45vw, 240px"
            className={`transition-transform duration-300 group-hover:scale-[1.04] ${isRadio ? "size-full rounded-full object-cover" : ""}`}
            onError={() => setSrc(FALLBACK_IMG)}
          />
        </div>

        {active ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold tracking-wider">
            <Equalizer />
            {isRadio ? "ON AIR" : "WATCHING"}
          </span>
        ) : (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="size-1.5 rounded-full bg-brand" />
            LIVE
          </span>
        )}
        {favorite && <Heart className="absolute right-2 top-2 size-3.5 fill-brand text-brand" />}
      </div>
      <p className={`mt-2 truncate text-[13px] font-medium ${active ? "text-white" : "text-white/70 group-hover:text-white"}`}>
        {channel.title}
      </p>
    </motion.button>
  );
}

function Equalizer() {
  return (
    <span className="flex h-2.5 items-end gap-[2px]" aria-hidden>
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          key={delay}
          className="w-[2px] rounded-full bg-white"
          animate={{ height: ["30%", "100%", "50%", "80%", "30%"] }}
          transition={{ duration: 1, repeat: Infinity, delay }}
        />
      ))}
    </span>
  );
}
