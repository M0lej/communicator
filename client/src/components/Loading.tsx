export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center bg-slate-950/40 px-6 py-4 backdrop-blur-sm">
      <div aria-label="Ładowanie" className="loading-balls" role="status">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
    </div>
  );
}
