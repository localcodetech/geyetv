import { LiveTv } from "@/components/LiveTv";
import { getChannels } from "@/lib/channels";

export default async function Home() {
  const lists = await getChannels();
  return <LiveTv lists={lists} />;
}
