export default function DashboardLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="animate-pulse space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-10 w-32 rounded bg-muted" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-2 h-8 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>

        <div className="rounded-lg border p-6">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="mt-4 h-64 rounded bg-muted" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="h-6 w-32 rounded bg-muted" />
              <div className="mt-4 space-y-2">
                <div className="h-12 rounded bg-muted" />
                <div className="h-12 rounded bg-muted" />
                <div className="h-12 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
