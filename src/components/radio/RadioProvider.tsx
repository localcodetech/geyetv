"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Channel } from "@/lib/channels";
import { stationCode, type NowPlaying } from "@/lib/radio";

// One radio player for the whole site: it lives in the root layout, so music keeps playing
// while people browse movies and series. Station names and artwork come from Supabase (the channels list).

export type RadioStatus = "idle" | "loading" | "playing" | "paused" | "blocked" | "error";

type RadioContext = {
  stations: Channel[];
  station: Channel | null;
  status: RadioStatus;
  volume: number;
  muted: boolean;
  /** Now-playing info per AzuraCast station code */
  nowPlaying: Record<string, NowPlaying>;
  /** Live frequency data for the visualiser, or null when the stream doesn't allow it */
  analyser: AnalyserNode | null;
  play: (station: Channel) => void;
  toggle: () => void;
  stop: () => void;
  step: (dir: 1 | -1) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  /** Ask for now-playing updates even when nothing is playing (e.g. on the station list) */
  watchNowPlaying: () => () => void;
};

const Ctx = createContext<RadioContext | null>(null);

export const useRadio = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRadio must be used inside <RadioProvider>");
  return ctx;
};

const VOLUME_KEY = "geye:radioVolume";

function readSavedVolume() {
  try {
    const v = Number(localStorage.getItem(VOLUME_KEY) ?? "NaN");
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
const POLL_MS = 15000;

export function RadioProvider({ stations, children }: { stations: Channel[]; children: React.ReactNode }) {
  const [station, setStation] = useState<Channel | null>(null);
  const [status, setStatus] = useState<RadioStatus>("idle");
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<Record<string, NowPlaying>>({});
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [watchers, setWatchers] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const graphRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode } | null>(null);
  // Set when a stream refused CORS: the visualiser is skipped so audio still plays
  const noCorsRef = useRef(false);

  /** The <audio> element, created on first use (and recreated without CORS if a stream refuses it) */
  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = "none";
    if (!noCorsRef.current) audio.crossOrigin = "anonymous";
    audio.addEventListener("playing", () => setStatus("playing"));
    audio.addEventListener("waiting", () => setStatus("loading"));
    audio.addEventListener("pause", () => setStatus((s) => (s === "playing" || s === "loading" ? "paused" : s)));
    audioRef.current = audio;
    return audio;
  }, []);

  /** Connects the audio element to an analyser for the visualiser (needs a user gesture and CORS) */
  const connectVisualiser = useCallback((audio: HTMLAudioElement) => {
    if (noCorsRef.current || graphRef.current || typeof AudioContext === "undefined") {
      graphRef.current?.ctx.resume();
      return;
    }
    try {
      const ctx = new AudioContext();
      const node = ctx.createAnalyser();
      node.fftSize = 128;
      node.smoothingTimeConstant = 0.8;
      ctx.createMediaElementSource(audio).connect(node);
      node.connect(ctx.destination);
      graphRef.current = { ctx, analyser: node };
      setAnalyser(node);
    } catch {
      // Older browsers: play without the visualiser
    }
  }, []);

  const start = useCallback(
    (s: Channel) => {
      // First play of the visit: restore the volume saved last time
      let level = volume;
      if (!audioRef.current) {
        const saved = readSavedVolume();
        if (saved !== null) setVolumeState((level = saved));
      }
      let audio = getAudio();
      audio.src = s.streamUrl;
      audio.volume = level;
      audio.muted = muted;
      setStation(s);
      setStatus("loading");
      connectVisualiser(audio);

      const attempt = () =>
        audio.play().catch((err: DOMException) => {
          if (err.name === "NotAllowedError") setStatus("blocked"); // autoplay without a tap
          else if (err.name !== "AbortError") setStatus("error");
        });

      audio.onerror = () => {
        // A stream without CORS headers fails with crossOrigin set: retry on a plain element, without the visualiser
        if (!noCorsRef.current && audio.crossOrigin) {
          noCorsRef.current = true;
          audio.pause();
          audioRef.current = null;
          graphRef.current?.ctx.close();
          graphRef.current = null;
          setAnalyser(null);
          audio = getAudio();
          audio.src = s.streamUrl;
          audio.volume = level;
          audio.muted = muted;
          audio.onerror = () => setStatus("error");
          audio.play().catch(() => setStatus("error"));
          return;
        }
        setStatus("error");
      };
      attempt();
    },
    [getAudio, connectVisualiser, volume, muted],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setStation(null);
    setStatus("idle");
  }, []);

  const toggle = useCallback(() => {
    if (!station) return;
    // Live radio: resume at the live edge rather than where it was paused
    if (status === "playing" || status === "loading") audioRef.current?.pause();
    else start(station);
  }, [station, status, start]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!stations.length) return;
      const i = stations.findIndex((s) => s.id === station?.id);
      start(stations[(i + dir + stations.length) % stations.length]);
    },
    [stations, station, start],
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    setMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = clamped === 0;
    }
    try { localStorage.setItem(VOLUME_KEY, String(clamped)); } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  }, []);

  const watchNowPlaying = useCallback(() => {
    setWatchers((n) => n + 1);
    return () => setWatchers((n) => n - 1);
  }, []);

  // Poll now-playing while a station is on or a station list is visible
  const polling = Boolean(station) || watchers > 0;
  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/radio/nowplaying");
        if (res.ok && !cancelled) setNowPlaying(await res.json());
      } catch {}
    };
    load();
    const timer = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [polling]);

  // Lock screen / headphone controls and notification artwork (station logo from Supabase)
  const code = station ? stationCode(station.streamUrl) : null;
  const song = code ? nowPlaying[code]?.song : undefined;
  useEffect(() => {
    if (!("mediaSession" in navigator) || !station) return;
    const artwork = station.logoUrl ? [{ src: new URL(station.logoUrl, location.href).href, sizes: "512x512" }] : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song?.title || station.title,
      artist: song?.artist ? `${song.artist} · ${station.title}` : station.title,
      album: "G-Eye Radio",
      artwork,
    });
    navigator.mediaSession.setActionHandler("play", () => start(station));
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
  }, [station, song?.title, song?.artist, start, step]);

  // Stop audio when the page goes away
  useEffect(() => () => audioRef.current?.pause(), []);

  const value = useMemo<RadioContext>(
    () => ({ stations, station, status, volume, muted, nowPlaying, analyser, play: start, toggle, stop, step, setVolume, toggleMute, watchNowPlaying }),
    [stations, station, status, volume, muted, nowPlaying, analyser, start, toggle, stop, step, setVolume, toggleMute, watchNowPlaying],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
