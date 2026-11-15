import type { Metadata } from "next";
import { CatalogHome } from "@/components/media/CatalogHome";

export const metadata: Metadata = {
  title: "Movies | G-Eye TV",
  description: "Discover trending movies, Nollywood and African cinema, trailers and where to watch.",
};

export default function MoviesPage() {
  return <CatalogHome type="movie" />;
}
