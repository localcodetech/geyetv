import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { getGenres, getMovieRows, getSeriesRows, isTmdbConfigured, type MediaRow, type MediaSummary, type MediaType } from "@/lib/tmdb";
import { getFreeClassics } from "@/lib/archive";
import { HeroCarousel } from "@/components/media/HeroCarousel";
import { PosterRow } from "@/components/media/PosterRow";
import { GenreChips } from "@/components/media/GenreChips";
import { TmdbNotice } from "@/components/media/TmdbNotice";

/** Shared /movies and /series home: rotating hero, genre shortcuts, then rows */
export async function CatalogHome({ type }: { type: MediaType }) {
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  let rows: MediaRow[];
  try {
    rows = await (type === "tv" ? getSeriesRows() : getMovieRows());
  } catch (err) {
    console.error(`Loading ${type} rows failed:`, err);
    return <TmdbNotice reason="unreachable" />;
  }
  const [genres, free] = await Promise.all([
    getGenres(type).catch(() => []),
    // Free (public domain) films can be watched on G-Eye TV, so they get a row near the top
    type === "movie" ? getFreeClassics().catch((): MediaSummary[] => []) : Promise.resolve([]),
  ]);
  const hero = (rows[0]?.items ?? []).filter((m) => m.backdropPath && m.overview).slice(0, 5);
  const browse = type === "tv" ? "/series/browse" : "/movies/browse";

  return (
    <div className="pb-12">
      <HeroCarousel items={hero} label="TRENDING THIS WEEK" />

      <div className={`relative z-10 mx-auto max-w-350 space-y-10 px-4 ${hero.length ? "-mt-6" : "pt-8"}`}>
        <div className="flex items-center gap-3">
          <Link
            href={browse}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-white/85"
          >
            <SlidersHorizontal className="size-4" />
            Browse all
          </Link>
          <div className="min-w-0 flex-1">
            <GenreChips type={type} genres={genres} />
          </div>
        </div>

        {rows.map((row, i) => (
          <div key={row.id} className="space-y-10">
            <PosterRow id={row.id} title={row.title} href={row.href} items={row.items} />
            {i === 0 && free.length > 0 && <PosterRow id="free" title="Free classics · watch now" href="/movies/free" items={free.slice(0, 20)} free />}
          </div>
        ))}
      </div>
    </div>
  );
}
