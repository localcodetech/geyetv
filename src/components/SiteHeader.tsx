import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { ActiveDesktopNav, DesktopNav } from "@/components/NavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-100 h-[57px] border-b border-line bg-black">
      <div className="mx-auto flex h-full max-w-350 items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold text-white">
          {/* object-cover crops the empty space around the square logo */}
          <Image src="/images/geyetv.png" alt="G-Eye TV" width={96} height={36} className="h-9 w-24 object-cover" priority />
        </Link>

        <Suspense fallback={<DesktopNav pathname={null} />}>
          <ActiveDesktopNav />
        </Suspense>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" aria-label="Search" className="grid size-9 place-items-center rounded-full text-white/75 transition-colors hover:bg-raised hover:text-white">
            <Search className="size-[18px]" />
          </Link>
          <Link href="/my-list" aria-label="My List" className="grid size-9 place-items-center rounded-full text-white/75 transition-colors hover:bg-raised hover:text-white md:hidden">
            <Bookmark className="size-[18px]" />
          </Link>
          <Link href="/live" className="tag ml-2 py-1 text-sm hover:bg-brand-dark">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            Live
          </Link>
        </div>
      </div>
    </header>
  );
}
