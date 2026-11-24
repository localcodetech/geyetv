import type { Metadata } from "next";
import { RadioPlayer } from "@/components/radio/RadioPlayer";
import { StationGrid } from "@/components/radio/StationGrid";

export const metadata: Metadata = {
  title: "Radio | G-Eye TV",
  description: "Listen live to G-Eye radio stations: what's playing now, and keep listening while you browse.",
};

export default function RadioPage() {
  return (
    <div className="mx-auto max-w-350 space-y-10 px-4 pb-12 pt-6">
      <RadioPlayer />
      <StationGrid />
    </div>
  );
}
