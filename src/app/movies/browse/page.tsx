import type { Metadata } from "next";
import { BrowsePage } from "@/components/media/BrowsePage";

export const metadata: Metadata = { title: "Browse movies | G-Eye TV" };

export default function BrowseMoviesPage(props: PageProps<"/movies/browse">) {
  return <BrowsePage type="movie" searchParams={props.searchParams} />;
}
