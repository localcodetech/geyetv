"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Channel } from "@/lib/channels";
import { ChannelCard } from "@/components/ChannelCard";

type Props = {
  title: string;
  channels: Channel[];
  currentId: string | null;
  favorites: Set<string>;
  onSelect: (c: Channel) => void;
};

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** A horizontally scrolling row of channels, like the rows on a streaming app home screen. */
export function ChannelRow({ title, channels, currentId, favorites, onSelect }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const isRadio = channels[0]?.type === "radio";

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <motion.section
      id={slugify(title)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group/row relative scroll-mt-24"
    >
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          {title}
          <span className="ml-2 text-sm font-normal text-white/40">{channels.length}</span>
        </h2>
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

      <div
        ref={scroller}
        data-row
        className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 pt-1 sm:gap-4"
      >
        {channels.map((c) => (
          <div key={c.id} className={`shrink-0 snap-start ${isRadio ? "w-[34%] sm:w-40" : "w-[44%] sm:w-56"}`}>
            <ChannelCard
              channel={c}
              active={c.id === currentId}
              favorite={favorites.has(c.id)}
              onSelect={() => onSelect(c)}
            />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
