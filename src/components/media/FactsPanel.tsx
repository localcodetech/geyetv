import Image from "next/image";
import { tmdbImage } from "@/lib/media";
import type { Company } from "@/lib/tmdb";

export type Fact = [label: string, value: React.ReactNode];

/** "Details" sidebar: label/value facts plus optional company or network logos */
export function FactsPanel({ facts, companies, companiesLabel }: { facts: Fact[]; companies?: Company[]; companiesLabel?: string }) {
  const shown = facts.filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== false);

  return (
    <aside className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
      <h2 className="mb-4 text-lg font-bold">Details</h2>
      <dl className="space-y-3 text-sm">
        {shown.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</dt>
            <dd className="mt-0.5 text-white/85">{value}</dd>
          </div>
        ))}
      </dl>
      {companies && companies.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">{companiesLabel}</p>
          <div className="flex flex-wrap items-center gap-3">
            {companies.map((c) =>
              c.logoPath ? (
                // Logos are mostly dark-on-transparent, so give them a light chip
                <span key={c.id} title={c.name} className="rounded-md bg-white/90 px-2 py-1.5">
                  <Image src={tmdbImage(c.logoPath, "w185")!} alt={c.name} width={80} height={24} unoptimized className="h-5 w-auto object-contain" />
                </span>
              ) : (
                <span key={c.id} className="rounded-md bg-white/10 px-2 py-1 text-xs">
                  {c.name}
                </span>
              ),
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
