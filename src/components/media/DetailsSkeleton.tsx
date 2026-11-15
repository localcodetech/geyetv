/** Loading placeholder for movie, series and person pages */
export function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-350 animate-pulse px-4 pb-12 pt-16">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="mx-auto aspect-2/3 w-52 rounded-2xl bg-white/5 md:mx-0 md:w-72" />
        <div className="flex-1 space-y-4 md:pt-6">
          <div className="h-12 w-2/3 rounded-lg bg-white/5" />
          <div className="h-4 w-1/3 rounded bg-white/5" />
          <div className="h-24 w-full max-w-3xl rounded-lg bg-white/5" />
          <div className="h-11 w-48 rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}
