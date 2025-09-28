import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  intent: "primary" | "success" | "warning";
}

export default function StatCard({ label, value, icon: Icon, intent }: StatCardProps) {
  const intentStyles = {
    primary: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      value: "text-blue-700",
    },
    success: {
      bg: "bg-green-50",
      icon: "text-green-600",
      value: "text-green-700",
    },
    warning: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      value: "text-amber-700",
    },
  };

  const styles = intentStyles[intent];

  return (
    <div className="rounded-2xl bg-white shadow-[0_10px_30px_rgba(2,6,23,.04)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className={`text-2xl font-bold ${styles.value}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${styles.bg}`}>
          <Icon className={`h-6 w-6 ${styles.icon}`} />
        </div>
      </div>
    </div>
  );
}
