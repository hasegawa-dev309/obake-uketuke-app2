import { TicketIcon, MegaphoneIcon, PlusCircleIcon, DocumentTextIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/admin/tickets",  icon: TicketIcon,    label: "整理券管理" },
  { to: "/admin/call",     icon: MegaphoneIcon, label: "呼び出し管理" },
  { to: "/admin/issue",    icon: PlusCircleIcon,label: "整理券発行" },
  { to: "/reservation",    icon: DocumentTextIcon, label: "一般予約フォーム" },
  { to: "/admin/settings", icon: Cog6ToothIcon,  label: "設定" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <div className="px-4 py-5 font-semibold">🧟‍♀️ お化け屋敷<br/><span className="text-xs text-slate-500">管理システム</span></div>
      <nav className="px-2 space-y-1">
        {items.map(({to, icon:Icon, label}) => (
          <NavLink
            key={to}
            to={to}
            className={({isActive}) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
               ${isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`
            }
          >
            <Icon className="w-[18px] h-[18px]" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 text-xs text-slate-400">v1.0</div>
    </aside>
  );
}