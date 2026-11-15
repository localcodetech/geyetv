"use client";

import { PosterCard, type PosterItem } from "@/components/media/PosterCard";
import { ScrollRow } from "@/components/media/ScrollRow";

/** Horizontally scrolling row of posters. `free` badges every poster as watchable on G-Eye TV. */
export function PosterRow({ id, title, href, items, free }: { id?: string; title: string; href?: string; items: PosterItem[]; free?: boolean }) {
  return (
    <ScrollRow id={id} title={title} href={href}>
      {items.map((item) => (
        <PosterCard key={`${item.type}-${item.id}`} item={item} free={free} />
      ))}
    </ScrollRow>
  );
}
