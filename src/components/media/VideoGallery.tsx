"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { ScrollRow } from "@/components/media/ScrollRow";
import { VideoModal } from "@/components/media/VideoModal";

type Video = { key: string; name: string; type: string };

/** Row of trailer / clip thumbnails that open in the video modal */
export function VideoGallery({ videos }: { videos: Video[] }) {
  const [playing, setPlaying] = useState<Video | null>(null);

  return (
    <>
      <ScrollRow title="Videos" itemClassName="w-[72%] sm:w-80">
        {videos.map((v) => (
          <motion.button key={v.key} type="button" whileHover={{ y: -4 }} onClick={() => setPlaying(v)} className="group block w-full text-left">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#1d1d21] ring-1 ring-white/10 group-hover:ring-white/30">
              <Image src={`https://i.ytimg.com/vi/${v.key}/hqdefault.jpg`} alt="" fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/10">
                <span className="grid size-12 place-items-center rounded-full bg-brand shadow-lg transition-transform group-hover:scale-110">
                  <Play className="size-5 fill-white" />
                </span>
              </span>
              <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">{v.type}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-white/80 group-hover:text-white">{v.name}</p>
          </motion.button>
        ))}
      </ScrollRow>
      <VideoModal youtubeKey={playing?.key ?? null} title={playing?.name ?? ""} onClose={() => setPlaying(null)} />
    </>
  );
}
