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
    <div className="w-[240px] bg-slate-800 text-white flex flex-col h-screen">
      {/* ロゴ */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 grid place-items-center rounded-full bg-violet-500 text-white">
            <span className="text-lg">👻</span>
          </div>
          <span className="font-semibold text-white">管理画面</span>
        </div>
      </div>

      {/* メニュー */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-slate-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* 外部リンク */}
      <div className="p-4 border-t border-slate-700">
        <a
          href="/reservation.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          <span className="text-sm font-medium">一般予約フォーム</span>
        </a>
      </div>
    </div>
  );
}
