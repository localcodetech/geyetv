import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { tmdbImage } from "@/lib/media";
import type { CastMember } from "@/lib/tmdb";
import { ScrollRow } from "@/components/media/ScrollRow";

export function CastRow({ cast }: { cast: CastMember[] }) {
  return (
    <ScrollRow title="Cast" itemClassName="w-28 sm:w-32">
      {cast.map((c) => (
        <Link key={c.id} href={`/person/${c.id}`} className="group block text-center">
          <div className="relative mx-auto mb-2 size-24 overflow-hidden rounded-full bg-panel ring-1 ring-line transition group-hover:ring-2 group-hover:ring-brand sm:size-28">
            {c.profilePath ? (
              <Image src={tmdbImage(c.profilePath, "w185")!} alt={c.name} fill unoptimized className="object-cover" />
            ) : (
              <UserRound className="absolute inset-0 m-auto size-10 text-white/20" />
            )}
          </div>
          <p className="truncate text-sm font-medium group-hover:text-brand">{c.name}</p>
          <p className="truncate text-xs text-white/50">{c.character}</p>
          {c.episodes ? <p className="text-[11px] text-white/35">{c.episodes} episodes</p> : null}
        </Link>
      ))}
    </ScrollRow>
  );
}
