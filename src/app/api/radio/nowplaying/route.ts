import { connection } from "next/server";
import { cleanSongText, type NowPlaying } from "@/lib/radio";

const RADIO_SERVER = process.env.RADIO_SERVER_URL || "https://radio.geyetv.com";

type AzuraNowPlaying = {
  station: { shortcode: string };
  listeners?: { current?: number };
  live?: { is_live?: boolean; streamer_name?: string };
  now_playing?: { elapsed?: number; duration?: number; song?: { title?: string; artist?: string; text?: string } };
  playing_next?: { song?: { title?: string; text?: string } } | null;
};

// Current song on every G-Eye radio station, keyed by station shortcode (song text only;
// station names and artwork come from Supabase).
// Proxied (and briefly cached by the CDN) so browsers don't depend on the radio server's CORS settings.
export async function GET() {
  // Live data: always run at request time, never prerendered at build
  await connection();
  try {
    const res = await fetch(`${RADIO_SERVER}/api/nowplaying`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Radio server responded ${res.status}`);
    const stations: AzuraNowPlaying[] = await res.json();
    const fetchedAt = Date.now();

    const result: Record<string, NowPlaying> = {};
    for (const s of stations) {
      const song = s.now_playing?.song ?? {};
      const title = cleanSongText(song.title || song.text || "");
      result[s.station.shortcode] = {
        station: s.station.shortcode,
        listeners: s.listeners?.current ?? 0,
        isLive: Boolean(s.live?.is_live),
        streamer: s.live?.is_live ? s.live.streamer_name || null : null,
        song: { title: title || "G-Eye Radio", artist: cleanSongText(song.artist ?? "") },
        next: s.playing_next?.song ? cleanSongText(s.playing_next.song.title || s.playing_next.song.text || "") || null : null,
        elapsed: s.now_playing?.elapsed ?? 0,
        duration: s.now_playing?.duration ?? 0,
        fetchedAt,
      };
    }
    return Response.json(result, { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20" } });
  } catch (err) {
    console.error("Loading radio now-playing failed:", err);
    return Response.json({}, { status: 502 });
  }
}
