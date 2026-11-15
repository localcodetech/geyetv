"use client";

import { useMemo, useSyncExternalStore } from "react";

// Per-viewer preferences kept in localStorage: last channel watched and favorite channels.
// Exposed through useSyncExternalStore so server render / hydration see `undefined`.

const LAST_KEY = "geye:lastChannel";
const FAV_KEY = "geye:favorites";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const notify = () => listeners.forEach((l) => l());

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
  notify();
}

/** Channel id from a shared link (?c=…), else the last channel watched. Undefined until hydrated. */
export function useStartChannelId(): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => {
      const fromUrl = new URLSearchParams(window.location.search).get("c");
      if (fromUrl) return fromUrl;
      try {
        // Older versions stored { type, id }
        return (JSON.parse(read(LAST_KEY) ?? "null") as { id?: string } | null)?.id ?? null;
      } catch {
        return null;
      }
    },
    () => undefined,
  );
}

export function saveLastChannel(id: string, type: string) {
  write(LAST_KEY, JSON.stringify({ type, id }));
  // Keep the address bar shareable
  window.history.replaceState(null, "", `?c=${encodeURIComponent(id)}`);
}

export function useFavorites(): Set<string> {
  const raw = useSyncExternalStore(subscribe, () => read(FAV_KEY) ?? "[]", () => "[]");
  return useMemo(() => {
    try { return new Set<string>(JSON.parse(raw)); } catch { return new Set<string>(); }
  }, [raw]);
}

export function toggleFavorite(id: string) {
  let favs: string[] = [];
  try { favs = JSON.parse(read(FAV_KEY) ?? "[]"); } catch {}
  write(FAV_KEY, JSON.stringify(favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]));
}

// "My List": movies and series saved for later. Stores enough to render a poster card offline.

const LIST_KEY = "geye:myList";

export type SavedItem = {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: string;
  rating: number;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
};

const listRaw = () => read(LIST_KEY) ?? "[]";

/** Saved titles, newest first. Empty while server rendering / hydrating. */
export function useMyList(): SavedItem[] {
  const raw = useSyncExternalStore(subscribe, listRaw, () => "[]");
  return useMemo(() => {
    try { return JSON.parse(raw) as SavedItem[]; } catch { return []; }
  }, [raw]);
}

export function toggleSaved(item: SavedItem) {
  let items: SavedItem[] = [];
  try { items = JSON.parse(listRaw()); } catch {}
  const exists = items.some((i) => i.id === item.id && i.type === item.type);
  write(LIST_KEY, JSON.stringify(exists ? items.filter((i) => !(i.id === item.id && i.type === item.type)) : [item, ...items]));
}
