import { Ticket, Users, Plus, Settings, ExternalLink } from "lucide-react";

interface SidebarProps {
  activeMenu?: string;
}

export default function Sidebar({ activeMenu = "tickets" }: SidebarProps) {
  const menuItems = [
    { id: "tickets", label: "整理券管理", icon: Ticket },
    { id: "calls", label: "呼び出し管理", icon: Users },
    { id: "issue", label: "整理券発行", icon: Plus },
    { id: "settings", label: "設定", icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-[240px] bg-white border-r border-slate-200 z-30 overflow-y-auto">
      {/* ロゴ */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 grid place-items-center rounded-full bg-violet-50 text-violet-600">
            <span className="text-lg">👻</span>
          </div>
          <span className="font-semibold text-slate-800">管理画面</span>
        </div>
      </div>

      {/* メニュー */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* 外部リンク */}
      <div className="absolute bottom-4 left-4 right-4">
        <a
          href="/reservation.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          <span className="text-sm font-medium">一般予約フォーム</span>
        </a>
      </div>
    </div>
  );
}
