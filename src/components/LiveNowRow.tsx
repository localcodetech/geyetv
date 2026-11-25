"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Pause, Play } from "lucide-react";
import type { Channel } from "@/lib/channels";
import { ScrollRow } from "@/components/media/ScrollRow";
import { useRadio } from "@/components/radio/RadioProvider";

/** Live channels on the home page. TV opens the live player; radio starts playing right here (mini player). */
export function LiveNowRow({ title, channels, href }: { title: string; channels: Channel[]; href: string }) {
  const radio = useRadio();
  const isRadio = channels[0]?.type === "radio";

  return (
    <ScrollRow title={title} href={href} itemClassName={isRadio ? "w-[30%] sm:w-36" : "w-[44%] sm:w-56"}>
      {channels.map((c) => {
        const playing = radio.station?.id === c.id && (radio.status === "playing" || radio.status === "loading");
        const card = (
          <>
            <div
              className={`relative overflow-hidden rounded bg-panel ring-1 group-hover:ring-white/30 ${
                c.type === "radio" ? "aspect-square" : "aspect-video"
              } ${playing ? "ring-2 ring-brand" : "ring-line"}`}
            >
              <div className={`channel-logo absolute inset-0 ${c.type === "radio" ? "p-4" : "is-cropped"}`}>
                <Image src={c.logoUrl} alt="" width={320} height={320} sizes="240px" unoptimized={!c.logoUrl.startsWith("/")} className={c.type === "radio" ? "size-full rounded-full object-cover" : ""} />
              </div>
              <span className="tag absolute left-0 top-2">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                {c.type === "radio" ? "ON AIR" : "LIVE"}
              </span>
              {c.type === "radio" && (
                <span className={`absolute inset-0 grid place-items-center bg-black/40 transition-opacity ${playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <span className="grid size-10 place-items-center rounded-full bg-white text-black">
                    {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
                  </span>
                </span>
              )}
            </div>
            <p className="mt-2 truncate text-[13px] font-medium text-white/70 group-hover:text-white">{c.title}</p>
          </>
        );

        return (
          <motion.div key={c.id} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
            {c.type === "radio" ? (
              <button type="button" onClick={() => (radio.station?.id === c.id ? radio.toggle() : radio.play(c))} className="group block w-full text-left" aria-label={`${playing ? "Pause" : "Play"} ${c.title}`}>
                {card}
              </button>
            ) : (
              <Link href={`/live?c=${encodeURIComponent(c.id)}`} className="group block">
                {card}
              </Link>
            )}
          </motion.div>
        );
      })}
    </ScrollRow>
  );
}
