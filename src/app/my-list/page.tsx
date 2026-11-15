import type { Metadata } from "next";
import { MyListView } from "@/components/media/MyListView";

export const metadata: Metadata = { title: "My List | G-Eye TV" };

export default function MyListPage() {
  return (
    <div className="mx-auto max-w-350 px-4 pb-12 pt-8">
      <MyListView />
    </div>
  );
}
