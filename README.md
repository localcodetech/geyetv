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

- By default they come from `src/data/channels.json`.
- To read them from the Supabase `content` table instead, copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. If Supabase is unreachable the site falls back to the JSON file.

Channel lists are cached for about a minute, so changes show up without a redeploy.

## Project layout

```
src/app/page.tsx              Live TV page (server: loads channels)
src/app/api/channels/route.ts Channels JSON API
src/components/LiveTv.tsx     Tabs, search, channel grid, keyboard navigation
src/components/Player.tsx     HLS / radio player with loading, error and tap-to-play states
src/lib/channels.ts           Channel data source (Supabase or JSON seed)
public/images/                Channel logos
```
