import { cacheLife } from "next/cache";

export async function SiteFooter() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="mt-8 bg-black p-5 text-center text-[13px] text-[#666]">
      &copy; {new Date().getFullYear()} LocalCode Technology. All Rights Reserved.
    </footer>
  );
}
