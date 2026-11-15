"use client";

import { useState } from "react";

/** Biography that starts collapsed when long */
export function Biography({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 700;

  return (
    <div className="mt-6 max-w-3xl">
      <h2 className="mb-2 text-lg font-bold">Biography</h2>
      <p className={`whitespace-pre-line leading-relaxed text-white/75 ${long && !open ? "line-clamp-6" : ""}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-2 text-sm font-medium text-brand hover:underline">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
