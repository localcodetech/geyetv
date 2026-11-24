import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ActiveMobileNav, MobileNav } from "@/components/NavLinks";
import { RadioProvider } from "@/components/radio/RadioProvider";
import { MiniPlayer } from "@/components/radio/MiniPlayer";
import { getChannels } from "@/lib/channels";
import "./globals.css";

export const metadata: Metadata = {
  title: "G-Eye TV: Live TV, Movies & Series",
  description: "Watch G-Eye TV channels live, listen to G-Eye radio, and discover movies and series.",
  icons: { icon: "/images/geyetv.png" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { radio } = await getChannels();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* The radio keeps playing across pages, with a mini player at the bottom */}
        <RadioProvider stations={radio}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Suspense>
            <MiniPlayer />
          </Suspense>
          <Suspense fallback={<MobileNav pathname={null} />}>
            <ActiveMobileNav />
          </Suspense>
        </RadioProvider>
      </body>
    </html>
  );
}
