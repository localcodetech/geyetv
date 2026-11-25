"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, Search, UserRound, X } from "lucide-react";
import { tmdbImage } from "@/lib/media";
import type { SearchResults } from "@/lib/tmdb";
import { PosterCard } from "@/components/media/PosterCard";

type Done = SearchResults & { query: string; error: string | null };
type Filter = "all" | "movie" | "tv";

/** Search across movies, series and people. The query is kept in the URL (?q=) so results can be shared. */
export function SearchView() {
  const initialQuery = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [done, setDone] = useState<Done | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const q = query.trim();

  useEffect(() => {
    window.history.replaceState(null, "", q ? `?q=${encodeURIComponent(q)}` : window.location.pathname);
    if (!q) return;
    const ctrl = new AbortController();
    // Debounce typing
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data: SearchResults & { error?: string } = await res.json();
        setDone({ ...data, query: q, error: data.error ?? null });
      } catch {
        if (!ctrl.signal.aborted) setDone({ media: [], people: [], query: q, error: "Search is unavailable right now" });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  const loading = Boolean(q) && done?.query !== q;
  const media = done?.media.filter((m) => filter === "all" || m.type === filter) ?? [];
  const counts = { all: done?.media.length ?? 0, movie: done?.media.filter((m) => m.type === "movie").length ?? 0, tv: done?.media.filter((m) => m.type === "tv").length ?? 0 };

  return (
    <>
      <div className="relative mb-6 max-w-2xl">
        <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, series and people"
          autoComplete="off"
          autoFocus
          className="w-full rounded bg-panel py-4 pl-14 pr-12 text-lg text-white outline-none ring-1 ring-line transition placeholder:text-white/40 focus:bg-raised focus:ring-brand"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50">
          {loading ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="hover:text-white">
                <X className="size-5" />
              </button>
            )
          )}
        </span>
      </div>

      {!q ? (
        <p className="py-16 text-center text-white/45">Find any movie, series, actor or director.</p>
      ) : done ? (
        <div className={`space-y-10 transition-opacity ${loading ? "opacity-50" : ""}`}>
          {done.people.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">People</h2>
              <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4">
                {done.people.map((p) => (
                  <Link key={p.id} href={`/person/${p.id}`} className="group w-24 shrink-0 text-center">
                    <div className="relative mx-auto mb-2 size-20 overflow-hidden rounded-full bg-panel ring-1 ring-line group-hover:ring-2 group-hover:ring-brand">
                      {p.profilePath ? (
                        <Image src={tmdbImage(p.profilePath, "w185")!} alt={p.name} fill unoptimized className="object-cover" />
                      ) : (
                        <UserRound className="absolute inset-0 m-auto size-8 text-white/20" />
                      )}
                    </div>
                    <p className="truncate text-sm font-medium group-hover:text-brand">{p.name}</p>
                    <p className="truncate text-xs text-white/45">{p.knownFor}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="mr-2 text-lg font-bold">Titles</h2>
              {(["all", "movie", "tv"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`relative rounded px-3.5 py-1 text-sm font-medium ${filter === f ? "text-white" : "text-white/60 ring-1 ring-inset ring-line hover:text-white"}`}
                >
                  {filter === f && <span className="absolute inset-0 rounded bg-brand" />}
                  <span className="relative">
                    {f === "all" ? "All" : f === "movie" ? "Movies" : "Series"} {counts[f]}
                  </span>
                </button>
              ))}
            </div>
            <motion.div layout className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-7">
              <AnimatePresence mode="popLayout" initial={false}>
                {media.map((m) => (
                  <motion.div key={`${m.type}-${m.id}`} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}>
                    <PosterCard item={m} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {!media.length && <p className="py-16 text-center text-white/50">{done.error ?? `No results for "${done.query}"`}</p>}
          </section>
        </div>
      ) : (
        <div className="grid place-items-center py-16">
          <LoaderCircle className="size-7 animate-spin text-white/50" />
        </div>
      )}
    </>
  );
}
