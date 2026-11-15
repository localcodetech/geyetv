import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-[#333] bg-[rgba(20,20,20,0.95)] px-5 py-2.5 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5 font-semibold text-white transition-colors hover:text-brand">
        {/* object-cover crops the empty space around the square logo */}
        <Image src="/images/geyetv.png" alt="G-Eye TV" width={96} height={36} className="h-9 w-24 object-cover" priority />
        <span>G-Eye TV</span>
      </Link>
      <span className="inline-flex items-center gap-1.5 rounded bg-brand px-2.5 py-1 text-xs font-bold tracking-widest">
        <span className="size-2 animate-pulse rounded-full bg-white" />
        LIVE
      </span>
    </nav>
  );
}
