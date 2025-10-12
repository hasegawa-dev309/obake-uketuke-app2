export default function StatCard({
  title, value, hint, className = ""
}: { title: string; value: string | number; hint?: string; className?: string; }) {
  return (
    <div className={`bg-white rounded-2xl shadow-[0_16px_40px_rgba(2,6,23,0.08)] p-4 ${className}`}>
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
