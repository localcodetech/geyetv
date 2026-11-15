import type { Metadata } from "next";
import { CatalogHome } from "@/components/media/CatalogHome";

export const metadata: Metadata = {
  title: "Series | G-Eye TV",
  description: "Discover trending TV series, African shows, K-drama, telenovelas and more, with episodes, trailers and where to watch.",
};

export default function SeriesHomePage() {
  return <CatalogHome type="tv" />;
}
