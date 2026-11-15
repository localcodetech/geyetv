import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Download, ExternalLink, Star, UserRound } from "lucide-react";
import { getMovie, isTmdbConfigured, REGION, tmdbImage, type Provider } from "@/lib/tmdb";
import { PosterRow } from "@/components/movies/PosterRow";
import { TrailerButton } from "@/components/movies/TrailerButton";
import { TmdbNotice } from "@/components/movies/TmdbNotice";

const parseId = (id: string) => (/^\d{1,9}$/.test(id) ? Number(id) : null);

export async function generateMetadata({ params }: PageProps<"/movies/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const movie = id && isTmdbConfigured() ? await getMovie(id).catch(() => null) : null;
  if (!movie) return { title: "Movie | G-Eye TV" };

  const image = tmdbImage(movie.backdropPath, "w1280");
  return {
    title: `${movie.title}${movie.year ? ` (${movie.year})` : ""} | G-Eye TV`,
    description: movie.overview,
    openGraph: { title: movie.title, description: movie.overview, images: image ? [image] : [] },
  };
}

export default function MoviePage(props: PageProps<"/movies/[id]">) {
  // Params are read inside Suspense so unknown movie ids still get an instant page shell
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <MovieDetails params={props.params} />
    </Suspense>
  );
}

async function MovieDetails({ params }: Pick<PageProps<"/movies/[id]">, "params">) {
  const id = parseId((await params).id);
  if (!id) notFound();
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  const movie = await getMovie(id).catch((err) => {
    console.error(`Loading movie ${id} failed:`, err);
    return undefined;
  });
  if (movie === undefined) return <TmdbNotice reason="unreachable" />;
  if (!movie) notFound();

  const backdrop = tmdbImage(movie.backdropPath, "w1280");
  const poster = tmdbImage(movie.posterPath, "w500");
  const hasProviders = movie.watch.stream.length + movie.watch.rent.length + movie.watch.buy.length > 0;

  return (
    <article className="pb-12">
      <section className="relative isolate overflow-hidden">
        {backdrop && <Image src={backdrop} alt="" fill priority unoptimized className="-z-10 object-cover object-top opacity-60" />}
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-surface via-surface/85 to-surface/40" />

        <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-6">
          <Link href="/movies" className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="size-4" />
            All movies
          </Link>

          <div className="flex flex-col gap-8 md:flex-row">
            {poster && (
              <div className="relative mx-auto aspect-2/3 w-52 shrink-0 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 md:mx-0 md:w-72">
                <Image src={poster} alt={movie.title} fill priority unoptimized className="object-cover" />
              </div>
            )}

            <div className="min-w-0 flex-1 md:pt-6">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                {movie.title}
                {movie.year && <span className="ml-3 text-2xl font-normal text-white/40 sm:text-3xl">({movie.year})</span>}
              </h1>
              {movie.tagline && <p className="mt-2 italic text-white/60">{movie.tagline}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
                {movie.rating > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {movie.rating.toFixed(1)}
                    <span className="font-normal text-white/40">TMDB</span>
                  </span>
                )}
                {movie.certification && <span className="rounded border border-white/30 px-1.5 text-xs">{movie.certification}</span>}
                {movie.runtime && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
                <span className="uppercase">{movie.originalLanguage}</span>
              </div>

              {movie.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <span key={g} className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-medium ring-1 ring-white/10">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-6 max-w-3xl leading-relaxed text-white/80">{movie.overview || "No description available."}</p>
              {movie.director && (
                <p className="mt-4 text-sm text-white/60">
                  Directed by <span className="font-semibold text-white">{movie.director}</span>
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {movie.trailerKey && <TrailerButton youtubeKey={movie.trailerKey} title={movie.title} />}
                {/* Streaming and downloads arrive once G-Eye TV hosts licensed copies (Epics 2, 4, 5) */}
                <span
                  title="Not available to stream or download on G-Eye TV yet"
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-white/5 px-5 py-2.5 font-semibold text-white/35 ring-1 ring-white/10"
                >
                  <Download className="size-4" />
                  Not on G-Eye TV yet
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] space-y-12 px-4">
        <section>
          <h2 className="mb-4 text-lg font-bold sm:text-xl">Where to watch</h2>
          {hasProviders ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-10">
              <ProviderGroup label="Stream" providers={movie.watch.stream} />
              <ProviderGroup label="Rent" providers={movie.watch.rent} />
              <ProviderGroup label="Buy" providers={movie.watch.buy} />
            </div>
          ) : (
            <p className="text-white/50">No streaming information for your region ({REGION}) yet.</p>
          )}
          {movie.watch.link && (
            <a href={movie.watch.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
              Availability data by JustWatch
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </section>

        {movie.cast.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold sm:text-xl">Cast</h2>
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
              {movie.cast.map((c) => (
                <div key={c.id} className="w-28 shrink-0 text-center">
                  <div className="relative mx-auto mb-2 size-24 overflow-hidden rounded-full bg-[#1d1d21] ring-1 ring-white/10">
                    {c.profilePath ? (
                      <Image src={tmdbImage(c.profilePath, "w185")!} alt={c.name} fill unoptimized className="object-cover" />
                    ) : (
                      <UserRound className="absolute inset-0 m-auto size-10 text-white/20" />
                    )}
                  </div>
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-white/50">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {movie.similar.length > 0 && <PosterRow title="More like this" movies={movie.similar} />}
      </div>
    </article>
  );
}

function ProviderGroup({ label, providers }: { label: string; providers: Provider[] }) {
  if (!providers.length) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <Image
            key={p.id}
            src={tmdbImage(p.logoPath, "w92")!}
            alt={p.name}
            title={p.name}
            width={44}
            height={44}
            unoptimized
            className="rounded-lg ring-1 ring-white/10"
          />
        ))}
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse px-4 pb-12 pt-16">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="mx-auto aspect-2/3 w-52 rounded-2xl bg-white/5 md:mx-0 md:w-72" />
        <div className="flex-1 space-y-4 md:pt-6">
          <div className="h-12 w-2/3 rounded-lg bg-white/5" />
          <div className="h-4 w-1/3 rounded bg-white/5" />
          <div className="h-24 w-full max-w-3xl rounded-lg bg-white/5" />
          <div className="h-11 w-48 rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}
