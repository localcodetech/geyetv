"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
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

/** Desktop header links with a sliding active pill. `pathname` is null in the static fallback. */
export function DesktopNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative rounded-full px-3.5 py-1.5 transition-colors ${active ? "text-white" : "text-white/65 hover:text-white"}`}
          >
            {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/10" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
            <span className="relative">{item.label}</span>
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
    <nav className="fixed inset-x-0 bottom-0 z-100 border-t border-white/10 bg-[rgba(12,12,14,0.92)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${active ? "text-white" : "text-white/50"}`}>
              {active && <motion.span layoutId="mobile-nav-dot" className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />}
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
