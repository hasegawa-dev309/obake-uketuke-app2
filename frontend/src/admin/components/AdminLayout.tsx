import { NavLink, Outlet } from "react-router-dom";
import { Ghost, Ticket, UserList, PlusCircle, Gear, Hash } from "phosphor-react";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "../../lib/api";

export default function AdminLayout() {
  const [currentTicket, setCurrentTicket] = useState<number>(1);

  useEffect(() => {
    // APIから現在の呼び出し番号を取得（認証付き）
    const updateCurrentTicket = async () => {
      try {
        const response = await authenticatedFetch('/reservations/current-number');
        
        if (response.ok) {
          const data = await response.json();
          setCurrentTicket(data.currentNumber || 1);
        }
      } catch (err) {
        console.error("現在の番号取得エラー:", err);
      }
    };
    
    updateCurrentTicket();
    // 定期的に更新（3秒ごと）
    const interval = setInterval(updateCurrentTicket, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Ghost size={20} weight="fill" />
            </div>
            <div>
              <div className="font-bold text-lg">お化け屋敷</div>
              <div className="text-xs text-slate-500">整理券システム</div>
            </div>
          </div>
          
          {/* 現在の整理券番号 */}
          <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
            <div className="flex items-center gap-2 mb-1">
              <Hash size={16} weight="bold" className="text-violet-600" />
              <div className="text-xs font-medium text-violet-600">現在の整理券</div>
            </div>
            <div className="text-2xl font-bold text-violet-700">{currentTicket}</div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavLink 
            to="/"
            end
            className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive ? "bg-violet-100 text-violet-700" : "hover:bg-gray-100"
            }`}
          >
            <Ticket size={20} weight="bold" />
            <span>整理券管理</span>
          </NavLink>
          
          <NavLink 
            to="/call"
            className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive ? "bg-violet-100 text-violet-700" : "hover:bg-gray-100"
            }`}
          >
            <UserList size={20} weight="bold" />
            <span>呼び出し管理</span>
          </NavLink>
          
          <NavLink 
            to="/issue"
            className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive ? "bg-violet-100 text-violet-700" : "hover:bg-gray-100"
            }`}
          >
            <PlusCircle size={20} weight="bold" />
            <span>整理券発行</span>
          </NavLink>
          
          <NavLink 
            to="/settings"
            className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive ? "bg-violet-100 text-violet-700" : "hover:bg-gray-100"
            }`}
          >
            <Gear size={20} weight="bold" />
            <span>設定</span>
          </NavLink>
        </nav>
      </aside>
      
      <main className="flex-1 p-6">
        <Outlet/>
      </main>
    </div>
  );
}