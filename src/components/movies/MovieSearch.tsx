"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, Search, X } from "lucide-react";
import type { MovieSummary } from "@/lib/tmdb";
import { PosterCard } from "@/components/movies/PosterCard";

type SearchState = { query: string; results: MovieSummary[]; error: string | null };

/** Search box above the movie rows. While searching, results replace the rows (children). */
export function MovieSearch({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [done, setDone] = useState<SearchState | null>(null);
  const q = query.trim();

  useEffect(() => {
    if (!q) return;
    const ctrl = new AbortController();
    // Debounce typing
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data: { results: MovieSummary[]; error?: string } = await res.json();
        setDone({ query: q, results: data.results, error: data.error ?? null });
      } catch {
        if (!ctrl.signal.aborted) setDone({ query: q, results: [], error: "Search is unavailable right now" });
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  const loading = Boolean(q) && done?.query !== q;

  return (
    <>
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies"
          autoComplete="off"
          className="w-full rounded-full bg-white/[0.06] py-3 pl-11 pr-10 text-white outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:bg-white/10 focus:ring-brand"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="hover:text-white">
                <X className="size-4" />
              </button>
            )
          )}
        </span>
      </div>

      {q && done ? (
        <section>
          <h2 className="mb-4 text-lg font-bold sm:text-xl">
            Results for &ldquo;{done.query}&rdquo;
            <span className="ml-2 text-sm font-normal text-white/40">{done.results.length}</span>
          </h2>
          <motion.div layout className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-7">
            <AnimatePresence mode="popLayout" initial={false}>
              {done.results.map((m) => (
                <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}>
                  <PosterCard movie={m} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {!done.results.length && <p className="py-16 text-center text-white/50">{done.error ?? "No movies found"}</p>}
        </section>
      ) : (
        <div className={`space-y-10 transition-opacity ${loading ? "opacity-50" : ""}`}>{children}</div>
      )}
    </>
  );
}
