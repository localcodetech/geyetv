import { Clapperboard } from "lucide-react";

/** Shown instead of movie / series content when TMDB isn't configured or can't be reached */
export function TmdbNotice({ reason }: { reason: "missing-key" | "unreachable" }) {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <Clapperboard className="mb-4 size-12 text-brand" />
      <h1 className="mb-2 text-2xl font-bold">Movies and series are coming soon</h1>
      {reason === "missing-key" ? (
        <p className="text-white/60">
          Add <code className="rounded bg-raised px-1.5">TMDB_READ_TOKEN</code> to <code className="rounded bg-raised px-1.5">.env.local</code> (or
          the hosting environment) to load the catalog from The Movie Database.
        </p>
      ) : (
        <p className="text-white/60">We couldn&apos;t load the catalog right now. Please try again in a few minutes.</p>
      )}
    </div>
  );
}
