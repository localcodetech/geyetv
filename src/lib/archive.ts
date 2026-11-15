import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { matchMovie, type MediaSummary } from "@/lib/tmdb";

// Free, legally downloadable feature films from the Internet Archive (archive.org/details/feature_films).
// Only titles we're allowed to stream and redistribute are included:
//  - marked public domain, CC0, CC BY or CC BY-SA, AND released in or before PD_CUTOFF_YEAR.
//    Ghana protects films for 70 years after release, and uploaders sometimes mislabel modern films
//    (e.g. a 2011 Bollywood film tagged CC0), so a licence label alone is not trusted for newer titles.
//  - modern films only when listed in VERIFIED_MODERN after checking the rights holder's own licence.
// Non-commercial (NC) and no-derivatives (ND) licences are excluded because G-Eye TV is a commercial service.

const PD_CUTOFF_YEAR = 1954;

/** archive.org items checked by hand: the creator released the film under the stated licence */
const VERIFIED_MODERN = new Set([
  "Sita_Sings_the_Blues", // Nina Paley, CC0: https://sitasingstheblues.com
]);

/** TMDB ids we don't show even though they're public domain (editorial) */
const EXCLUDED_TMDB_IDS = new Set([
  618, // The Birth of a Nation (1915): racist propaganda glorifying the Ku Klux Klan
  89581, // Child Bride (1938): exploitation film with nudity of a child actor
]);
const CANDIDATES = 600; // most downloaded items to consider
const MAX_TITLES = 120;

export type FreeLicense = "public-domain" | "cc0" | "cc-by" | "cc-by-sa";

export type FreeTitle = MediaSummary & {
  archiveId: string;
  archiveTitle: string;
  license: FreeLicense;
  licenseUrl: string;
};

export type FreeFile = { url: string; name: string; height: number; sizeBytes: number; label: string };

export type FreeCopy = FreeTitle & {
  /** Best file for streaming in the browser (around 480p) */
  stream: FreeFile;
  /** Every full-length MP4, best quality first */
  downloads: FreeFile[];
  creator: string | null;
};

type SearchDoc = { identifier: string; title?: string; year?: string; licenseurl?: string; downloads?: number };

function classifyLicense(url: string | undefined): FreeLicense | null {
  const u = url?.toLowerCase() ?? "";
  if (u.includes("/publicdomain/zero/")) return "cc0";
  if (u.includes("/publicdomain/mark/") || u.includes("/licenses/publicdomain")) return "public-domain";
  if (/\/licenses\/by\/\d/.test(u)) return "cc-by";
  if (/\/licenses\/by-sa\/\d/.test(u)) return "cc-by-sa";
  return null; // NC, ND or unknown
}

/** "His Girl Friday (1940) [HD]" -> "His Girl Friday" */
const cleanTitle = (t: string) =>
  t
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/\b(18|19|20)\d{2}\b/g, " ")
    .replace(/\s+[-–|:]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

const parseYear = (doc: SearchDoc) => {
  const year = Number(doc.year) || Number(`${doc.title} ${doc.identifier}`.match(/\b(18[89]\d|19\d{2}|20[0-2]\d)\b/)?.[1]);
  return year || null;
};

async function archive<T>(url: string, retries = 1): Promise<T> {
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`archive.org responded ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    // archive.org is occasionally slow to accept connections; one retry clears most failures
    if (retries > 0) return archive<T>(url, retries - 1);
    throw err;
  }
}

/** Runs `fn` over `items` with limited concurrency, dropping failures */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<(R | null)[]> {
  const out: (R | null)[] = new Array(items.length).fill(null);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]).catch(() => null);
      }
    }),
  );
  return out;
}

/** Free classics, most popular first, each matched to its TMDB entry */
export async function getFreeClassics(): Promise<FreeTitle[]> {
  "use cache";
  cacheLife("days");
  cacheTag("free-classics");

  const params = new URLSearchParams({ q: "collection:feature_films AND mediatype:movies", rows: String(CANDIDATES), output: "json" });
  for (const f of ["identifier", "title", "year", "licenseurl", "downloads"]) params.append("fl[]", f);
  params.append("sort[]", "downloads desc");
  const { response } = await archive<{ response: { docs: SearchDoc[] } }>(`https://archive.org/advancedsearch.php?${params}`);

  const candidates = response.docs.flatMap((doc) => {
    const year = parseYear(doc);
    const allowed = year && (year <= PD_CUTOFF_YEAR || VERIFIED_MODERN.has(doc.identifier));
    const license = allowed && doc.title && !/\bsex\b/i.test(doc.title) ? classifyLicense(doc.licenseurl) : null;
    return license && year ? [{ doc, year, license, title: cleanTitle(doc.title!) }] : [];
  });

  const matched = await mapLimit(candidates, 8, async (c) => {
    const movie = await matchMovie(c.title, c.year);
    return movie
      ? { ...movie, archiveId: c.doc.identifier, archiveTitle: c.doc.title!, license: c.license, licenseUrl: c.doc.licenseurl! }
      : null;
  });

  // Several uploads of the same film collapse into the most downloaded one
  const seen = new Set<number>();
  return matched
    .filter((m): m is FreeTitle => m !== null && !EXCLUDED_TMDB_IDS.has(m.id))
    .filter((m) => !seen.has(m.id) && seen.add(m.id))
    .slice(0, MAX_TITLES);
}

type ArchiveFile = { name: string; format?: string; size?: string; length?: string; height?: string };

/** Playable / downloadable MP4s for one archive.org item */
async function getFiles(archiveId: string): Promise<{ files: FreeFile[]; creator: string | null }> {
  "use cache";
  cacheLife("days");
  cacheTag("free-classics");

  const meta = await archive<{ files?: ArchiveFile[]; metadata?: { creator?: string | string[] } }>(`https://archive.org/metadata/${encodeURIComponent(archiveId)}`);
  const mp4s = (meta.files ?? []).filter((f) => f.name.toLowerCase().endsWith(".mp4") && /h\.264|mpeg4/i.test(f.format ?? ""));

  // Skip trailers and partial clips: keep files at least 80% as long as the longest one
  const longest = Math.max(0, ...mp4s.map((f) => Number(f.length) || 0));
  const byHeight = new Map<number, FreeFile>();
  for (const f of mp4s) {
    if ((Number(f.length) || 0) < longest * 0.8) continue;
    const height = Number(f.height) || (/512kb/i.test(f.name) ? 240 : 0);
    const file: FreeFile = {
      url: `https://archive.org/download/${encodeURIComponent(archiveId)}/${f.name.split("/").map(encodeURIComponent).join("/")}`,
      name: f.name,
      height,
      sizeBytes: Number(f.size) || 0,
      label: height ? `${height}p` : "MP4",
    };
    // One file per quality; prefer the smaller of equal-quality encodes
    const existing = byHeight.get(height);
    if (!existing || (file.sizeBytes && file.sizeBytes < existing.sizeBytes)) byHeight.set(height, file);
  }

  const creator = meta.metadata?.creator;
  return {
    files: [...byHeight.values()].sort((a, b) => b.height - a.height),
    creator: (Array.isArray(creator) ? creator[0] : creator) ?? null,
  };
}

/** The free copy of a TMDB movie, with its files, or null if it isn't one of our free classics */
export async function getFreeCopy(tmdbId: number): Promise<FreeCopy | null> {
  const title = (await getFreeClassics()).find((t) => t.id === tmdbId);
  if (!title) return null;

  const { files, creator } = await getFiles(title.archiveId);
  if (!files.length) return null;

  // Stream the smallest file that is at least 360p (fast to start), else the best available
  const stream = [...files].reverse().find((f) => f.height >= 360) ?? files[0];
  return { ...title, stream, downloads: files, creator };
}

export const LICENSE_LABELS: Record<FreeLicense, { label: string; url: string }> = {
  "public-domain": { label: "Public domain", url: "https://creativecommons.org/publicdomain/mark/1.0/" },
  cc0: { label: "CC0 (public domain)", url: "https://creativecommons.org/publicdomain/zero/1.0/" },
  "cc-by": { label: "Creative Commons BY", url: "https://creativecommons.org/licenses/by/4.0/" },
  "cc-by-sa": { label: "Creative Commons BY-SA", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
};
