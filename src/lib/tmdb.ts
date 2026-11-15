import "server-only";
import { cacheLife, cacheTag } from "next/cache";

// TMDB (themoviedb.org) supplies metadata only: titles, posters, cast, trailers.
// The key stays on the server; browsers only ever see our pages and image.tmdb.org URLs.

import { tmdbImage, mediaHref } from "@/lib/media";

export { tmdbImage, mediaHref };

const API = "https://api.themoviedb.org/3";

/** Country used for release info and "Where to watch" (ISO 3166-1, e.g. GH, NG, KE) */
export const REGION = process.env.TMDB_REGION || "GH";

// Countries used for the African rows (TMDB origin_country codes)
const AFRICA = "NG|GH|KE|ZA|CI|SN|CM|TZ|UG|EG|MA|ET|RW|ZW";

/* ------------------------------------------------------------------ types */

export type MediaType = "movie" | "tv";

export type MediaSummary = {
  id: number;
  type: MediaType;
  title: string;
  overview: string;
  year: string;
  rating: number;
  posterPath: string | null;
  backdropPath: string | null;
};

/** `href` is a "See all" link into the browse page with matching filters */
export type MediaRow = { id: string; title: string; items: MediaSummary[]; href?: string };
export type Genre = { id: number; name: string };
export type CastMember = { id: number; name: string; character: string; profilePath: string | null; episodes?: number };
export type Provider = { id: number; name: string; logoPath: string };
export type Company = { id: number; name: string; logoPath: string | null };
export type Video = { key: string; name: string; type: string };
export type Review = { id: string; author: string; content: string; rating: number | null; createdAt: string; url: string };
export type WatchProviders = { link: string | null; stream: Provider[]; rent: Provider[]; buy: Provider[] };

type DetailsBase = MediaSummary & {
  tagline: string;
  genres: Genre[];
  certification: string | null;
  originalTitle: string;
  originalLanguage: string;
  status: string;
  homepage: string | null;
  cast: CastMember[];
  trailerKey: string | null;
  videos: Video[];
  backdrops: string[];
  reviews: Review[];
  keywords: { id: number; name: string }[];
  recommendations: MediaSummary[];
  watch: WatchProviders;
  countries: string[];
  languages: string[];
};

export type MovieDetails = DetailsBase & {
  type: "movie";
  releaseDate: string | null;
  runtime: number | null;
  director: string | null;
  writers: string[];
  budget: number;
  revenue: number;
  companies: Company[];
  imdbId: string | null;
  collection: { id: number; name: string; parts: MediaSummary[] } | null;
};

export type SeasonSummary = { seasonNumber: number; name: string; episodeCount: number; airDate: string | null; posterPath: string | null };
export type EpisodeSummary = { seasonNumber: number; episodeNumber: number; name: string; airDate: string | null };

export type SeriesDetails = DetailsBase & {
  type: "tv";
  firstAirDate: string | null;
  lastAirDate: string | null;
  inProduction: boolean;
  seriesType: string;
  creators: string[];
  networks: Company[];
  episodeRuntime: number | null;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  seasons: SeasonSummary[];
  lastEpisode: EpisodeSummary | null;
  nextEpisode: EpisodeSummary | null;
};

export type Episode = {
  id: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  runtime: number | null;
  rating: number;
  stillPath: string | null;
};

export type Season = { seasonNumber: number; name: string; overview: string; airDate: string | null; posterPath: string | null; episodes: Episode[] };

export type PersonDetails = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownFor: string;
  profilePath: string | null;
  photos: string[];
  credits: (MediaSummary & { role: string })[];
};

export type PersonSummary = { id: number; name: string; knownFor: string; profilePath: string | null };

export type DiscoverFilters = {
  genre?: number;
  year?: number;
  country?: string;
  language?: string;
  minRating?: number;
  sort?: string;
  page?: number;
};

export type DiscoverResult = { items: MediaSummary[]; page: number; totalPages: number; totalResults: number };

/* --------------------------------------------------------------- helpers */

export const isTmdbConfigured = () => Boolean(process.env.TMDB_READ_TOKEN || process.env.TMDB_API_KEY);

class NotFound extends Error {}

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
  if (res.status === 404) throw new NotFound(path);
  if (!res.ok) throw new Error(`TMDB ${path} responded ${res.status}`);
  return res.json();
}

/** Turns TMDB's "not found" into null; other errors still throw */
async function orNull<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    if (err instanceof NotFound) return null;
    throw err;
  }
}

type RawMedia = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
};

const toSummary = (m: RawMedia, type: MediaType): MediaSummary => ({
  id: m.id,
  type,
  title: (type === "tv" ? m.name : m.title) ?? m.title ?? m.name ?? "",
  overview: m.overview ?? "",
  year: (type === "tv" ? m.first_air_date : m.release_date)?.slice(0, 4) ?? "",
  rating: Math.round((m.vote_average ?? 0) * 10) / 10,
  posterPath: m.poster_path ?? null,
  backdropPath: m.backdrop_path ?? null,
});

const withPosters = (list: RawMedia[], type: MediaType) => list.filter((m) => m.poster_path).map((m) => toSummary(m, type));

async function list(path: string, type: MediaType, params: Record<string, string> = {}): Promise<MediaSummary[]> {
  const data = await tmdb<{ results: RawMedia[] }>(path, params);
  return withPosters(data.results, type);
}

/** Builds rows in parallel; a failing row is dropped instead of failing the page */
async function buildRows(rows: [id: string, title: string, items: Promise<MediaSummary[]>, href?: string][]): Promise<MediaRow[]> {
  const settled = await Promise.allSettled(rows.map(([, , p]) => p));
  return rows
    .map(([id, title, , href], i) => ({ id, title, href, items: settled[i].status === "fulfilled" ? settled[i].value : [] }))
    .filter((r) => r.items.length);
}

type RawVideos = { results: { key: string; name: string; site: string; type: string; official: boolean }[] };
type RawProviders = {
  results: Record<string, { link?: string } & Partial<Record<"flatrate" | "rent" | "buy", { provider_id: number; provider_name: string; logo_path: string }[]>>>;
};
type RawReviews = {
  results: { id: string; author: string; content: string; created_at: string; url: string; author_details?: { rating: number | null } }[];
};
type RawImages = { backdrops: { file_path: string }[] };

function pickVideos(raw: RawVideos) {
  const order = ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes"];
  const rank = (type: string) => (order.includes(type) ? order.indexOf(type) : order.length);
  const videos = raw.results
    .filter((v) => v.site === "YouTube")
    .sort((a, b) => rank(a.type) - rank(b.type) || Number(b.official) - Number(a.official))
    .map((v) => ({ key: v.key, name: v.name, type: v.type }));
  const trailer = videos.find((v) => v.type === "Trailer") ?? videos.find((v) => v.type === "Teaser");
  return { videos: videos.slice(0, 12), trailerKey: trailer?.key ?? null };
}

function pickProviders(raw: RawProviders | undefined): WatchProviders {
  const p = raw?.results[REGION] ?? {};
  const map = (l?: { provider_id: number; provider_name: string; logo_path: string }[]) =>
    (l ?? []).map((x) => ({ id: x.provider_id, name: x.provider_name, logoPath: x.logo_path }));
  return { link: p.link ?? null, stream: map(p.flatrate), rent: map(p.rent), buy: map(p.buy) };
}

const pickReviews = (raw: RawReviews): Review[] =>
  raw.results.slice(0, 6).map((r) => ({
    id: r.id,
    author: r.author,
    content: r.content,
    rating: r.author_details?.rating ?? null,
    createdAt: r.created_at,
    url: r.url,
  }));

const pickBackdrops = (raw: RawImages) => raw.backdrops.slice(0, 18).map((b) => b.file_path);

const toCompany = (c: { id: number; name: string; logo_path: string | null }): Company => ({ id: c.id, name: c.name, logoPath: c.logo_path });

/* ----------------------------------------------------------- home + lists */

/** Hero slides and rows for the site home page */
export async function getHomeRows(): Promise<{ hero: MediaSummary[]; rows: MediaRow[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb");

  const trending = await tmdb<{ results: RawMedia[] }>("/trending/all/day");
  const hero = trending.results
    .filter((m) => (m.media_type === "movie" || m.media_type === "tv") && m.backdrop_path && m.overview)
    .slice(0, 6)
    .map((m) => toSummary(m, m.media_type as MediaType));

  const pop = { sort_by: "popularity.desc", "vote_count.gte": "5" };
  const rows = await buildRows([
    ["trending-movies", "Trending movies", list("/trending/movie/week", "movie")],
    ["trending-series", "Trending series", list("/trending/tv/week", "tv")],
    ["nollywood", "Nollywood movies", list("/discover/movie", "movie", { ...pop, with_origin_country: "NG" }), "/movies/browse?country=NG"],
    ["african-series", "African series", list("/discover/tv", "tv", { ...pop, with_origin_country: AFRICA }), "/series/browse?country=NG"],
    ["in-cinemas", "In cinemas now", list("/movie/now_playing", "movie", { region: REGION })],
    ["top-rated", "Top rated movies", list("/movie/top_rated", "movie"), "/movies/browse?sort=vote_average.desc"],
  ]);
  return { hero, rows };
}

/** Rows for the /movies home screen */
export async function getMovieRows(): Promise<MediaRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb");

  const african = { sort_by: "popularity.desc", "vote_count.gte": "5" };
  return buildRows([
    ["trending", "Trending this week", list("/trending/movie/week", "movie")],
    ["nollywood", "Nollywood", list("/discover/movie", "movie", { ...african, with_origin_country: "NG" }), "/movies/browse?country=NG"],
    ["african", "African cinema", list("/discover/movie", "movie", { ...african, with_origin_country: AFRICA.replace("NG|", "") })],
    ["now-playing", "In cinemas", list("/movie/now_playing", "movie", { region: REGION })],
    ["upcoming", "Coming soon", list("/movie/upcoming", "movie", { region: "US" })],
    ["popular", "Popular", list("/movie/popular", "movie"), "/movies/browse"],
    ["top-rated", "Top rated of all time", list("/movie/top_rated", "movie"), "/movies/browse?sort=vote_average.desc"],
    ["action", "Action & adventure", list("/discover/movie", "movie", { with_genres: "28|12", sort_by: "popularity.desc" }), "/movies/browse?genre=28"],
    ["comedy", "Comedy", list("/discover/movie", "movie", { with_genres: "35", sort_by: "popularity.desc" }), "/movies/browse?genre=35"],
    ["horror", "Horror & thriller", list("/discover/movie", "movie", { with_genres: "27|53", sort_by: "popularity.desc" }), "/movies/browse?genre=27"],
    ["animation", "Family & animation", list("/discover/movie", "movie", { with_genres: "16|10751", sort_by: "popularity.desc" }), "/movies/browse?genre=16"],
    ["documentary", "Documentaries", list("/discover/movie", "movie", { with_genres: "99", sort_by: "popularity.desc", "vote_count.gte": "50" }), "/movies/browse?genre=99"],
  ]);
}

/** Rows for the /series home screen */
export async function getSeriesRows(): Promise<MediaRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb");

  const pop = { sort_by: "popularity.desc" };
  return buildRows([
    ["trending", "Trending this week", list("/trending/tv/week", "tv")],
    ["african", "African series", list("/discover/tv", "tv", { ...pop, with_origin_country: AFRICA })],
    ["on-the-air", "New episodes this week", list("/tv/on_the_air", "tv")],
    ["popular", "Popular", list("/tv/popular", "tv"), "/series/browse"],
    ["top-rated", "Top rated of all time", list("/tv/top_rated", "tv"), "/series/browse?sort=vote_average.desc"],
    ["kdrama", "K-drama", list("/discover/tv", "tv", { ...pop, with_origin_country: "KR", with_genres: "18" }), "/series/browse?country=KR&genre=18"],
    ["telenovelas", "Telenovelas", list("/discover/tv", "tv", { ...pop, with_genres: "10766" }), "/series/browse?genre=10766"],
    ["crime", "Crime & mystery", list("/discover/tv", "tv", { ...pop, with_genres: "80|9648" }), "/series/browse?genre=80"],
    ["scifi", "Sci-fi & fantasy", list("/discover/tv", "tv", { ...pop, with_genres: "10765" }), "/series/browse?genre=10765"],
    ["reality", "Reality", list("/discover/tv", "tv", { ...pop, with_genres: "10764" }), "/series/browse?genre=10764"],
    ["animation", "Animation & kids", list("/discover/tv", "tv", { ...pop, with_genres: "16|10762" }), "/series/browse?genre=16"],
    ["documentary", "Docuseries", list("/discover/tv", "tv", { ...pop, with_genres: "99" }), "/series/browse?genre=99"],
  ]);
}

export async function getGenres(type: MediaType): Promise<Genre[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("tmdb");

  const data = await tmdb<{ genres: Genre[] }>(`/genre/${type}/list`);
  return data.genres;
}

export const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most popular" },
  { value: "vote_average.desc", label: "Highest rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
  { value: "revenue.desc", label: "Box office" },
] as const;

export const COUNTRY_OPTIONS = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "FR", label: "France" },
  { value: "IN", label: "India" },
  { value: "KR", label: "South Korea" },
  { value: "JP", label: "Japan" },
  { value: "ES", label: "Spain" },
  { value: "TR", label: "Türkiye" },
  { value: "MX", label: "Mexico" },
] as const;

/** Filterable, paginated catalog for the browse pages */
export async function discover(type: MediaType, f: DiscoverFilters): Promise<DiscoverResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb");

  // TV uses first_air_date where movies use primary_release_date / revenue
  const sort = (f.sort ?? "popularity.desc").replace("primary_release_date", type === "tv" ? "first_air_date" : "primary_release_date");
  const params: Record<string, string> = {
    sort_by: type === "tv" && sort.startsWith("revenue") ? "popularity.desc" : sort,
    page: String(Math.min(Math.max(f.page ?? 1, 1), 500)),
    include_adult: "false",
  };
  // Rating and date sorts need a minimum number of votes to avoid obscure titles
  if (sort.startsWith("vote_average")) params["vote_count.gte"] = "200";
  if (sort.includes("date.desc")) params[type === "tv" ? "first_air_date.lte" : "primary_release_date.lte"] = new Date().toISOString().slice(0, 10);
  if (f.genre) params.with_genres = String(f.genre);
  if (f.year) params[type === "tv" ? "first_air_date_year" : "primary_release_year"] = String(f.year);
  if (f.country) params.with_origin_country = f.country;
  if (f.language) params.with_original_language = f.language;
  if (f.minRating) params["vote_average.gte"] = String(f.minRating);

  const data = await tmdb<{ results: RawMedia[]; page: number; total_pages: number; total_results: number }>(`/discover/${type}`, params);
  return {
    items: withPosters(data.results, type),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  };
}

/* ---------------------------------------------------------------- details */

type RawBase = RawMedia & {
  tagline?: string;
  genres: Genre[];
  original_language: string;
  status: string;
  homepage?: string;
  videos: RawVideos;
  images: RawImages;
  reviews: RawReviews;
  recommendations: { results: RawMedia[] };
  similar: { results: RawMedia[] };
  production_countries?: { name: string }[];
  spoken_languages?: { english_name: string }[];
  "watch/providers": RawProviders;
};

type RawMovie = RawBase & {
  original_title: string;
  runtime: number | null;
  budget: number;
  revenue: number;
  imdb_id: string | null;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  belongs_to_collection: { id: number; name: string } | null;
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { job: string; name: string }[];
  };
  release_dates: { results: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
  keywords: { keywords: { id: number; name: string }[] };
};

const EXTRAS = "videos,images,reviews,recommendations,similar,keywords,watch/providers";

// TMDB's "similar" is often empty for African titles; recommendations are better populated
const pickRecommendations = (raw: RawBase, type: MediaType) =>
  withPosters(raw.recommendations.results.length ? raw.recommendations.results : raw.similar.results, type).slice(0, 18);

/** Full details for one movie, or null if TMDB doesn't know it */
export async function getMovie(id: number): Promise<MovieDetails | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb", `movie-${id}`);

  const m = await orNull(
    tmdb<RawMovie>(`/movie/${id}`, {
      append_to_response: `credits,release_dates,${EXTRAS}`,
      include_image_language: "en,null",
    }),
  );
  if (!m) return null;

  const cert = (country: string) =>
    m.release_dates.results.find((r) => r.iso_3166_1 === country)?.release_dates.find((d) => d.certification)?.certification;

  // Fetch the other films in the series (e.g. all "Wedding Party" movies)
  const collection = m.belongs_to_collection
    ? await orNull(tmdb<{ id: number; name: string; parts: RawMedia[] }>(`/collection/${m.belongs_to_collection.id}`)).catch(() => null)
    : null;

  return {
    ...toSummary(m, "movie"),
    type: "movie",
    tagline: m.tagline ?? "",
    genres: m.genres,
    certification: cert(REGION) ?? cert("US") ?? null,
    originalTitle: m.original_title,
    originalLanguage: m.original_language,
    status: m.status,
    homepage: m.homepage || null,
    releaseDate: m.release_date || null,
    runtime: m.runtime || null,
    director: m.credits.crew.find((c) => c.job === "Director")?.name ?? null,
    writers: [...new Set(m.credits.crew.filter((c) => c.job === "Screenplay" || c.job === "Writer").map((c) => c.name))].slice(0, 3),
    budget: m.budget,
    revenue: m.revenue,
    imdbId: m.imdb_id,
    companies: m.production_companies.slice(0, 6).map(toCompany),
    countries: (m.production_countries ?? []).map((c) => c.name),
    languages: (m.spoken_languages ?? []).map((l) => l.english_name),
    cast: m.credits.cast.slice(0, 20).map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path })),
    ...pickVideos(m.videos),
    backdrops: pickBackdrops(m.images),
    reviews: pickReviews(m.reviews),
    keywords: m.keywords.keywords.slice(0, 15),
    recommendations: pickRecommendations(m, "movie"),
    watch: pickProviders(m["watch/providers"]),
    collection: collection
      ? {
          id: collection.id,
          name: collection.name,
          parts: withPosters(collection.parts, "movie").sort((a, b) => (a.year || "9999").localeCompare(b.year || "9999")),
        }
      : null,
  };
}

type RawEpisodeRef = { season_number: number; episode_number: number; name: string; air_date: string | null } | null;

type RawSeries = RawBase & {
  original_name: string;
  last_air_date: string | null;
  in_production: boolean;
  type: string;
  created_by: { name: string }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  origin_country: string[];
  seasons: { season_number: number; name: string; episode_count: number; air_date: string | null; poster_path: string | null }[];
  last_episode_to_air: RawEpisodeRef;
  next_episode_to_air: RawEpisodeRef;
  aggregate_credits: {
    cast: { id: number; name: string; profile_path: string | null; total_episode_count: number; roles: { character: string }[] }[];
  };
  content_ratings: { results: { iso_3166_1: string; rating: string }[] };
  keywords: { results: { id: number; name: string }[] };
};

const toEpisodeRef = (e: RawEpisodeRef): EpisodeSummary | null =>
  e ? { seasonNumber: e.season_number, episodeNumber: e.episode_number, name: e.name, airDate: e.air_date } : null;

/** Full details for one TV series, or null if TMDB doesn't know it */
export async function getSeries(id: number): Promise<SeriesDetails | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb", `tv-${id}`);

  const s = await orNull(
    tmdb<RawSeries>(`/tv/${id}`, {
      append_to_response: `aggregate_credits,content_ratings,${EXTRAS}`,
      include_image_language: "en,null",
    }),
  );
  if (!s) return null;

  const rating = (country: string) => s.content_ratings.results.find((r) => r.iso_3166_1 === country)?.rating || undefined;

  return {
    ...toSummary(s, "tv"),
    type: "tv",
    tagline: s.tagline ?? "",
    genres: s.genres,
    certification: rating(REGION) ?? rating("US") ?? null,
    originalTitle: s.original_name,
    originalLanguage: s.original_language,
    status: s.status,
    homepage: s.homepage || null,
    firstAirDate: s.first_air_date || null,
    lastAirDate: s.last_air_date || null,
    inProduction: s.in_production,
    seriesType: s.type,
    creators: s.created_by.map((c) => c.name),
    networks: s.networks.slice(0, 4).map(toCompany),
    episodeRuntime: s.episode_run_time[0] ?? null,
    numberOfSeasons: s.number_of_seasons,
    numberOfEpisodes: s.number_of_episodes,
    // Season 0 is "Specials"; list it last
    seasons: s.seasons
      .filter((x) => x.episode_count > 0)
      .sort((a, b) => (a.season_number || 999) - (b.season_number || 999))
      .map((x) => ({ seasonNumber: x.season_number, name: x.name, episodeCount: x.episode_count, airDate: x.air_date, posterPath: x.poster_path })),
    lastEpisode: toEpisodeRef(s.last_episode_to_air),
    nextEpisode: toEpisodeRef(s.next_episode_to_air),
    countries: (s.production_countries ?? []).map((c) => c.name),
    languages: (s.spoken_languages ?? []).map((l) => l.english_name),
    cast: s.aggregate_credits.cast.slice(0, 20).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.roles[0]?.character ?? "",
      profilePath: c.profile_path,
      episodes: c.total_episode_count,
    })),
    ...pickVideos(s.videos),
    backdrops: pickBackdrops(s.images),
    reviews: pickReviews(s.reviews),
    keywords: s.keywords.results.slice(0, 15),
    recommendations: pickRecommendations(s, "tv"),
    watch: pickProviders(s["watch/providers"]),
  };
}

/** One season with its episodes, or null if it doesn't exist */
export async function getSeason(seriesId: number, seasonNumber: number): Promise<Season | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb", `tv-${seriesId}`);

  const s = await orNull(
    tmdb<{
      season_number: number;
      name: string;
      overview: string;
      air_date: string | null;
      poster_path: string | null;
      episodes: {
        id: number;
        episode_number: number;
        name: string;
        overview: string;
        air_date: string | null;
        runtime: number | null;
        vote_average: number;
        still_path: string | null;
      }[];
    }>(`/tv/${seriesId}/season/${seasonNumber}`),
  );
  if (!s) return null;

  return {
    seasonNumber: s.season_number,
    name: s.name,
    overview: s.overview,
    airDate: s.air_date,
    posterPath: s.poster_path,
    episodes: s.episodes.map((e) => ({
      id: e.id,
      episodeNumber: e.episode_number,
      name: e.name,
      overview: e.overview,
      airDate: e.air_date,
      runtime: e.runtime,
      rating: Math.round(e.vote_average * 10) / 10,
      stillPath: e.still_path,
    })),
  };
}

/* ----------------------------------------------------------------- people */

export async function getPerson(id: number): Promise<PersonDetails | null> {
  "use cache";
  cacheLife("days");
  cacheTag("tmdb", `person-${id}`);

  const p = await orNull(
    tmdb<{
      id: number;
      name: string;
      biography: string;
      birthday: string | null;
      deathday: string | null;
      place_of_birth: string | null;
      known_for_department: string;
      profile_path: string | null;
      images: { profiles: { file_path: string }[] };
      combined_credits: {
        cast: (RawMedia & { character?: string; popularity: number; vote_count: number })[];
        crew: (RawMedia & { job?: string; popularity: number; vote_count: number })[];
      };
    }>(`/person/${id}`, { append_to_response: "combined_credits,images" }),
  );
  if (!p) return null;

  // One entry per title, most popular first; talk shows and self appearances are dropped
  const seen = new Set<string>();
  const credits = [...p.combined_credits.cast.map((c) => ({ ...c, role: c.character ?? "" })), ...p.combined_credits.crew.map((c) => ({ ...c, role: c.job ?? "" }))]
    .filter((c) => (c.media_type === "movie" || c.media_type === "tv") && c.poster_path && !/^(self|himself|herself)\b/i.test(c.role))
    .sort((a, b) => b.vote_count - a.vote_count)
    .filter((c) => {
      const key = `${c.media_type}-${c.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 40)
    .map((c) => ({ ...toSummary(c, c.media_type as MediaType), role: c.role }));

  return {
    id: p.id,
    name: p.name,
    biography: p.biography,
    birthday: p.birthday,
    deathday: p.deathday,
    placeOfBirth: p.place_of_birth,
    knownFor: p.known_for_department,
    profilePath: p.profile_path,
    photos: p.images.profiles.slice(1, 10).map((i) => i.file_path),
    credits,
  };
}

/* ----------------------------------------------------------------- search */

export type SearchResults = { media: MediaSummary[]; people: PersonSummary[] };

/** Movies, series and people matching a query */
export async function searchAll(query: string): Promise<SearchResults> {
  "use cache";
  cacheLife("hours");

  const q = query.trim();
  if (!q) return { media: [], people: [] };

  const data = await tmdb<{ results: (RawMedia & { profile_path?: string | null; known_for_department?: string })[] }>("/search/multi", {
    query: q,
    include_adult: "false",
  });
  return {
    media: data.results
      .filter((r) => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path)
      .map((r) => toSummary(r, r.media_type as MediaType)),
    people: data.results
      .filter((r) => r.media_type === "person" && r.profile_path)
      .slice(0, 8)
      .map((r) => ({ id: r.id, name: r.name ?? "", knownFor: r.known_for_department ?? "", profilePath: r.profile_path ?? null })),
  };
}

/* ---------------------------------------------------------------- matching */

const normalizeTitle = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^(the|a|an) /, "")
    .trim();

/**
 * Finds the TMDB movie for a title + release year, or null when there's no confident match
 * (same normalised title, or one containing the other, released within a year).
 */
export async function matchMovie(title: string, year: number): Promise<MediaSummary | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("tmdb");

  const data = await tmdb<{ results: RawMedia[] }>("/search/movie", { query: title, include_adult: "false" });
  const want = normalizeTitle(title);
  const match = data.results.find((m) => {
    const got = normalizeTitle(m.title ?? "");
    const released = Number(m.release_date?.slice(0, 4));
    const sameTitle = got === want || (want.length > 3 && (got.includes(want) || want.includes(got)) && Math.min(got.length, want.length) / Math.max(got.length, want.length) > 0.6);
    return sameTitle && released && Math.abs(released - year) <= 1 && m.poster_path;
  });
  return match ? toSummary(match, "movie") : null;
}
