import { connection } from "next/server";
import { getFreeClassics } from "@/lib/archive";
import { PosterRow } from "@/components/media/PosterRow";

/**
 * "Free classics" row. Loaded at request time (then cached for a day) rather than during the build:
 * matching hundreds of archive.org films against TMDB would otherwise run in every build worker.
 */
export async function FreeClassicsRow() {
  await connection();
  const free = await getFreeClassics().catch((err) => {
    console.error("Loading free classics failed:", err);
    return [];
  });
  return free.length ? <PosterRow id="free" title="Free classics · watch now" href="/movies/free" items={free.slice(0, 20)} free /> : null;
}
