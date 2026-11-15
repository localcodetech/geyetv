import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Info, Star } from "lucide-react";
import { getMovie, getMovieRows, isTmdbConfigured, tmdbImage, type MovieRow } from "@/lib/tmdb";
import { PosterRow } from "@/components/movies/PosterRow";
import { MovieSearch } from "@/components/movies/MovieSearch";
import { TrailerButton } from "@/components/movies/TrailerButton";
import { TmdbNotice } from "@/components/movies/TmdbNotice";

export const metadata: Metadata = {
  title: "Movies | G-Eye TV",
  description: "Discover trending movies, Nollywood and African cinema, trailers and where to watch.",
};

export default async function MoviesPage() {
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  let rows: MovieRow[];
  try {
    rows = await getMovieRows();
  } catch (err) {
    console.error("Loading movie rows failed:", err);
    return <TmdbNotice reason="unreachable" />;
  }

  const featured = rows[0]?.movies.find((m) => m.backdropPath);
  const featuredDetails = featured ? await getMovie(featured.id).catch(() => null) : null;

  return (
    <div className="pb-12">
      {featured && (
        <section className="relative isolate -mt-px overflow-hidden">
          <Image
            src={tmdbImage(featured.backdropPath, "w1280")!}
            alt=""
            fill
            priority
            unoptimized
            className="-z-10 object-cover object-top"
          />
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-surface via-surface/80 to-transparent" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-surface via-transparent to-surface/30" />

          <div className="mx-auto flex min-h-[62svh] max-w-[1400px] flex-col justify-end px-4 pb-14 pt-24 sm:min-h-[70svh]">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand">TRENDING THIS WEEK</p>
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">{featured.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
              {featured.rating > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {featured.rating.toFixed(1)}
                </span>
              )}
              <span>{featured.year}</span>
              {featuredDetails?.genres.length ? <span>{featuredDetails.genres.slice(0, 3).join(" · ")}</span> : null}
            </div>
            <p className="mt-4 line-clamp-3 max-w-xl text-white/80 sm:text-lg">{featured.overview}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {featuredDetails?.trailerKey && <TrailerButton youtubeKey={featuredDetails.trailerKey} title={featured.title} />}
              <Link
                href={`/movies/${featured.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 font-semibold ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20"
              >
                <Info className="size-4" />
                More info
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className={`mx-auto max-w-[1400px] px-4 ${featured ? "relative z-10 -mt-6" : "pt-8"}`}>
        <MovieSearch>
          {rows.map((row) => (
            <PosterRow key={row.id} id={row.id} title={row.title} movies={row.movies} />
          ))}
        </MovieSearch>
      </div>
    </div>
  );
}
