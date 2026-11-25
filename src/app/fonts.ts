import localFont from "next/font/local";

// Bundled with the site (from @fontsource), so pages never depend on Google Fonts being reachable.

/** Body text */
export const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/barlow/files/barlow-latin-700-normal.woff2", weight: "700" },
  ],
});

/** Headings and labels, in the style of on-screen TV graphics */
export const barlowCondensed = localFont({
  variable: "--font-barlow-condensed",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2", weight: "700" },
    { path: "../../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2", weight: "800" },
  ],
});
