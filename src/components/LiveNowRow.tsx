"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Channel } from "@/lib/channels";
import { ScrollRow } from "@/components/media/ScrollRow";

/** Live channels on the home page; each opens the live player on that channel */
export function LiveNowRow({ title, channels, href }: { title: string; channels: Channel[]; href: string }) {
  return (
    <ScrollRow title={title} href={href} itemClassName={channels[0]?.type === "radio" ? "w-[30%] sm:w-36" : "w-[44%] sm:w-56"}>
      {channels.map((c) => (
        <motion.div key={c.id} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
          <Link href={`/live?c=${encodeURIComponent(c.id)}`} className="group block">
            <div
              className={`relative overflow-hidden rounded-xl bg-linear-to-br from-[#26262b] to-[#151518] ring-1 ring-white/10 group-hover:ring-white/30 ${
                c.type === "radio" ? "aspect-square" : "aspect-video"
              }`}
            >
              <div className={`channel-logo absolute inset-0 ${c.type === "radio" ? "p-4" : "is-cropped"}`}>
                <Image src={c.logoUrl} alt="" width={320} height={320} sizes="240px" unoptimized={!c.logoUrl.startsWith("/")} className={c.type === "radio" ? "size-full rounded-full object-cover" : ""} />
              </div>
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold tracking-wider">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                {c.type === "radio" ? "ON AIR" : "LIVE"}
              </span>
            </div>
            <p className="mt-2 truncate text-[13px] font-medium text-white/70 group-hover:text-white">{c.title}</p>
          </Link>
        </motion.div>
      ))}
    </ScrollRow>
  );
}
