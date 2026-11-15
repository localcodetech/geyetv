import Link from "next/link";
import type { Genre, MediaType } from "@/lib/tmdb";

/** Genre shortcuts into the browse page */
export function GenreChips({ type, genres, activeId }: { type: MediaType; genres: Genre[]; activeId?: number }) {
  const base = type === "tv" ? "/series/browse" : "/movies/browse";
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {genres.map((g) => (
        <Link
          key={g.id}
          href={`${base}?genre=${g.id}`}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors ${
            g.id === activeId ? "bg-brand text-white ring-brand" : "text-white/70 ring-white/15 hover:bg-white/10 hover:text-white"
          }`}
        >
          {g.name}
        </Link>
      ))}
    </div>
  );
}
