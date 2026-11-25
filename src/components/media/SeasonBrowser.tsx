"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Clock, ImageOff, LoaderCircle, Star } from "lucide-react";
import { formatDate, formatRuntime, tmdbImage } from "@/lib/media";
import type { Season, SeasonSummary } from "@/lib/tmdb";

type Props = { seriesId: number; seasons: SeasonSummary[]; initial: Season | null };

/** Season tabs with the episode list of the selected season */
export function SeasonBrowser({ seriesId, seasons, initial }: Props) {
  const [loaded, setLoaded] = useState<Record<number, Season>>(initial ? { [initial.seasonNumber]: initial } : {});
  const [selected, setSelected] = useState(initial?.seasonNumber ?? seasons[0]?.seasonNumber ?? 1);
  const [error, setError] = useState<string | null>(null);
  const season = loaded[selected];

  const choose = async (n: number) => {
    setSelected(n);
    setError(null);
    if (loaded[n]) return;
    try {
      const res = await fetch(`/api/series/${seriesId}/season/${n}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLoaded((l) => ({ ...l, [n]: data }));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Episodes are unavailable right now");
    }
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="heading text-xl sm:text-2xl">Episodes</h2>
        <p className="text-sm text-white/45">
          {seasons.length} season{seasons.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {seasons.map((s) => (
          <button
            key={s.seasonNumber}
            type="button"
            onClick={() => choose(s.seasonNumber)}
            className={`relative shrink-0 rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === s.seasonNumber ? "text-white" : "text-white/60 ring-1 ring-inset ring-line hover:text-white"
            }`}
          >
            {selected === s.seasonNumber && (
              <span className="absolute inset-0 rounded bg-brand" />
            )}
            <span className="relative">{s.seasonNumber === 0 ? "Specials" : `Season ${s.seasonNumber}`}</span>
          </button>
        ))}
      </div>

      {error ? (
        <p className="py-10 text-center text-white/50">{error}</p>
      ) : !season ? (
        <div className="grid place-items-center py-16">
          <LoaderCircle className="size-7 animate-spin text-white/50" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={selected} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {season.overview && <p className="mb-5 max-w-3xl text-sm text-white/60">{season.overview}</p>}
            <ol className="space-y-3">
              {season.episodes.map((e) => (
                <li key={e.id} className="flex gap-4 rounded bg-panel p-3 ring-1 ring-white/[0.06] transition-colors hover:bg-panel">
                  <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded bg-panel sm:w-56">
                    {e.stillPath ? (
                      <Image src={tmdbImage(e.stillPath, "w300")!} alt="" fill unoptimized className="object-cover" />
                    ) : (
                      <ImageOff className="absolute inset-0 m-auto size-6 text-white/20" />
                    )}
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/75 px-1.5 text-xs font-bold">E{e.episodeNumber}</span>
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="font-semibold leading-tight">
                      {e.episodeNumber}. {e.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                      {e.airDate && <span>{formatDate(e.airDate)}</span>}
                      {e.runtime ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatRuntime(e.runtime)}
                        </span>
                      ) : null}
                      {e.rating > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3 fill-current text-muted" />
                          {e.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {e.overview && <p className="mt-2 line-clamp-2 text-sm text-white/65 sm:line-clamp-3">{e.overview}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
