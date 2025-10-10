import { ReactNode, useState } from "react";
import { TicketIcon, MegaphoneIcon, PlusCircleIcon, Cog6ToothIcon, DocumentTextIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { Link, NavLink } from "react-router-dom";

const nav = [
  { to: "/admin/tickets", label: "整理券管理", icon: TicketIcon },
  { to: "/admin/call", label: "呼び出し管理", icon: MegaphoneIcon },
  { to: "/admin/issue", label: "整理券発行", icon: PlusCircleIcon },
  { to: "/reservation", label: "一般予約フォーム", icon: DocumentTextIcon },
  { to: "/admin/settings", label: "設定", icon: Cog6ToothIcon }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
            {open ? <XMarkIcon className="w-5 h-5"/> : <Bars3Icon className="w-5 h-5"/>}
          </button>
          <Link to="/admin/tickets" className="font-semibold">お化け屋敷 管理システム</Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">管理者</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center">A</div>
            <button className="p-2 rounded-lg hover:bg-slate-100" title="ログアウト">
              <ArrowRightOnRectangleIcon className="w-[18px] h-[18px]"/>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex px-4">
        {/* Sidebar */}
        <aside className={`shrink-0 transition-all duration-200 md:w-64 ${open ? "w-64" : "w-0 md:w-64"} overflow-hidden`}>
          <nav className="sticky top-[56px] md:top-[57px] py-4 pr-4">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-2">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm " +
                    (isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "text-slate-700 hover:bg-slate-50")
                  }
                >
                  <Icon className="w-[18px] h-[18px]"/>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="w-full py-6">{children}</main>
      </div>
    </div>
  );
}
