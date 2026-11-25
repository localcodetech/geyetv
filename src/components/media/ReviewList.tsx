"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/tmdb";

const PREVIEW_CHARS = 380;

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <section>
      <h2 className="mb-4 heading text-xl sm:text-2xl">
        Reviews <span className="ml-1 text-sm font-normal text-white/40">{reviews.length}</span>
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.content.length > PREVIEW_CHARS;
  const text = expanded || !long ? review.content : review.content.slice(0, PREVIEW_CHARS).trimEnd() + "…";

  return (
    <motion.article layout className="rounded-md bg-panel p-5 ring-1 ring-line">
      <header className="mb-3 flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/20 font-bold text-brand">{review.author.charAt(0).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{review.author}</p>
          <p className="text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        {review.rating !== null && (
          <span className="inline-flex items-center gap-1 rounded-md bg-raised px-2 py-1 text-sm font-semibold">
            <Star className="size-3.5 fill-current text-muted" />
            {review.rating}/10
          </span>
        )}
      </header>
      <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">{text}</p>
      {long && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-2 text-sm font-medium text-brand hover:underline">
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </motion.article>
  );
}
