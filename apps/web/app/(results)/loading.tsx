export default function ResultsLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="h-6 w-24 rounded bg-muted" />
              <div className="mt-4 h-32 rounded bg-muted" />
              <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
