// Helpers shared by server and client code (no secrets here)

export type ImageSize = "w92" | "w185" | "w300" | "w342" | "w500" | "w780" | "w1280" | "h632" | "original";

export const tmdbImage = (path: string | null | undefined, size: ImageSize) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);

export const mediaHref = (m: { type: "movie" | "tv"; id: number }) => `/${m.type === "tv" ? "series" : "movies"}/${m.id}`;

export const formatRuntime = (minutes: number | null | undefined) =>
  minutes ? (minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`) : null;

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso + (iso.length === 10 ? "T00:00:00Z" : "")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : null;
