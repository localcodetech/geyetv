# G EYE TV Landing Page

Live TV and radio for G-Eye TV, built with Next.js (App Router), Tailwind CSS, Motion and hls.js.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Channels

Live TV and radio channels are served by the backend (`src/lib/channels.ts`) and are also available as JSON at `GET /api/channels`.

- By default they come from `src/data/channels.json`. Each channel's `category` decides which row it appears in.
- To read them from the Supabase `content` table instead, copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. If Supabase is unreachable the site falls back to the JSON file.

Channel lists are cached for about a minute, so changes show up without a redeploy.

## Movies

`/movies` and `/movies/[id]` show movie information from [TMDB](https://www.themoviedb.org): trending, Nollywood and African cinema, search, trailers, cast and where to watch.

1. Create a free TMDB account and an API key at https://www.themoviedb.org/settings/api.
2. Put the **API Read Access Token** in `.env.local` as `TMDB_READ_TOKEN` (or the v3 key as `TMDB_API_KEY`).
3. Optionally set `TMDB_REGION` (default `GH`) for "Where to watch".

The key is only used on the server. TMDB provides metadata, not video: streaming and downloads will only be added for titles G-Eye TV holds the rights to.

## Project layout

```
src/app/page.tsx              Live TV page (server: loads channels)
src/app/api/channels/route.ts Channels JSON API
src/components/LiveTv.tsx     Hero player, now-playing bar, search, category chips, keyboard zapping
src/components/ChannelRow.tsx Horizontally scrolling category row
src/components/ChannelCard.tsx Channel / radio card
src/components/Player.tsx     HLS / radio player with loading, error and tap-to-play states
src/lib/channels.ts           Channel data source (Supabase or JSON seed)
src/app/movies/               Movies home and movie details pages
src/app/api/movies/search/    Movie search API (proxies TMDB)
src/components/movies/        Poster rows, search, trailer modal
src/lib/tmdb.ts               TMDB client (server only, cached)
src/lib/viewer-prefs.ts       Last channel watched, favorites, share links (?c=channel-id)
public/images/                Channel logos
```
