"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Download, Play, X } from "lucide-react";

type File = { url: string; label: string; sizeBytes: number };

type Props = {
  title: string;
  stream: File;
  downloads: File[];
  /** e.g. "Public domain" */
  licenseLabel: string;
  licenseUrl: string;
  archiveUrl: string;
};

const noSubscribe = () => () => {};
const formatSize = (bytes: number) => (bytes >= 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : `${Math.round(bytes / 1e6)} MB`);

/** "Watch free" + "Download" for films G-Eye TV may legally share (public domain / Creative Commons) */
export function FreeWatchActions({ title, stream, downloads, licenseLabel, licenseUrl, archiveUrl }: Props) {
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);

  // Close the download menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlaying(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [playing]);

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setPlaying(true)}
        className="btn btn-primary"
      >
        <Play className="size-4 fill-current" />
        Watch free
      </motion.button>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className="btn btn-secondary"
        >
          <Download className="size-4" />
          Download
          <ChevronDown className={`size-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-40 mt-2 w-72 overflow-hidden rounded bg-panel ring-1 ring-line"
            >
              {downloads.map((f) => (
                <a
                  key={f.url}
                  href={f.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-raised"
                >
                  <span className="font-semibold">{f.label} MP4</span>
                  <span className="text-white/50">{f.sizeBytes ? formatSize(f.sizeBytes) : ""}</span>
                </a>
              ))}
              <p className="border-t border-white/10 px-4 py-2.5 text-xs leading-relaxed text-white/45">
                {licenseLabel}. Files are hosted by the{" "}
                <a href={archiveUrl} target="_blank" rel="noreferrer" className="underline hover:text-white">
                  Internet Archive
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <a href={licenseUrl} target="_blank" rel="noreferrer" className="self-center text-sm text-muted underline-offset-4 hover:text-white hover:underline">
        {licenseLabel} · free to watch
      </a>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {playing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-300 flex flex-col bg-black"
                role="dialog"
                aria-label={`Watching ${title}`}
              >
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <p className="truncate font-semibold">{title}</p>
                  <button type="button" aria-label="Close player" onClick={() => setPlaying(false)} className="grid size-10 place-items-center rounded-full bg-raised hover:bg-line">
                    <X className="size-5" />
                  </button>
                </div>
                {/* Progressive MP4 straight from archive.org, which supports seeking (HTTP range requests) */}
                <video src={stream.url} controls autoPlay playsInline className="min-h-0 w-full flex-1 bg-black object-contain" />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
