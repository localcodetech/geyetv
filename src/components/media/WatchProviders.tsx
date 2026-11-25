import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { tmdbImage } from "@/lib/media";
import { REGION, type Provider, type WatchProviders as Providers } from "@/lib/tmdb";

export function WatchProviders({ watch }: { watch: Providers }) {
  const groups: [string, Provider[]][] = [
    ["Stream", watch.stream],
    ["Rent", watch.rent],
    ["Buy", watch.buy],
  ];
  const any = groups.some(([, p]) => p.length);

  return (
    <section>
      <h2 className="mb-4 heading text-xl sm:text-2xl">Where to watch</h2>
      {any ? (
        <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-10">
          {groups.map(([label, providers]) =>
            providers.length ? (
              <div key={label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {providers.map((p) => (
                    <Image
                      key={p.id}
                      src={tmdbImage(p.logoPath, "w92")!}
                      alt={p.name}
                      title={p.name}
                      width={44}
                      height={44}
                      unoptimized
                      className="rounded ring-1 ring-line"
                    />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      ) : (
        <p className="text-white/50">No streaming information for your region ({REGION}) yet.</p>
      )}
      {watch.link && (
        <a href={watch.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
          Availability data by JustWatch
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </section>
  );
}
