import React, { useEffect, useMemo, useRef, useState } from "react";
import { ticketsStore, Ticket } from "../store/tickets";
import Sidebar from "./ui/Sidebar";
import Topbar from "./ui/Topbar";
import StatCard from "./ui/StatCard";
import DesktopOnly from "./ui/DesktopOnly";

function useTicketsStable() {
  const [data, setData] = useState<Ticket[]>(() => ticketsStore.getAll?.() ?? []);
  const sigRef = useRef<string>("");

  useEffect(() => {
    const calcSig = (a: Ticket[]) => JSON.stringify(a.map(t => [t.id,t.status,t.people,t.ageGroup,t.createdAt]));
    sigRef.current = calcSig(data);

    const apply = () => {
      const next = ticketsStore.getAll?.() ?? [];
      const sig = calcSig(next);
      if (sig !== sigRef.current) {
        sigRef.current = sig;
        setData(next);
      }
    };
    const unsub = ticketsStore.onChange?.(apply);
    apply(); // 初回同期
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  return data;
}

function StatusBadge({s}:{s:Ticket["status"]}) {
  const map:any = { queued:"bg-amber-100 text-amber-700", arrived:"bg-emerald-100 text-emerald-700", "no-show":"bg-rose-100 text-rose-700" };
  const label:any = { queued:"待ち", arrived:"来場", "no-show":"未到着" };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[s]}`}>{label[s]}</span>;
}

export function AdminApp(){
  const all = useTicketsStable();

  // 集計
  const today = useMemo(()=> {
    const d = new Date(); const k = d.toISOString().slice(0,10);
    return all.filter(t => (t.createdAt || "").slice(0,10) === k);
  }, [all]);
  const stats = {
    total: today.length,
    arrived: today.filter(t=>t.status==="arrived").length,
    noshow: today.filter(t=>t.status==="no-show").length,
  };

  // フィルタ
  const [q,setQ] = useState(""); const [age,setAge]=useState(""); const [st,setSt]=useState("");
  const filtered = useMemo(()=>{
    return all.filter(t=>{
      const okQ = q ? (t.email.toLowerCase().includes(q.toLowerCase()) || String(t.people)===q) : true;
      const okA = age ? t.ageGroup===age : true;
      const okS = st ? t.status===st : true;
      return okQ && okA && okS;
    });
  },[all,q,age,st]);

  const setStatus = (id:string,s:Ticket["status"]) => ticketsStore.update?.(id,{status:s});

  return (
    <DesktopOnly>
      <div className="min-h-dvh flex" style={{ background:"linear-gradient(180deg,#fff7ed 0%,#fff1e6 100%)" }}>
        <Sidebar />
        <main className="flex-1">
          <Topbar onSearch={setQ} />

          {/* コンテンツ */}
          <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="今日の予約数" value={stats.total} hint="本日登録の件数" />
              <StatCard title="来場" value={stats.arrived} hint="チェックイン済み" />
              <StatCard title="未到着" value={stats.noshow} hint="未チェックイン" />
            </div>

            {/* フィルタバー */}
            <div className="bg-white rounded-base border p-3 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <div className="flex gap-2">
                <select className="h-9 px-2 rounded-base border" value={age} onChange={(e)=>setAge(e.target.value)}>
                  <option value="">年齢層: すべて</option>
                  <option value="高校生以下">高校生以下</option>
                  <option value="大学生">大学生</option>
                  <option value="一般">一般</option>
                </select>
                <select className="h-9 px-2 rounded-base border" value={st} onChange={(e)=>setSt(e.target.value)}>
                  <option value="">状態: すべて</option>
                  <option value="queued">待ち</option>
                  <option value="arrived">来場</option>
                  <option value="no-show">未到着</option>
                </select>
              </div>
              <div className="text-sm text-slate-500">{new Date().toLocaleDateString("ja-JP")}</div>
            </div>

            {/* 一覧テーブル */}
            <div id="list" className="overflow-x-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(2,6,23,0.08)]">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/90">
                  <tr className="text-left">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">メール</th>
                    <th className="px-4 py-3">人数</th>
                    <th className="px-4 py-3">年齢層</th>
                    <th className="px-4 py-3">登録</th>
                    <th className="px-4 py-3">状態</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t=>(
                    <tr key={t.id} className="border-t hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono text-xs">{t.id.slice(0,8)}…</td>
                      <td className="px-4 py-3">{t.email}</td>
                      <td className="px-4 py-3">{t.people}</td>
                      <td className="px-4 py-3">{t.ageGroup}</td>
                      <td className="px-4 py-3">
                        {new Date(t.createdAt).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}
                      </td>
                      <td className="px-4 py-3"><StatusBadge s={t.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="h-8 px-3 rounded-base bg-emerald-600 text-white hover:opacity-90" onClick={()=>setStatus(t.id,"arrived")}>来場</button>
                          <button className="h-8 px-3 rounded-base bg-amber-600 text-white hover:opacity-90" onClick={()=>setStatus(t.id,"queued")}>待ちへ</button>
                          <button className="h-8 px-3 rounded-base bg-rose-600 text-white hover:opacity-90" onClick={()=>setStatus(t.id,"no-show")}>未到着</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">データがありません</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </DesktopOnly>
  );
}
