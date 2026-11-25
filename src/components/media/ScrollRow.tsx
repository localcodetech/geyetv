"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  id?: string;
  title: string;
  /** "See all" link next to the title */
  href?: string;
  /** Tailwind width classes for each item */
  itemClassName?: string;
  children: React.ReactNode[];
};

/** Titled, horizontally scrolling row with arrow buttons on desktop */
export function ScrollRow({ id, title, href, itemClassName = "w-[36%] sm:w-40 lg:w-44", children }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="scroll-mt-24"
    >
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="heading text-xl sm:text-2xl">
          {title}
          {href && (
            <Link href={href} className="ml-3 text-sm font-medium text-brand hover:underline">
              See all ›
            </Link>
          )}
        </h2>
        <div className="hidden gap-1 sm:flex">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir < 0 ? "Scroll left" : "Scroll right"}
              onClick={() => page(dir)}
              className="grid size-8 place-items-center rounded-full bg-panel text-white/70 ring-1 ring-line transition hover:bg-line hover:text-white"
            >
              {dir < 0 ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          ))}
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 pt-1 sm:gap-4">
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
