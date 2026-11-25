import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { getSeason, getSeries, isTmdbConfigured, tmdbImage, type EpisodeSummary } from "@/lib/tmdb";
import { formatDate, formatRuntime } from "@/lib/media";
import { DetailHero } from "@/components/media/DetailHero";
import { SeasonBrowser } from "@/components/media/SeasonBrowser";
import { VideoGallery } from "@/components/media/VideoGallery";
import { CastRow } from "@/components/media/CastRow";
import { PhotoGallery } from "@/components/media/PhotoGallery";
import { ReviewList } from "@/components/media/ReviewList";
import { PosterRow } from "@/components/media/PosterRow";
import { WatchProviders } from "@/components/media/WatchProviders";
import { FactsPanel } from "@/components/media/FactsPanel";
import { Keywords } from "@/components/media/Keywords";
import { TmdbNotice } from "@/components/media/TmdbNotice";
import { DetailsSkeleton } from "@/components/media/DetailsSkeleton";

const parseId = (id: string) => (/^\d{1,9}$/.test(id) ? Number(id) : null);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export async function generateMetadata({ params }: PageProps<"/series/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const series = id && isTmdbConfigured() ? await getSeries(id).catch(() => null) : null;
  if (!series) return { title: "Series | G-Eye TV" };

  const image = tmdbImage(series.backdropPath, "w1280");
  return {
    title: `${series.title}${series.year ? ` (${series.year})` : ""} | G-Eye TV`,
    description: series.overview,
    openGraph: { title: series.title, description: series.overview, images: image ? [image] : [] },
  };
}

export default function SeriesPage(props: PageProps<"/series/[id]">) {
  // Params are read inside Suspense so unknown series ids still get an instant page shell
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <SeriesDetails params={props.params} />
    </Suspense>
  );
}

async function SeriesDetails({ params }: Pick<PageProps<"/series/[id]">, "params">) {
  const id = parseId((await params).id);
  if (!id) notFound();
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  const series = await getSeries(id).catch((err) => {
    console.error(`Loading series ${id} failed:`, err);
    return undefined;
  });
  if (series === undefined) return <TmdbNotice reason="unreachable" />;
  if (!series) notFound();

  // Open on the season currently airing (or the latest one), not always season 1
  const startSeason = series.lastEpisode?.seasonNumber ?? series.seasons.find((s) => s.seasonNumber > 0)?.seasonNumber ?? series.seasons[0]?.seasonNumber;
  const initialSeason = startSeason !== undefined ? await getSeason(id, startSeason).catch(() => null) : null;

  const credits: [string, string][] = [];
  if (series.creators.length) credits.push(["Created by", series.creators.join(", ")]);
  if (series.networks.length) credits.push(["Network", series.networks.map((n) => n.name).join(", ")]);

  return (
    <article className="pb-12">
      <DetailHero
        item={series}
        tagline={series.tagline}
        genres={series.genres}
        certification={series.certification}
        meta={[
          plural(series.numberOfSeasons, "season"),
          plural(series.numberOfEpisodes, "episode"),
          series.episodeRuntime ? `${formatRuntime(series.episodeRuntime)} / ep` : null,
        ]}
        credits={credits}
        trailerKey={series.trailerKey}
      />

      <div className="mx-auto grid max-w-350 gap-12 px-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          {series.nextEpisode && <NextEpisode episode={series.nextEpisode} />}
          {series.seasons.length > 0 && <SeasonBrowser seriesId={id} seasons={series.seasons} initial={initialSeason} />}
          {series.cast.length > 0 && <CastRow cast={series.cast} />}
          {series.videos.length > 0 && <VideoGallery videos={series.videos} />}
          {series.backdrops.length > 0 && <PhotoGallery paths={series.backdrops} />}
          {series.reviews.length > 0 && <ReviewList reviews={series.reviews} />}
        </div>

        <div className="space-y-8">
          <WatchProviders watch={series.watch} />
          <FactsPanel
            facts={[
              ["Status", series.status],
              ["First aired", formatDate(series.firstAirDate)],
              ["Last aired", series.status !== "Returning Series" ? formatDate(series.lastAirDate) : null],
              ["Original title", series.originalTitle !== series.title ? series.originalTitle : null],
              ["Type", series.seriesType],
              ["Countries", series.countries.join(", ")],
              ["Languages", series.languages.join(", ")],
              [
                "Links",
                series.homepage && (
                  <a href={series.homepage} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    Official site
                  </a>
                ),
              ],
            ]}
            companies={series.networks}
            companiesLabel="Networks"
          />
          {series.keywords.length > 0 && <Keywords keywords={series.keywords} />}
        </div>
      </div>

      {series.recommendations.length > 0 && (
        <div className="mx-auto mt-12 max-w-350 px-4">
          <PosterRow title="More like this" items={series.recommendations} />
        </div>
      )}
    </article>
  );
}

function NextEpisode({ episode }: { episode: EpisodeSummary }) {
  return (
    <div className="flex items-center gap-4 rounded-md bg-brand/10 p-4 ring-1 ring-brand/30">
      <CalendarClock className="size-8 shrink-0 text-brand" />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Next episode</p>
        <p className="font-semibold">
          S{episode.seasonNumber} · E{episode.episodeNumber}
          {episode.name && !/^Episode \d+$/.test(episode.name) ? ` · ${episode.name}` : ""}
        </p>
        {episode.airDate && <p className="text-sm text-white/60">Airs {formatDate(episode.airDate)}</p>}
      </div>
    </div>
  );
}
