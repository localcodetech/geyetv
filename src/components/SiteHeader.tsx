import Image from "next/image";
import Link from "next/link";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Live TV", href: "/#channels" },
  { label: "Movies", href: "/movies" },
  { label: "Radio", href: "/#radio" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-100 h-[57px] border-b border-white/10 bg-[rgba(12,12,14,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold text-white">
          {/* object-cover crops the empty space around the square logo */}
          <Image src="/images/geyetv.png" alt="G-Eye TV" width={96} height={36} className="h-9 w-24 object-cover" priority />
        </Link>

        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} className="rounded-full px-3 py-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <span className="ml-auto inline-flex items-center gap-1.5 rounded bg-brand px-2.5 py-1 text-xs font-bold tracking-widest">
          <span className="size-2 animate-pulse rounded-full bg-white" />
          LIVE
        </span>
      </div>
    </header>
  );
}
