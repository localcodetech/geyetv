import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Gift } from "lucide-react";
import { getFreeClassics, type FreeTitle } from "@/lib/archive";
import { isTmdbConfigured } from "@/lib/tmdb";
import { HeroCarousel } from "@/components/media/HeroCarousel";
import { PosterCard } from "@/components/media/PosterCard";
import { TmdbNotice } from "@/components/media/TmdbNotice";

export const metadata: Metadata = {
  title: "Free Classics | G-Eye TV",
  description: "Classic movies in the public domain. Watch free or download, legally.",
};

export default function FreeClassicsPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-[70svh] max-w-350 animate-pulse px-4 pt-10"><div className="size-full rounded-2xl bg-white/5" /></div>}>
      <FreeClassics />
    </Suspense>
  );
}

/** Loaded at request time (then cached for a day) so builds don't match hundreds of films against TMDB */
async function FreeClassics() {
  await connection();
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  let titles: FreeTitle[];
  try {
    titles = await getFreeClassics();
  } catch (err) {
    console.error("Loading free classics failed:", err);
    return <TmdbNotice reason="unreachable" />;
  }
  const hero = titles.filter((t) => t.backdropPath && t.overview).slice(0, 5);

  return (
    <div className="pb-12">
      <HeroCarousel items={hero} label="FREE CLASSICS" />
      <div className={`relative z-10 mx-auto max-w-350 px-4 ${hero.length ? "-mt-6" : "pt-10"}`}>
        <div className="mb-8 flex items-start gap-4 rounded-2xl bg-emerald-500/10 p-5 ring-1 ring-emerald-500/25">
          <Gift className="mt-0.5 size-6 shrink-0 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold">Free classics: watch or download, legally</h1>
            <p className="mt-1 max-w-3xl text-sm text-white/65">
              These films are in the public domain or shared under Creative Commons, so anyone may watch, download and share them. Video files are
              hosted by the Internet Archive.
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-white/45">{titles.length} films</p>
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {titles.map((t) => (
            <PosterCard key={t.id} item={t} free />
          ))}
        </div>
      </div>
    </div>
  );
}
