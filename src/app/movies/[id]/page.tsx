import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovie, isTmdbConfigured, tmdbImage } from "@/lib/tmdb";
import { getFreeCopy, LICENSE_LABELS } from "@/lib/archive";
import { formatDate, formatRuntime } from "@/lib/media";
import { DetailHero } from "@/components/media/DetailHero";
import { VideoGallery } from "@/components/media/VideoGallery";
import { CastRow } from "@/components/media/CastRow";
import { PhotoGallery } from "@/components/media/PhotoGallery";
import { ReviewList } from "@/components/media/ReviewList";
import { PosterRow } from "@/components/media/PosterRow";
import { WatchProviders } from "@/components/media/WatchProviders";
import { FactsPanel } from "@/components/media/FactsPanel";
import { TmdbNotice } from "@/components/media/TmdbNotice";
import { DetailsSkeleton } from "@/components/media/DetailsSkeleton";
import { Keywords } from "@/components/media/Keywords";
import { FreeWatchActions } from "@/components/media/FreeWatchActions";

const parseId = (id: string) => (/^\d{1,9}$/.test(id) ? Number(id) : null);
const money = (n: number) => (n > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n) : null);

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

  // Public-domain / Creative Commons films can be watched and downloaded right here
  const free = await getFreeCopy(id).catch((err) => {
    console.error(`Looking up a free copy of movie ${id} failed:`, err);
    return null;
  });

  const credits: [string, string][] = [];
  if (movie.director) credits.push(["Director", movie.director]);
  if (movie.writers.length) credits.push(["Writers", movie.writers.join(", ")]);

  return (
    <article className="pb-12">
      <DetailHero
        item={movie}
        tagline={movie.tagline}
        genres={movie.genres}
        certification={movie.certification}
        meta={[formatRuntime(movie.runtime), movie.originalLanguage.toUpperCase()]}
        credits={credits}
        trailerKey={movie.trailerKey}
        watch={
          free && (
            <FreeWatchActions
              title={movie.title}
              stream={free.stream}
              downloads={free.downloads}
              licenseLabel={LICENSE_LABELS[free.license].label}
              licenseUrl={free.licenseUrl}
              archiveUrl={`https://archive.org/details/${free.archiveId}`}
            />
          )
        }
      />

      <div className="mx-auto grid max-w-350 gap-12 px-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          {movie.cast.length > 0 && <CastRow cast={movie.cast} />}
          {movie.videos.length > 0 && <VideoGallery videos={movie.videos} />}

          {movie.collection && movie.collection.parts.length > 1 && (
            <PosterRow title={`Part of ${movie.collection.name}`} items={movie.collection.parts} />
          )}

          {movie.backdrops.length > 0 && <PhotoGallery paths={movie.backdrops} />}
          {movie.reviews.length > 0 && <ReviewList reviews={movie.reviews} />}
        </div>

        <div className="space-y-8">
          <WatchProviders watch={movie.watch} />
          <FactsPanel
            facts={[
              ["Status", movie.status],
              ["Release date", formatDate(movie.releaseDate)],
              ["Original title", movie.originalTitle !== movie.title ? movie.originalTitle : null],
              ["Runtime", formatRuntime(movie.runtime)],
              ["Budget", money(movie.budget)],
              ["Box office", money(movie.revenue)],
              ["Countries", movie.countries.join(", ")],
              ["Languages", movie.languages.join(", ")],
              [
                "Links",
                (movie.homepage || movie.imdbId) && (
                  <span className="flex gap-3">
                    {movie.homepage && (
                      <a href={movie.homepage} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                        Official site
                      </a>
                    )}
                    {movie.imdbId && (
                      <a href={`https://www.imdb.com/title/${movie.imdbId}`} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                        IMDb
                      </a>
                    )}
                  </span>
                ),
              ],
            ]}
            companies={movie.companies}
            companiesLabel="Production"
          />
          {movie.keywords.length > 0 && <Keywords keywords={movie.keywords} />}
        </div>
      </div>

      {movie.recommendations.length > 0 && (
        <div className="mx-auto mt-12 max-w-350 px-4">
          <PosterRow title="More like this" items={movie.recommendations} />
        </div>
      )}
    </article>
  );
}
