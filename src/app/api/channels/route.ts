import { getChannels } from "@/lib/channels";

// Public channel list, for future mobile / TV apps
export async function GET() {
  return Response.json(await getChannels());
}
