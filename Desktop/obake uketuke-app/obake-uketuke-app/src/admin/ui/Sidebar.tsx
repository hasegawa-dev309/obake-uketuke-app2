import { Menu, Users, ListChecks, Settings, LogOut, PieChart } from "lucide-react";

type Props = { onToggle?: () => void };

export default function Sidebar({ onToggle }: Props) {
  const Item = ({ icon: Icon, label, href }: { icon: any; label: string; href: string }) => (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-base hover:bg-slate-100 text-slate-700"
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </a>
  );

  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r bg-white/90 backdrop-blur flex-col">
      <div className="h-14 px-4 flex items-center justify-between border-b">
        <div className="font-semibold">👻 管理画面</div>
        <button className="md:hidden p-2" onClick={onToggle}><Menu className="h-5 w-5" /></button>
      </div>
      <div className="p-3 space-y-1">
        <Item icon={PieChart} label="ダッシュボード" href="/admin.html" />
        <Item icon={ListChecks} label="受付一覧" href="/admin.html#list" />
        <Item icon={Users} label="ユーザー" href="/admin.html#users" />
        <Item icon={Settings} label="設定" href="/admin.html#settings" />
      </div>
      <div className="mt-auto p-3">
        <a href="/reservation.html" className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-base bg-slate-900 text-white hover:opacity-90">
          <LogOut className="h-4 w-4" /> 受付へ戻る
        </a>
      </div>
    </aside>
  );
}
