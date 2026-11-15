import type { NextRequest } from "next/server";
import { searchAll } from "@/lib/tmdb";

// Movie, series and people search. Proxies TMDB so the key never reaches the browser.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.slice(0, 100) ?? "";
  try {
    return Response.json(await searchAll(q));
  } catch (err) {
    console.error("Search failed:", err);
    return Response.json({ media: [], people: [], error: "Search is unavailable right now" }, { status: 502 });
  }
}
