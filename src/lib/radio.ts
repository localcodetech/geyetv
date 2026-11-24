// Radio helpers shared by server and client code.
// G-Eye radio runs on AzuraCast: streams are /listen/<station>/radio.mp3 and
// /api/nowplaying reports the current song for every station. Station names and artwork
// come from Supabase (the channels list), never from AzuraCast.

export type NowPlaying = {
  station: string;
  listeners: number;
  isLive: boolean;
  /** DJ name when a presenter is live on air */
  streamer: string | null;
  song: { title: string; artist: string };
  next: string | null;
  /** Seconds into the current song when `fetchedAt` was taken */
  elapsed: number;
  duration: number;
  fetchedAt: number;
};

/** "https://radio.geyetv.com/listen/g-eye_power_fm/radio.mp3" -> "g-eye_power_fm" */
export const stationCode = (streamUrl: string) => streamUrl.match(/\/listen\/([^/]+)\//)?.[1] ?? null;

const titleCase = (s: string) => (s === s.toLowerCase() ? s.replace(/(^|[\s(-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase()) : s);

/** Tidies song names that are really file names: "asake - yoga (official video).mp4" -> "Asake - Yoga" */
export function cleanSongText(text: string) {
  return titleCase(
    text
      .replace(/\.?\b(mp3|mp4|m4a|aac|wav|ogg|flac)\b/gi, "")
      .replace(/[([]?\s*official\s+(music\s+|lyrics?\s+)?(video|audio|visuali[sz]er)\s*[)\]]?/gi, "")
      .replace(/[-\s]official\b/gi, "")
      .replace(/\s*--+\s*/g, " - ")
      .replace(/\b(\d{3,4}p|hd|hq)\b/gi, "")
      .replace(/\bmedia\s+[a-z0-9]{8,}\b/gi, "")
      .replace(/[_]+/g, " ")
      .replace(/\s*-\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  );
}
