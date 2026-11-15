import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchView } from "@/components/media/SearchView";

export const metadata: Metadata = { title: "Search | G-Eye TV" };

export default function SearchPage() {
  // SearchView reads ?q= from the URL, which is only known in the browser for this static page
  return (
    <div className="mx-auto max-w-350 px-4 pb-12 pt-8">
      <Suspense>
        <SearchView />
      </Suspense>
    </div>
  );
}
