import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, Star } from "lucide-react";
import { tmdbImage } from "@/lib/media";
import type { Genre, MediaType } from "@/lib/tmdb";
import type { SavedItem } from "@/lib/viewer-prefs";
import { TrailerButton } from "@/components/media/TrailerButton";
import { MyListButton } from "@/components/media/MyListButton";

type Props = {
  item: SavedItem & { type: MediaType };
  tagline: string;
  genres: Genre[];
  /** Age rating, e.g. "PG-13" */
  certification: string | null;
  /** Small facts after the rating, e.g. "1h 52m", "3 seasons" */
  meta: (string | null)[];
  /** Credit lines under the overview, e.g. ["Directed by", "Kemi Adetiba"] */
  credits: [label: string, names: string][];
  trailerKey: string | null;
  /** Watch / download controls when G-Eye TV can show this title; otherwise a "not available" note is shown */
  watch?: React.ReactNode;
};

export function DetailHero({ item, tagline, genres, certification, meta, credits, trailerKey, watch }: Props) {
  const backdrop = tmdbImage(item.backdropPath, "w1280");
  const poster = tmdbImage(item.posterPath, "w500");
  const section = item.type === "tv" ? { href: "/series", label: "All series" } : { href: "/movies", label: "All movies" };
  const browse = item.type === "tv" ? "/series/browse" : "/movies/browse";

  return (
    <section className="relative isolate overflow-hidden">
      {backdrop && <Image src={backdrop} alt="" fill priority unoptimized className="-z-10 object-cover object-top opacity-60" />}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-surface via-surface/85 to-surface/40" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-surface/80 to-transparent" />

      <div className="mx-auto max-w-350 px-4 pb-10 pt-6">
        <Link href={section.href} className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white">
          <ArrowLeft className="size-4" />
          {section.label}
        </Link>

        <div className="flex flex-col gap-8 md:flex-row">
          {poster && (
            <div className="relative mx-auto aspect-2/3 w-52 shrink-0 overflow-hidden rounded-md ring-1 ring-line md:mx-0 md:w-72">
              <Image src={poster} alt={item.title} fill priority unoptimized className="object-cover" />
            </div>
          )}

          <div className="min-w-0 flex-1 md:pt-6">
            <p className="mb-3">
              <span className="tag">{item.type === "tv" ? "Series" : "Movie"}</span>
            </p>
            <h1 className="text-3xl heading sm:text-5xl">
              {item.title}
              {item.year && <span className="ml-3 text-2xl font-normal text-white/40 sm:text-3xl">({item.year})</span>}
            </h1>
            {tagline && <p className="mt-2 italic text-white/60">{tagline}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
              {item.rating > 0 && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                  <Star className="size-4 fill-current text-muted" />
                  {item.rating.toFixed(1)}
                  <span className="font-normal text-white/40">TMDB</span>
                </span>
              )}
              {certification && <span className="rounded border border-white/30 px-1.5 text-xs">{certification}</span>}
              {meta.filter(Boolean).map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>

            {genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`${browse}?genre=${g.id}`}
                    className="rounded bg-panel px-3 py-1 text-xs font-medium ring-1 ring-line transition-colors hover:bg-brand hover:ring-brand"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-6 max-w-3xl leading-relaxed text-white/80">{item.overview || "No description available."}</p>

            {credits.length > 0 && (
              <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3 text-sm">
                {credits.map(([label, names]) => (
                  <div key={label}>
                    <dt className="text-white/45">{label}</dt>
                    <dd className="font-semibold">{names}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {watch}
              {trailerKey && <TrailerButton youtubeKey={trailerKey} title={item.title} variant={watch ? "ghost" : "primary"} />}
              <MyListButton item={item} />
              {!watch && (
                // Only public-domain / Creative Commons films can be watched here until G-Eye TV licenses others
                <span
                  title="Not available to stream or download on G-Eye TV yet"
                  className="btn cursor-not-allowed bg-panel text-faint ring-1 ring-line"
                >
                  <Download className="size-4" />
                  Not on G-Eye TV yet
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
