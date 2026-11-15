import { getSeason } from "@/lib/tmdb";

// Episodes for one season, loaded when a viewer switches seasons on a series page
export async function GET(_request: Request, ctx: RouteContext<"/api/series/[id]/season/[season]">) {
  const { id, season } = await ctx.params;
  if (!/^\d{1,9}$/.test(id) || !/^\d{1,3}$/.test(season)) return Response.json({ error: "Invalid id" }, { status: 400 });

  try {
    const data = await getSeason(Number(id), Number(season));
    return data ? Response.json(data) : Response.json({ error: "Season not found" }, { status: 404 });
  } catch (err) {
    console.error(`Loading season ${season} of series ${id} failed:`, err);
    return Response.json({ error: "Episodes are unavailable right now" }, { status: 502 });
  }
}
