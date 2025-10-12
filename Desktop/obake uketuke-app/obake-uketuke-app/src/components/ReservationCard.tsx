interface ReservationCardProps {
  children: React.ReactNode;
  title: string;
}

export default function ReservationCard({ children, title }: ReservationCardProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ja-JP");
  const timeStr = now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto my-12 md:my-16 w-[92%] max-w-[480px] md:max-w-[520px] rounded-2xl bg-white shadow-[0_20px_50px_rgba(2,6,23,.08)]">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="h-8 w-8 grid place-items-center rounded-full bg-violet-50 text-violet-600">
          <span className="text-lg">👻</span>
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">{title}</h1>
        </div>
        <div className="text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <span>🗓️</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🕒</span>
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      {/* 本文 */}
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}
