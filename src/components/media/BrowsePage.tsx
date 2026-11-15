import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COUNTRY_OPTIONS, discover, getGenres, isTmdbConfigured, SORT_OPTIONS, type DiscoverResult, type MediaType } from "@/lib/tmdb";
import { PosterCard } from "@/components/media/PosterCard";
import { BrowseFilters } from "@/components/media/BrowseFilters";
import { TmdbNotice } from "@/components/media/TmdbNotice";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const int = (v: string, min: number, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

/** Shared /movies/browse and /series/browse page */
export function BrowsePage({ type, searchParams }: { type: MediaType; searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-350 px-4 pb-12 pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{type === "tv" ? "Browse series" : "Browse movies"}</h1>
      <p className="mb-6 mt-1 text-white/50">Filter by genre, year, country and rating.</p>
      {/* Search params are request data, so the results stream in behind this boundary */}
      <Suspense fallback={<GridSkeleton />}>
        <BrowseResults type={type} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BrowseResults({ type, searchParams }: { type: MediaType; searchParams: SearchParams }) {
  const sp = await searchParams;
  if (!isTmdbConfigured()) return <TmdbNotice reason="missing-key" />;

  const genres = await getGenres(type).catch(() => []);
  const sortValues: string[] = SORT_OPTIONS.map((s) => s.value);
  const values = {
    genre: int(one(sp.genre), 1, 99999)?.toString() ?? "",
    year: int(one(sp.year), 1900, 2100)?.toString() ?? "",
    country: COUNTRY_OPTIONS.some((c) => c.value === one(sp.country)) ? one(sp.country) : "",
    rating: int(one(sp.rating), 1, 9)?.toString() ?? "",
    sort: sortValues.includes(one(sp.sort)) ? one(sp.sort) : "",
  };
  const page = int(one(sp.page), 1, 500) ?? 1;
  const sorts = type === "tv" ? SORT_OPTIONS.filter((s) => s.value !== "revenue.desc") : SORT_OPTIONS;

  let result: DiscoverResult;
  try {
    result = await discover(type, {
      genre: values.genre ? Number(values.genre) : undefined,
      year: values.year ? Number(values.year) : undefined,
      country: values.country || undefined,
      minRating: values.rating ? Number(values.rating) : undefined,
      sort: values.sort || undefined,
      page,
    });
  } catch (err) {
    console.error(`Browsing ${type} failed:`, err);
    return <TmdbNotice reason="unreachable" />;
  }

  const pageHref = (p: number) => {
    const q = new URLSearchParams(Object.entries({ ...values, page: p > 1 ? String(p) : "" }).filter(([, v]) => v));
    return `?${q}`;
  };

  return (
    <BrowseFilters
      values={values}
      genres={genres.map((g) => ({ value: String(g.id), label: g.name }))}
      countries={COUNTRY_OPTIONS}
      sorts={sorts}
    >
      <p className="mb-4 text-sm text-white/45">
        {result.totalResults.toLocaleString("en-US")} titles{result.totalPages > 1 && ` · page ${result.page} of ${result.totalPages}`}
      </p>
      {result.items.length ? (
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {result.items.map((m) => (
            <PosterCard key={m.id} item={m} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-white/50">Nothing matches these filters. Try removing one.</p>
      )}

      {result.totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          <PageLink href={pageHref(page - 1)} disabled={page <= 1} label="Previous">
            <ChevronLeft className="size-4" />
          </PageLink>
          {pageNumbers(page, result.totalPages).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-1 text-white/30">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={pageHref(p)}
                aria-current={p === page ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-full text-sm font-medium transition-colors ${
                  p === page ? "bg-brand text-white" : "text-white/70 ring-1 ring-white/15 hover:bg-white/10"
                }`}
              >
                {p}
              </Link>
            ),
          )}
          <PageLink href={pageHref(page + 1)} disabled={page >= result.totalPages} label="Next">
            <ChevronRight className="size-4" />
          </PageLink>
        </nav>
      )}
    </BrowseFilters>
  );
}

/** 1 … 4 5 [6] 7 8 … 40 */
function pageNumbers(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 2, current - 1, current, current + 1, current + 2].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  const cls = "grid size-10 place-items-center rounded-full ring-1 ring-white/15";
  return disabled ? (
    <span aria-hidden className={`${cls} text-white/20`}>
      {children}
    </span>
  ) : (
    <Link href={href} aria-label={label} className={`${cls} text-white/70 hover:bg-white/10`}>
      {children}
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-3 gap-x-3 gap-y-6 pt-16 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} className="aspect-2/3 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}
