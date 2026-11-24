"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, Heart, Search, Share2, X } from "lucide-react";
import type { Channel, ChannelLists } from "@/lib/channels";
import { saveLastChannel, toggleFavorite, useFavorites, useStartChannelId } from "@/lib/viewer-prefs";
import { Player } from "@/components/Player";
import { RadioStage } from "@/components/radio/RadioStage";
import { useRadio } from "@/components/radio/RadioProvider";
import { ChannelCard } from "@/components/ChannelCard";
import { ChannelRow } from "@/components/ChannelRow";

// Rows appear in this order; categories not listed here go after them, Radio always last
const CATEGORY_ORDER = ["Entertainment & Music", "News", "Movies & Series", "Kids", "Sports", "Documentaries", "Faith", "Live TV"];
const FAVORITES = "My channels";

function groupByCategory(channels: Channel[]) {
  const groups = new Map<string, Channel[]>();
  for (const c of channels) groups.set(c.category, [...(groups.get(c.category) ?? []), c]);
  const rank = (cat: string) => (cat === "Radio" ? 999 : CATEGORY_ORDER.indexOf(cat) === -1 ? 500 : CATEGORY_ORDER.indexOf(cat));
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}

export function LiveTv({ lists }: { lists: ChannelLists }) {
  const all = [...lists.tv, ...lists.radio];
  const rows = groupByCategory(all);
  const ordered = rows.flatMap(([, channels]) => channels);

  const [pickedId, setPickedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [toast, setToast] = useState<string | null>(null);
  const startId = useStartChannelId();
  const favorites = useFavorites();
  const radio = useRadio();

  // Shared link or last channel watched, otherwise the first channel. Nothing plays until hydrated.
  const currentId =
    startId === undefined ? null : pickedId ?? (all.some((c) => c.id === startId) ? startId : ordered[0]?.id ?? null);
  const channel = all.find((c) => c.id === currentId) ?? null;

  const favChannels = ordered.filter((c) => favorites.has(c.id));
  const chips = ["All", ...(favChannels.length ? [FAVORITES] : []), ...rows.map(([cat]) => cat)];
  const activeFilter = chips.includes(filter) ? filter : "All";

  const q = query.trim().toLowerCase();
  const results = q
    ? ordered.filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
    : activeFilter === FAVORITES
      ? favChannels
      : activeFilter !== "All"
        ? ordered.filter((c) => c.category === activeFilter)
        : null;

  const select = (c: Channel) => {
    setPickedId(c.id);
    saveLastChannel(c.id, c.type);
    // Radio plays through the site-wide radio player; started here because browsers need a tap to play audio
    if (c.type === "radio") radio.play(c);
  };

  const step = (dir: 1 | -1) => {
    const list = results?.length ? results : ordered;
    if (!list.length) return;
    const pos = list.findIndex((c) => c.id === currentId);
    const next = list[pos === -1 ? 0 : (pos + dir + list.length) % list.length];
    select(next);
    return next;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const share = async () => {
    if (!channel) return;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${channel.title} on G-Eye TV`, url });
      else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied");
      }
    } catch {}
  };

  // Never play the radio over a TV channel
  const { station: radioStation, stop: stopRadio } = radio;
  useEffect(() => {
    if (channel?.type === "tv" && radioStation) stopRadio();
  }, [channel, radioStation, stopRadio]);

  // Keep the active card visible inside its row, without scrolling the page
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(`[data-row] [data-id="${currentId}"]`).forEach((card) => {
      const row = card.closest<HTMLElement>("[data-row]")!;
      const item = card.parentElement!;
      row.scrollTo({ left: item.offsetLeft - row.clientWidth / 2 + item.clientWidth / 2, behavior: "smooth" });
    });
  }, [currentId]);

  // ↑ / ↓ (and Page Up / Down) zap through channels like a TV remote
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLVideoElement) return;
      const dir = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : e.key === "ArrowUp" || e.key === "PageUp" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      step(dir);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <div className="pb-10">
      {/* Hero player. On mobile it stays pinned while browsing channels. */}
      <section className="sticky top-[57px] z-40 bg-surface/95 backdrop-blur lg:static lg:bg-transparent lg:backdrop-blur-none">
        <div className="mx-auto max-w-[min(1400px,calc((100svh-200px)*16/9))] px-0 sm:px-4 sm:pt-4">
          <div className="overflow-hidden bg-black ring-white/10 sm:rounded-2xl sm:shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:ring-1">
            {!channel ? (
              <div className="aspect-video w-full bg-black" />
            ) : channel.type === "radio" ? (
              <RadioStage station={channel} />
            ) : (
              <Player key={channel.id} channel={channel} />
            )}
          </div>

          {/* Now playing */}
          <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-0">
            <AnimatePresence mode="wait" initial={false}>
              {channel && (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div
                    className={`channel-logo relative hidden h-11 shrink-0 overflow-hidden rounded-lg bg-[#1d1d21] ring-1 ring-white/10 sm:block ${
                      channel.type === "radio" ? "w-11" : "is-cropped w-20"
                    }`}
                  >
                    <Image src={channel.logoUrl} alt="" width={160} height={160} unoptimized={!channel.logoUrl.startsWith("/")} className={channel.type === "radio" ? "size-full object-cover" : ""} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-brand">
                      <span className="size-1.5 animate-pulse rounded-full bg-brand" />
                      {channel.type === "radio" ? "ON AIR" : "LIVE"}
                      <span className="font-medium tracking-normal text-white/40">· {channel.category}</span>
                    </div>
                    <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">{channel.title}</h1>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {channel && (
              <div className="flex shrink-0 items-center gap-1.5">
                <IconButton label="Previous channel" onClick={() => step(-1)}>
                  <ChevronUp className="size-4" />
                </IconButton>
                <IconButton label="Next channel" onClick={() => step(1)}>
                  <ChevronDown className="size-4" />
                </IconButton>
                <IconButton
                  label={favorites.has(channel.id) ? "Remove from my channels" : "Add to my channels"}
                  onClick={() => {
                    showToast(favorites.has(channel.id) ? "Removed from My channels" : "Added to My channels");
                    toggleFavorite(channel.id);
                  }}
                >
                  <motion.span key={String(favorites.has(channel.id))} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                    <Heart className={`size-4 ${favorites.has(channel.id) ? "fill-brand text-brand" : ""}`} />
                  </motion.span>
                </IconButton>
                <IconButton label="Share" onClick={share}>
                  <Share2 className="size-4" />
                </IconButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Browse */}
      <section id="channels" className="mx-auto max-w-[1400px] scroll-mt-20 px-4">
        <div className="mb-6 flex flex-col gap-3 border-t border-white/10 pt-6 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels and radio"
              autoComplete="off"
              className="w-full rounded-full bg-white/[0.06] py-2.5 pl-10 pr-9 text-sm text-white outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:bg-white/10 focus:ring-brand"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setFilter(chip);
                  setQuery("");
                }}
                className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !q && activeFilter === chip ? "text-white" : "text-white/60 ring-1 ring-white/10 hover:text-white"
                }`}
              >
                {!q && activeFilter === chip && (
                  <motion.span layoutId="chip-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                )}
                <span className="relative">{chip}</span>
              </button>
            ))}
          </div>
        </div>

        {results ? (
          <div>
            <h2 className="mb-4 text-lg font-bold sm:text-xl">
              {q ? `Results for "${query.trim()}"` : activeFilter}
              <span className="ml-2 text-sm font-normal text-white/40">{results.length}</span>
            </h2>
            <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 xl:grid-cols-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChannelCard channel={c} active={c.id === currentId} favorite={favorites.has(c.id)} onSelect={() => select(c)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {!results.length && <p className="py-16 text-center text-white/50">No channels found</p>}
          </div>
        ) : (
          <div className="space-y-9">
            {favChannels.length > 0 && (
              <ChannelRow title={FAVORITES} channels={favChannels} currentId={currentId} favorites={favorites} onSelect={select} />
            )}
            {rows.map(([category, channels]) => (
              <ChannelRow key={category} title={category} channels={channels} currentId={currentId} favorites={favorites} onSelect={select} />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {toast && (
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-200 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow-lg"
            >
              {toast}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="grid size-9 place-items-center rounded-full bg-white/[0.07] text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-white"
    >
      {children}
    </motion.button>
  );
}
