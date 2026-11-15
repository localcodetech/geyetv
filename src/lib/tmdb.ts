import "server-only";
import { cacheLife, cacheTag } from "next/cache";

// TMDB (themoviedb.org) supplies movie metadata only: titles, posters, cast, trailers.
// The key stays on the server; browsers only ever see our pages and image.tmdb.org URLs.

const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

/** Country used for release info and "Where to watch" (ISO 3166-1, e.g. GH, NG, KE) */
export const REGION = process.env.TMDB_REGION || "GH";

export type MovieSummary = {
  id: number;
  title: string;
  overview: string;
  year: string;
  rating: number;
  posterPath: string | null;
  backdropPath: string | null;
};

export type CastMember = { id: number; name: string; character: string; profilePath: string | null };
export type Provider = { id: number; name: string; logoPath: string };

export type MovieDetails = MovieSummary & {
  tagline: string;
  runtime: number | null;
  genres: string[];
  certification: string | null;
  originalLanguage: string;
  director: string | null;
  cast: CastMember[];
  trailerKey: string | null;
  similar: MovieSummary[];
  watch: { link: string | null; stream: Provider[]; rent: Provider[]; buy: Provider[] };
};

export type MovieRow = { id: string; title: string; movies: MovieSummary[] };

export const tmdbImage = (path: string | null, size: "w92" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original") =>
  path ? `${IMG}/${size}${path}` : null;

export const isTmdbConfigured = () => Boolean(process.env.TMDB_READ_TOKEN || process.env.TMDB_API_KEY);

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const { TMDB_READ_TOKEN, TMDB_API_KEY } = process.env;
  const url = new URL(API + path);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  // Either a v4 "API Read Access Token" (preferred) or a v3 "API Key"
  const headers: HeadersInit = { accept: "application/json" };
  if (TMDB_READ_TOKEN) headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
  else if (TMDB_API_KEY) url.searchParams.set("api_key", TMDB_API_KEY);
  else throw new Error("TMDB is not configured: set TMDB_READ_TOKEN or TMDB_API_KEY");

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TMDB ${path} responded ${res.status}`);
  return res.json();
}

type RawMovie = {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
};

const toSummary = (m: RawMovie): MovieSummary => ({
  id: m.id,
  title: m.title,
  overview: m.overview,
  year: m.release_date?.slice(0, 4) ?? "",
  rating: Math.round(m.vote_average * 10) / 10,
  posterPath: m.poster_path,
  backdropPath: m.backdrop_path,
});

async function list(path: string, params: Record<string, string> = {}): Promise<MovieSummary[]> {
  const data = await tmdb<{ results: RawMovie[] }>(path, params);
  return data.results.filter((m) => m.poster_path).map(toSummary);
}

/** Rows for the /movies home screen */
export async function getMovieRows(): Promise<MovieRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb");

  const african = { sort_by: "popularity.desc", "vote_count.gte": "5" };
  const rows: [string, string, Promise<MovieSummary[]>][] = [
    ["trending", "Trending this week", list("/trending/movie/week")],
    ["nollywood", "Nollywood", list("/discover/movie", { ...african, with_origin_country: "NG" })],
    ["african", "African cinema", list("/discover/movie", { ...african, with_origin_country: "GH|KE|ZA|CI|SN|CM|TZ|UG|EG|MA" })],
    ["now-playing", "In cinemas", list("/movie/now_playing", { region: REGION })],
    ["popular", "Popular", list("/movie/popular")],
    ["top-rated", "Top rated", list("/movie/top_rated")],
    ["animation", "Family & animation", list("/discover/movie", { with_genres: "16|10751", sort_by: "popularity.desc" })],
  ];

  const settled = await Promise.allSettled(rows.map(([, , p]) => p));
  return rows
    .map(([id, title], i) => ({ id, title, movies: settled[i].status === "fulfilled" ? settled[i].value : [] }))
    .filter((r) => r.movies.length);
}

type RawDetails = RawMovie & {
  tagline: string;
  runtime: number | null;
  genres: { name: string }[];
  original_language: string;
  credits: { cast: { id: number; name: string; character: string; profile_path: string | null }[]; crew: { job: string; name: string }[] };
  videos: { results: { key: string; site: string; type: string; official: boolean }[] };
  similar: { results: RawMovie[] };
  recommendations: { results: RawMovie[] };
  release_dates: { results: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
  "watch/providers": {
    results: Record<string, { link?: string } & Partial<Record<"flatrate" | "rent" | "buy", { provider_id: number; provider_name: string; logo_path: string }[]>>>;
  };
};

/** Full details for one movie, or null if TMDB doesn't know it */
export async function getMovie(id: number): Promise<MovieDetails | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb", `movie-${id}`);

  let m: RawDetails;
  try {
    m = await tmdb<RawDetails>(`/movie/${id}`, { append_to_response: "credits,videos,recommendations,similar,release_dates,watch/providers" });
  } catch (err) {
    if (err instanceof Error && err.message.endsWith("404")) return null;
    throw err;
  }

  const trailers = m.videos.results.filter((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
  const trailer = trailers.find((v) => v.type === "Trailer" && v.official) ?? trailers[0];
  const certFor = (country: string) =>
    m.release_dates.results.find((r) => r.iso_3166_1 === country)?.release_dates.find((d) => d.certification)?.certification;
  const providers = m["watch/providers"].results[REGION] ?? {};
  const toProviders = (list?: { provider_id: number; provider_name: string; logo_path: string }[]) =>
    (list ?? []).map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));

  return {
    ...toSummary(m),
    tagline: m.tagline,
    runtime: m.runtime || null,
    genres: m.genres.map((g) => g.name),
    certification: certFor(REGION) ?? certFor("US") ?? null,
    originalLanguage: m.original_language,
    director: m.credits.crew.find((c) => c.job === "Director")?.name ?? null,
    cast: m.credits.cast.slice(0, 12).map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path })),
    trailerKey: trailer?.key ?? null,
    // TMDB's "similar" list is often empty for African titles; recommendations are better populated
    similar: (m.recommendations.results.length ? m.recommendations.results : m.similar.results)
      .filter((s) => s.poster_path)
      .slice(0, 18)
      .map(toSummary),
    watch: {
      link: providers.link ?? null,
      stream: toProviders(providers.flatrate),
      rent: toProviders(providers.rent),
      buy: toProviders(providers.buy),
    },
  };
}

export async function searchMovies(query: string): Promise<MovieSummary[]> {
  "use cache";
  cacheLife("hours");

  const q = query.trim();
  if (!q) return [];
  return (await list("/search/movie", { query: q, include_adult: "false" })).slice(0, 20);
}
