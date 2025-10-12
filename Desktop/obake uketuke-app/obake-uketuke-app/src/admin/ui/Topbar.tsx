import { Bell, Search } from "lucide-react";
import { useState } from "react";

export default function Topbar({ onSearch }: { onSearch?: (q: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="h-14 border-b bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 h-full flex items-center justify-between gap-3">
        <div className="hidden md:block font-semibold text-slate-800">お化け屋敷 整理券システム</div>
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={val}
            onChange={(e)=>{ setVal(e.target.value); onSearch?.(e.target.value); }}
            className="w-full h-9 pl-9 pr-3 rounded-base border bg-white outline-none focus:ring-2 focus:ring-brand"
            placeholder="検索（メール / 人数）"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-slate-100"><Bell className="h-5 w-5 text-slate-600" /></button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-purple-500 text-white grid place-items-center text-xs font-semibold">AD</div>
      </div>
    </div>
  );
}
