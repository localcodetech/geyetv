import { Suspense } from "react";
import Link from "next/link";
import { Clapperboard, MonitorPlay, Radio, Tv } from "lucide-react";
import { connection } from "next/server";
import { getChannels, type ChannelLists } from "@/lib/channels";
import { getGenres, getHomeRows, isTmdbConfigured, type MediaRow, type MediaSummary } from "@/lib/tmdb";
import { HeroCarousel } from "@/components/media/HeroCarousel";
import { PosterRow } from "@/components/media/PosterRow";
import { LiveNowRow } from "@/components/LiveNowRow";
import { FreeClassicsRow } from "@/components/media/FreeClassicsRow";

const SECTIONS = [
  { href: "/live", label: "Live TV", sub: "channels", Icon: Tv },
  { href: "/movies", label: "Movies", sub: "Nollywood & more", Icon: Clapperboard },
  { href: "/series", label: "Series", sub: "episodes & seasons", Icon: MonitorPlay },
  { href: "/radio", label: "Radio", sub: "stations", Icon: Radio },
];

// Colourful tiles for "Browse by genre"
const GENRE_COLORS = ["from-rose-600", "from-amber-500", "from-emerald-600", "from-sky-600", "from-violet-600", "from-fuchsia-600", "from-orange-600", "from-teal-600"];

type Catalog = { hero: MediaSummary[]; rows: MediaRow[]; genres: { id: number; name: string }[] };

async function loadCatalog(): Promise<Catalog> {
  const empty: Catalog = { hero: [], rows: [], genres: [] };
  if (!isTmdbConfigured()) return empty;
  try {
    const [{ hero, rows }, genres] = await Promise.all([getHomeRows(), getGenres("movie").catch(() => [])]);
    return { hero, rows, genres };
  } catch (err) {
    console.error("Loading home catalog failed:", err);
    return empty;
  }
}

export default async function Home() {
  const channels = await getChannels();
  // The channel-only page is the instant shell; movies and series stream in at request time
  // (then stay cached), so builds never depend on TMDB being reachable.
  return (
    <Suspense fallback={<HomeView channels={channels} catalog={{ hero: [], rows: [], genres: [] }} />}>
      <HomeWithCatalog channels={channels} />
    </Suspense>
  );
}

async function HomeWithCatalog({ channels }: { channels: ChannelLists }) {
  await connection();
  return <HomeView channels={channels} catalog={await loadCatalog()} withCatalog />;
}

function HomeView({ channels, catalog: { hero, rows, genres }, withCatalog = false }: { channels: ChannelLists; catalog: Catalog; withCatalog?: boolean }) {
  const counts: Record<string, number> = { "/live": channels.tv.length, "/radio": channels.radio.length };

  return (
    <div className="pb-12">
      {hero.length > 0 ? (
        <HeroCarousel items={hero} />
      ) : (
        <section className="mx-auto max-w-350 px-4 pb-6 pt-16">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand">WELCOME TO G-EYE TV</p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">Live TV, radio, movies and series in one place.</h1>
        </section>
      )}

      <div className={`relative z-10 mx-auto max-w-350 space-y-12 px-4 ${hero.length ? "-mt-6" : ""}`}>
        {/* Section shortcuts */}
        <nav className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SECTIONS.map(({ href, label, sub, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.09] hover:ring-brand/60"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{label}</span>
                <span className="block truncate text-xs text-white/50">{counts[href] ? `${counts[href]} ${sub}` : sub}</span>
              </span>
            </Link>
          ))}
        </nav>

        <LiveNowRow title="Live now on G-Eye TV" channels={channels.tv} href="/live" />

        {rows.slice(0, 2).map((row) => (
          <PosterRow key={row.id} id={row.id} title={row.title} href={row.href} items={row.items} />
        ))}

        {withCatalog && isTmdbConfigured() && (
          <Suspense>
            <FreeClassicsRow />
          </Suspense>
        )}

        {genres.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold tracking-tight sm:text-xl">Browse movies by genre</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {genres.slice(0, 12).map((g, i) => (
                <Link
                  key={g.id}
                  href={`/movies/browse?genre=${g.id}`}
                  className={`relative overflow-hidden rounded-xl bg-linear-to-br ${GENRE_COLORS[i % GENRE_COLORS.length]} to-[#151518] px-4 py-5 font-bold ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-white/40`}
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {rows.slice(2).map((row) => (
          <PosterRow key={row.id} id={row.id} title={row.title} href={row.href} items={row.items} />
        ))}

        <LiveNowRow title="Radio stations" channels={channels.radio} href="/radio" />
      </div>
    </div>
  );
}
