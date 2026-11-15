"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import { AnimatePresence, motion } from "motion/react";
import { CirclePlay, LoaderCircle, RotateCw, TriangleAlert } from "lucide-react";
import type { Channel } from "@/lib/channels";

type Overlay = { state: "loading" | "error" | "paused"; message: string } | null;

const LOADING: Overlay = { state: "loading", message: "Loading stream..." };
const UNAVAILABLE: Overlay = { state: "error", message: "Stream unavailable" };

/** Plays one channel. Remount it (key={channel.id}) to switch channels. */
export function Player({ channel }: { channel: Channel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let recoveredOnce = false;

    const play = () => {
      video.play()?.catch(() => setOverlay({ state: "paused", message: "Tap to play" }));
    };

    // Radio streams are plain mp3, no HLS needed
    if (channel.type === "radio" || !channel.streamUrl.includes(".m3u8")) {
      video.src = channel.streamUrl;
      play();
    } else import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(channel.streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, play);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recoveredOnce) {
            recoveredOnce = true;
            hls.recoverMediaError();
            return;
          }
          setOverlay(UNAVAILABLE);
        });
      }
      // For Safari/iOS which supports HLS natively
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = channel.streamUrl;
        video.addEventListener("loadedmetadata", play, { once: true });
      }
    });

    return () => {
      cancelled = true;
      hlsRef.current?.destroy(); // Clean up current stream before loading a new one
      hlsRef.current = null;
      video.removeAttribute("src");
      video.load();
    };
  }, [channel, attempt]);

  const retry = () => {
    setOverlay(LOADING);
    setAttempt((a) => a + 1);
  };

  return (
    <div className="relative mb-2.5 aspect-video w-full overflow-hidden rounded-xl bg-black shadow-[0_10px_30px_rgba(0,0,0,0.5)] lg:mb-5">
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        poster={channel.type === "radio" ? channel.logoUrl : undefined}
        className="absolute inset-0 size-full"
        onPlaying={() => setOverlay(null)}
        onWaiting={() => setOverlay(LOADING)}
        onError={() => {
          if (!hlsRef.current) setOverlay(UNAVAILABLE);
        }}
      />

      <AnimatePresence>
        {overlay && (
          <motion.div
            key={overlay.state}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={overlay.state === "paused" ? () => videoRef.current?.play() : undefined}
            className={
              "absolute inset-0 flex flex-col items-center justify-center gap-3 " +
              (overlay.state === "loading"
                ? "pointer-events-none bg-black/60"
                : "bg-black/80" + (overlay.state === "paused" ? " cursor-pointer" : ""))
            }
          >
            {overlay.state === "loading" && <LoaderCircle className="size-8 animate-spin" />}
            {overlay.state === "error" && <TriangleAlert className="size-10 text-brand" />}
            {overlay.state === "paused" && (
              <motion.span whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <CirclePlay className="size-14" strokeWidth={1.5} />
              </motion.span>
            )}
            <p className="text-[15px] text-[#ddd]">{overlay.message}</p>
            {overlay.state === "error" && (
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1 text-sm font-medium hover:bg-red-700"
              >
                <RotateCw className="size-3.5" />
                Retry
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
