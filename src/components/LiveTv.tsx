"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { CirclePlay, Radio, Search, Tv } from "lucide-react";
import type { Channel, ChannelLists, ChannelType } from "@/lib/channels";
import { Player } from "@/components/Player";

const STORAGE_KEY = "geye:lastChannel";
const FALLBACK_IMG = "https://i.imgur.com/PRL4asG.jpeg";

const TABS = [
  { type: "tv", label: "TV", Icon: Tv },
  { type: "radio", label: "Radio", Icon: Radio },
] as const;

type Selection = { type: ChannelType; id: string };

function parseSaved(raw: string | null, lists: ChannelLists): Selection | null {
  try {
    const saved: Selection | null = JSON.parse(raw ?? "null");
    if (saved && lists[saved.type]?.some((c) => c.id === saved.id)) return saved;
  } catch {}
  return null;
}

const noSubscribe = () => () => {};

// The saved channel, or undefined while server rendering / hydrating (localStorage only exists in the browser)
function useSavedSelection(): string | null | undefined {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
    },
    () => undefined,
  );
}

export function LiveTv({ lists }: { lists: ChannelLists }) {
  const [tabChoice, setTab] = useState<ChannelType | null>(null);
  const [picked, setCurrent] = useState<Selection | null>(null);
  const savedRaw = useSavedSelection();
  const [query, setQuery] = useState("");
  const gridRef = useRef<HTMLUListElement>(null);

  // Resume the last channel watched, otherwise start with the first one
  const firstTv: Selection | null = lists.tv[0] ? { type: "tv", id: lists.tv[0].id } : null;
  const current = savedRaw === undefined ? null : picked ?? parseSaved(savedRaw, lists) ?? firstTv;
  const tab = tabChoice ?? current?.type ?? "tv";

  const channel = current && lists[current.type].find((c) => c.id === current.id);
  const q = query.trim().toLowerCase();
  const visible = lists[tab].filter((c) => c.title.toLowerCase().includes(q));

  const select = (type: ChannelType, id: string) => {
    setCurrent({ type, id });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, id })); } catch {}
  };

  // Keep the active channel visible in the list
  useEffect(() => {
    gridRef.current?.querySelector("[data-active]")?.scrollIntoView({ block: "nearest" });
  }, [current, tab]);

  // Arrow keys move to the previous / next visible channel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLVideoElement) return;
      const dir = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : e.key === "ArrowUp" || e.key === "PageUp" ? -1 : 0;
      if (!dir || !visible.length) return;
      e.preventDefault();

      let pos = visible.findIndex((c) => current?.type === tab && c.id === current.id);
      pos = pos === -1 ? 0 : (pos + dir + visible.length) % visible.length;
      const next = visible[pos];
      select(tab, next.id);
      gridRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <div className="mx-auto grid max-w-[1600px] gap-6 p-4 lg:grid-cols-[2fr_1fr]">
      {/* Mobile: keep the player visible while scrolling channels */}
      <div className="sticky top-[57px] z-50 bg-surface pb-1 pt-4 lg:static lg:pt-6">
        {channel ? (
          <Player key={`${channel.id}`} channel={channel} />
        ) : (
          <div className="mb-2.5 aspect-video w-full rounded-xl bg-black lg:mb-5" />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {channel && (
            <motion.span
              key={channel.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold lg:mb-4"
            >
              <CirclePlay className="size-4" />
              {channel.type === "radio" ? "Now Playing (Radio): " : "Now Playing: "}
              {channel.title}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="thin-scrollbar rounded-xl bg-[rgba(25,25,25,0.9)] p-5 lg:mt-6 lg:h-[70vh] lg:overflow-y-auto">
        <div className="mb-4 flex gap-2">
          {TABS.map(({ type, label, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setTab(type)}
              className={`relative rounded-full px-[18px] py-1.5 font-semibold transition-colors ${tab === type ? "text-white" : "text-[#ccc] hover:text-white"}`}
            >
              {tab === type && (
                <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
              )}
              <span className="relative inline-flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#777]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels..."
            autoComplete="off"
            className="w-full rounded-full border border-[#333] bg-[rgba(40,40,40,0.8)] py-1.5 pl-[34px] pr-3 text-white outline-none placeholder:text-[#777] focus:border-brand focus:bg-[rgba(50,50,50,0.9)]"
          />
        </div>

        <ul ref={gridRef} className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3 lg:grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((c) => (
              <motion.li
                key={`${tab}-${c.id}`}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
              >
                <ChannelCard
                  channel={c}
                  active={current?.type === tab && current.id === c.id}
                  onSelect={() => select(tab, c.id)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {!visible.length && <p className="mt-5 text-center text-sm text-[#777]">No channels found</p>}
      </div>
    </div>
  );
}

function ChannelCard({ channel, active, onSelect }: { channel: Channel; active: boolean; onSelect: () => void }) {
  const [src, setSrc] = useState(channel.logoUrl || FALLBACK_IMG);

  return (
    <motion.button
      type="button"
      data-id={channel.id}
      data-active={active || undefined}
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative size-full cursor-pointer rounded-lg border p-2.5 text-center outline-none transition-colors hover:border-brand hover:bg-[rgba(60,60,60,0.8)] focus-visible:border-brand ${
        active ? "border-brand bg-[rgba(229,9,20,0.15)]" : "border-white/5 bg-[rgba(40,40,40,0.6)]"
      }`}
    >
      {active && <span className="absolute right-1.5 top-1.5 size-2 animate-pulse rounded-full bg-brand" />}
      <div className={`channel-logo relative mb-2 aspect-[2/1] w-full overflow-hidden ${channel.type === "tv" ? "is-cropped" : ""}`}>
        <Image
          src={src}
          alt={channel.title}
          width={240}
          height={240}
          sizes="170px"
          className={channel.type === "tv" ? "" : "size-full object-contain"}
          onError={() => setSrc(FALLBACK_IMG)}
        />
      </div>
      <p className={`text-[11px] font-medium leading-tight ${active ? "text-white" : "text-[#ccc]"}`}>{channel.title}</p>
    </motion.button>
  );
}
