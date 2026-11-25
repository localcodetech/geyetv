"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Clapperboard, House, MonitorPlay, Radio, Tv } from "lucide-react";

export const NAV = [
  { label: "Home", href: "/", Icon: House },
  { label: "Live TV", href: "/live", Icon: Tv },
  { label: "Movies", href: "/movies", Icon: Clapperboard },
  { label: "Series", href: "/series", Icon: MonitorPlay },
  { label: "Radio", href: "/radio", Icon: Radio },
  { label: "My List", href: "/my-list", Icon: Bookmark },
];

const isActive = (pathname: string | null, href: string) => (href === "/" ? pathname === "/" : !!pathname?.startsWith(href));

/** Desktop header links; the current section is underlined in red. `pathname` is null in the static fallback. */
export function DesktopNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="hidden h-full items-stretch gap-1 font-display text-[15px] font-semibold uppercase tracking-wide md:flex">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center px-3 transition-colors ${active ? "text-white" : "text-muted hover:text-white"}`}
          >
            {item.label}
            {active && <span className="absolute inset-x-3 bottom-0 h-[3px] bg-brand" />}
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar on phones */
export function MobileNav({ pathname }: { pathname: string | null }) {
  // Search lives in the header on phones
  const items = NAV.slice(0, 5);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-100 border-t border-line bg-black pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-2 font-display text-[11px] font-semibold uppercase tracking-wide ${active ? "text-white" : "text-faint"}`}>
              {active && <span className="absolute inset-x-3 top-0 h-[3px] bg-brand" />}
              <Icon className={`size-5 ${active ? "text-brand" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Reads the current path; must render inside <Suspense> (dynamic routes only know it at request time) */
export function ActiveDesktopNav() {
  return <DesktopNav pathname={usePathname()} />;
}

export function ActiveMobileNav() {
  return <MobileNav pathname={usePathname()} />;
}
