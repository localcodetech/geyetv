import Link from "next/link";

/** Keyword tags; each one searches the catalog */
export function Keywords({ keywords }: { keywords: { id: number; name: string }[] }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">Keywords</h2>
      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <Link key={k.id} href={`/search?q=${encodeURIComponent(k.name)}`} className="rounded-md bg-panel px-2.5 py-1 text-xs text-white/70 hover:bg-line hover:text-white">
            {k.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
