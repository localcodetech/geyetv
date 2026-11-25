"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, RotateCcw } from "lucide-react";

type Option = { value: string; label: string };

type Props = {
  values: Record<"genre" | "year" | "country" | "sort" | "rating", string>;
  genres: Option[];
  countries: readonly Option[];
  sorts: readonly Option[];
  children: React.ReactNode;
};

const THIS_YEAR = new Date().getUTCFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1949 }, (_, i) => String(THIS_YEAR + 1 - i));
const RATINGS = [
  { value: "8", label: "8+ ★" },
  { value: "7", label: "7+ ★" },
  { value: "6", label: "6+ ★" },
  { value: "5", label: "5+ ★" },
];

/** Filter bar for the browse pages. Changing a filter updates the URL (and resets to page 1). */
export function BrowseFilters({ values, genres, countries, sorts, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const update = (key: keyof Props["values"], value: string) => {
    const next = new URLSearchParams(Object.entries({ ...values, [key]: value }).filter(([, v]) => v));
    startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const active = Object.values(values).some(Boolean);

  return (
    <>
      <div className="sticky top-[57px] z-30 -mx-4 mb-6 border-b border-white/10 bg-surface px-4 py-3">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <Select label="Genre" value={values.genre} options={genres} onChange={(v) => update("genre", v)} />
          <Select label="Year" value={values.year} options={YEARS.map((y) => ({ value: y, label: y }))} onChange={(v) => update("year", v)} />
          <Select label="Country" value={values.country} options={countries} onChange={(v) => update("country", v)} />
          <Select label="Rating" value={values.rating} options={RATINGS} onChange={(v) => update("rating", v)} />
          <Select label="Sort" value={values.sort} options={sorts} onChange={(v) => update("sort", v)} allLabel="Most popular" />
          {active && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
              className="inline-flex shrink-0 items-center gap-1.5 rounded px-3 py-2 text-sm text-white/60 hover:text-white"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          )}
          {pending && <LoaderCircle className="size-4 shrink-0 animate-spin text-white/60" />}
        </div>
      </div>
      <div className={`transition-opacity duration-200 ${pending ? "pointer-events-none opacity-40" : ""}`}>{children}</div>
    </>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  allLabel,
}: {
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (v: string) => void;
  allLabel?: string;
}) {
  return (
    <label className={`relative shrink-0 rounded ring-1 ring-inset transition-colors ${value ? "bg-brand/15 ring-brand" : "ring-line hover:ring-white/30"}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent py-2 pl-4 pr-8 text-sm font-medium text-white outline-none [&>option]:bg-panel"
      >
        <option value="">{allLabel ?? `${label}: All`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/50">▼</span>
    </label>
  );
}
