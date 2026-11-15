import type { NextRequest } from "next/server";
import { searchMovies } from "@/lib/tmdb";

// Movie search for the /movies page. Proxies TMDB so the key never reaches the browser.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.slice(0, 100) ?? "";
  try {
    return Response.json({ results: await searchMovies(q) });
  } catch (err) {
    console.error("Movie search failed:", err);
    return Response.json({ results: [], error: "Search is unavailable right now" }, { status: 502 });
  }
}
