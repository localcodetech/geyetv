"use client";

import { useEffect, useRef } from "react";

/**
 * Frequency bars drawn from the live stream. Without an analyser (stream refused CORS, or old browser)
 * it falls back to gently animated bars so the player still feels alive.
 */
export function Visualizer({ analyser, active, className = "" }: { analyser: AnalyserNode | null; active: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    const BARS = 40;
    const data = new Uint8Array(analyser?.frequencyBinCount ?? 0);
    const levels = new Float32Array(BARS);
    let frame = 0;

    const draw = (t: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      g.clearRect(0, 0, w, h);

      if (analyser && active) analyser.getByteFrequencyData(data);
      const gap = 3 * dpr;
      const barW = (w - gap * (BARS - 1)) / BARS;
      const gradient = g.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, "#e50914");
      gradient.addColorStop(1, "#ff8a8f");
      g.fillStyle = gradient;

      for (let i = 0; i < BARS; i++) {
        let target = 0.04;
        if (active) {
          // Skip the top of the spectrum, where there's little energy in music
          target = analyser ? (data[Math.floor((i / BARS) * data.length * 0.7)] ?? 0) / 255 : 0.25 + 0.2 * Math.sin(t / 380 + i * 0.6) * Math.sin(t / 910 + i);
        }
        levels[i] += (Math.max(0.04, target) - levels[i]) * 0.25;
        const barH = Math.max(2 * dpr, levels[i] * h);
        g.beginPath();
        g.roundRect(i * (barW + gap), h - barH, barW, barH, Math.min(barW / 2, 3 * dpr));
        g.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [analyser, active]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
