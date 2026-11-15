import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import seed from "@/data/channels.json";

export type ChannelType = "tv" | "radio";

export type Channel = {
  id: string;
  type: ChannelType;
  title: string;
  /** Row the channel is shown in, e.g. "News" or "Radio" */
  category: string;
  streamUrl: string;
  logoUrl: string;
};

export type ChannelLists = Record<ChannelType, Channel[]>;

// Category ids of the existing Supabase `content` table
const CATEGORY_TYPES: Record<string, ChannelType> = {
  "1d401013-085c-4a29-aa37-b433e7c96879": "tv",
  "29f2c0bf-2b5b-40c2-853e-996222b98fde": "radio",
};

type ContentRow = {
  id: string;
  category_id: string;
  title: string;
  stream_url: string;
  logo_url: string | null;
};

async function fromSupabase(url: string, key: string): Promise<Channel[]> {
  const res = await fetch(
    `${url}/rest/v1/content?select=id,category_id,title,stream_url,logo_url&is_live=eq.true&order=created_at`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`);

  const rows: ContentRow[] = await res.json();
  return rows
    .filter((r) => CATEGORY_TYPES[r.category_id])
    .map((r) => ({
      id: r.id,
      type: CATEGORY_TYPES[r.category_id],
      title: r.title,
      category: CATEGORY_TYPES[r.category_id] === "radio" ? "Radio" : "Live TV",
      streamUrl: r.stream_url,
      logoUrl: r.logo_url ?? "",
    }));
}

/**
 * Live TV and radio channels, grouped by type.
 * Reads the Supabase `content` table when SUPABASE_URL / SUPABASE_ANON_KEY are set,
 * otherwise (or if Supabase is down) falls back to src/data/channels.json.
 */
export async function getChannels(): Promise<ChannelLists> {
  "use cache";
  cacheLife("minutes");
  cacheTag("channels");

  let channels = seed as Channel[];
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      channels = await fromSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
      console.error("Falling back to seed channels:", err);
    }
  }

  return {
    tv: channels.filter((c) => c.type === "tv"),
    radio: channels.filter((c) => c.type === "radio"),
  };
}
