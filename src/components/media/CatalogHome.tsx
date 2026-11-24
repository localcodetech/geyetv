import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";
import { getGenres, getMovieRows, getSeriesRows, isTmdbConfigured, type MediaRow, type MediaType } from "@/lib/tmdb";
import { FreeClassicsRow } from "@/components/media/FreeClassicsRow";
import { HeroCarousel } from "@/components/media/HeroCarousel";
import { PosterRow } from "@/components/media/PosterRow";
import { GenreChips } from "@/components/media/GenreChips";
import { TmdbNotice } from "@/components/media/TmdbNotice";

/** Shared /movies and /series home: rotating hero, genre shortcuts, then rows */
export function CatalogHome({ type }: { type: MediaType }) {
  // Loaded at request time (then cached) so builds never depend on TMDB being reachable
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent type={type} />
    </Suspense>
  );
}

function CatalogSkeleton() {
  return (
    <div className="animate-pulse pb-12">
      <div className="h-[68svh] bg-white/[0.03] sm:h-[78svh]" />
      <div className="mx-auto max-w-350 space-y-4 px-4 pt-8">
        <div className="h-6 w-48 rounded bg-white/5" />
        <div className="flex gap-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="aspect-2/3 w-[36%] shrink-0 rounded-xl bg-white/5 sm:w-40 lg:w-44" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function CatalogContent({ type }: { type: MediaType }) {
  await connection();
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  let rows: MediaRow[];
  try {
    rows = await (type === "tv" ? getSeriesRows() : getMovieRows());
  } catch (err) {
    console.error(`Loading ${type} rows failed:`, err);
    return <TmdbNotice reason="unreachable" />;
  }
  const genres = await getGenres(type).catch(() => []);
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
            {/* Free (public domain) films can be watched on G-Eye TV, so they get a row near the top */}
            {i === 0 && type === "movie" && (
              <Suspense>
                <FreeClassicsRow />
              </Suspense>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
