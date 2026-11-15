import type { Metadata } from "next";
import { BrowsePage } from "@/components/media/BrowsePage";

export const metadata: Metadata = { title: "Browse series | G-Eye TV" };

export default function BrowseSeriesPage(props: PageProps<"/series/browse">) {
  return <BrowsePage type="tv" searchParams={props.searchParams} />;
}
