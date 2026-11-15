import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { UserRound } from "lucide-react";
import { getPerson, isTmdbConfigured, tmdbImage } from "@/lib/tmdb";
import { formatDate } from "@/lib/media";
import { PosterCard } from "@/components/media/PosterCard";
import { Biography } from "@/components/media/Biography";
import { TmdbNotice } from "@/components/media/TmdbNotice";
import { DetailsSkeleton } from "@/components/media/DetailsSkeleton";

const parseId = (id: string) => (/^\d{1,9}$/.test(id) ? Number(id) : null);

// "Now" for age calculations; cached for a day so the page can still be prerendered
async function today() {
  "use cache";
  cacheLife("days");
  return Date.now();
}

export async function generateMetadata({ params }: PageProps<"/person/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const person = id && isTmdbConfigured() ? await getPerson(id).catch(() => null) : null;
  return person ? { title: `${person.name} | G-Eye TV`, description: person.biography.slice(0, 160) } : { title: "Person | G-Eye TV" };
}

export default function PersonPage(props: PageProps<"/person/[id]">) {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <PersonDetails params={props.params} />
    </Suspense>
  );
}

async function PersonDetails({ params }: Pick<PageProps<"/person/[id]">, "params">) {
  const id = parseId((await params).id);
  if (!id) notFound();
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  const person = await getPerson(id).catch((err) => {
    console.error(`Loading person ${id} failed:`, err);
    return undefined;
  });
  if (person === undefined) return <TmdbNotice reason="unreachable" />;
  if (!person) notFound();

  const photo = tmdbImage(person.profilePath, "h632");
  const end = person.deathday ? new Date(person.deathday).getTime() : await today();
  const age = person.birthday ? Math.floor((end - new Date(person.birthday).getTime()) / 3.15576e10) : null;

  return (
    <article className="mx-auto max-w-350 px-4 pb-12 pt-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="relative mx-auto aspect-2/3 w-52 shrink-0 overflow-hidden rounded-2xl bg-[#1d1d21] ring-1 ring-white/10 md:mx-0 md:w-72">
          {photo ? <Image src={photo} alt={person.name} fill priority unoptimized className="object-cover" /> : <UserRound className="absolute inset-0 m-auto size-16 text-white/20" />}
        </div>

        <div className="min-w-0 flex-1 md:pt-4">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-brand">{person.knownFor.toUpperCase()}</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{person.name}</h1>
          <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3 text-sm">
            {person.birthday && (
              <div>
                <dt className="text-white/45">Born</dt>
                <dd className="font-semibold">
                  {formatDate(person.birthday)}
                  {age !== null && !person.deathday && <span className="font-normal text-white/50"> ({age} years old)</span>}
                </dd>
              </div>
            )}
            {person.deathday && (
              <div>
                <dt className="text-white/45">Died</dt>
                <dd className="font-semibold">
                  {formatDate(person.deathday)}
                  {age !== null && <span className="font-normal text-white/50"> (aged {age})</span>}
                </dd>
              </div>
            )}
            {person.placeOfBirth && (
              <div>
                <dt className="text-white/45">Place of birth</dt>
                <dd className="font-semibold">{person.placeOfBirth}</dd>
              </div>
            )}
            <div>
              <dt className="text-white/45">Credits</dt>
              <dd className="font-semibold">{person.credits.length}</dd>
            </div>
          </dl>
          <Biography text={person.biography || `We don't have a biography for ${person.name} yet.`} />
        </div>
      </div>

      {person.credits.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold sm:text-xl">Known for</h2>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-6 xl:grid-cols-8">
            {person.credits.map((c) => (
              <PosterCard key={`${c.type}-${c.id}`} item={c} subtitle={[c.role, c.year].filter(Boolean).join(" · ")} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
