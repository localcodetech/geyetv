import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Radio logos and Supabase `logo_url`s are hosted on Imgur, movie artwork on TMDB
    remotePatterns: [new URL("https://i.imgur.com/**"), new URL("https://image.tmdb.org/t/p/**")],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
