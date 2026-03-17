export default function PickCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-28 rounded bg-border/50 animate-shimmer" />
        <div className="h-3 w-16 rounded bg-border/50 animate-shimmer" />
      </div>
      {/* Teams */}
      <div className="h-5 w-48 rounded bg-border/50 animate-shimmer" />
      {/* Prediction */}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-6 w-32 rounded-lg bg-border/50 animate-shimmer" />
        <div className="h-4 w-20 rounded bg-border/50 animate-shimmer" />
      </div>
      {/* Reasoning */}
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-border/50 animate-shimmer" />
        <div className="h-3 w-3/4 rounded bg-border/50 animate-shimmer" />
      </div>
      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="h-7 w-16 rounded bg-border/50 animate-shimmer" />
        <div className="h-8 w-24 rounded-lg bg-border/50 animate-shimmer" />
      </div>
    </div>
  )
}
