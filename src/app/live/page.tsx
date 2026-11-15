import type { Metadata } from "next";
import { LiveTv } from "@/components/LiveTv";
import { getChannels } from "@/lib/channels";

export const metadata: Metadata = {
  title: "Live TV & Radio | G-Eye TV",
  description: "Watch G-Eye TV channels live and listen to G-Eye radio stations.",
};

export default async function LivePage() {
  const lists = await getChannels();
  return <LiveTv lists={lists} />;
}
