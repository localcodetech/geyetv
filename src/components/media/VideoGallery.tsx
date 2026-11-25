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
          <motion.button key={v.key} type="button" onClick={() => setPlaying(v)} className="group block w-full text-left">
            <div className="relative aspect-video overflow-hidden rounded bg-panel ring-1 ring-line group-hover:ring-white/30">
              <Image src={`https://i.ytimg.com/vi/${v.key}/hqdefault.jpg`} alt="" fill unoptimized className="object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/10">
                <span className="grid size-12 place-items-center rounded-full bg-brand transition-transform">
                  <Play className="size-5 fill-white" />
                </span>
              </span>
              <span className="tag tag-dark absolute left-0 top-2">{v.type}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-white/80 group-hover:text-white">{v.name}</p>
          </motion.button>
        ))}
      </ScrollRow>
      <VideoModal youtubeKey={playing?.key ?? null} title={playing?.name ?? ""} onClose={() => setPlaying(null)} />
    </>
  );
}
