export default function ReservationHeader() {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur border-b">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 grid place-items-center rounded-full bg-violet-50 text-violet-600">
            <span className="text-lg">👻</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">お化け屋敷 整理券</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="/reservation.html"
            className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            予約フォーム
          </a>
          <a
            href="/admin.html"
            className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            現在状況
          </a>
        </div>
      </div>
    </header>
  );
}
