import { cacheLife } from "next/cache";

export async function SiteFooter() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="mt-8 bg-black p-5 text-center text-[13px] text-[#666]">
      <p>&copy; {new Date().getFullYear()} LocalCode Technology. All Rights Reserved.</p>
      {/* Required by the TMDB API terms of use */}
      <p className="mt-2 text-xs text-[#555]">
        Movie data and images from{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="underline hover:text-white">
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}
