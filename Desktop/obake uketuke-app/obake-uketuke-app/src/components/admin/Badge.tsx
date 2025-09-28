interface BadgeProps {
  status: "queued" | "arrived" | "no-show";
}

export default function Badge({ status }: BadgeProps) {
  const statusConfig = {
    queued: {
      label: "未呼出",
      className: "bg-amber-100 text-amber-700",
    },
    arrived: {
      label: "来場済",
      className: "bg-green-100 text-green-700",
    },
    "no-show": {
      label: "未確認",
      className: "bg-slate-100 text-slate-700",
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
