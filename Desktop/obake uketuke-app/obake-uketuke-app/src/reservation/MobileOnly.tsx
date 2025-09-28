import { useEffect, useState } from "react";

export default function MobileOnly({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth < 768 : true);
  useEffect(() => {
    const onR = () => setOk(window.innerWidth < 768);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  if (ok) return <>{children}</>;
  return (
    <div className="min-h-dvh grid place-items-center bg-white text-slate-700">
      <div className="p-6 rounded-2xl border shadow-[0_16px_40px_rgba(2,6,23,.08)] max-w-sm text-center space-y-3">
        <div className="text-2xl">📱 スマホ専用ページです</div>
        <p className="text-sm text-slate-500">
          予約フォームはスマートフォン幅（768px未満）でご利用ください。
        </p>
        <a href="/admin.html" className="inline-flex h-10 items-center justify-center rounded-base bg-slate-900 px-4 text-white hover:opacity-90">
          管理画面へ移動
        </a>
      </div>
    </div>
  );
}
