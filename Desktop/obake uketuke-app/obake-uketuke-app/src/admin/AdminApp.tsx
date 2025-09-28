import { useMemo, useState } from "react";
import { useSyncExternalStore } from "react";
import { ticketsStore, Ticket } from "../store/tickets";
import "../index.css";

function useTickets(){
  const subscribe = (cb:()=>void)=> ticketsStore.onChange(cb);
  const get = ()=> ticketsStore.getAll();
  return useSyncExternalStore(subscribe, get, get);
}

function TopBar(){
  return (
    <div className="h-14 border-b bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 h-full flex items-center justify-between">
        <div className="font-semibold">👻 管理画面</div>
        <div className="text-sm text-slate-600">{new Date().toLocaleDateString("ja-JP")}</div>
      </div>
    </div>
  );
}

function SideNav(){
  const Item = ({label,href}:{label:string;href:string})=>(
    <a href={href} className="px-3 py-2 rounded-base hover:bg-slate-100">{label}</a>
  );
  return (
    <aside className="hidden md:block w-56 shrink-0 border-r bg-white/70">
      <div className="p-3 space-y-1">
        <Item label="ダッシュボード" href="/admin.html" />
        <Item label="受付一覧" href="/admin.html" />
        <Item label="呼出中" href="/admin.html" />
        <Item label="来場済" href="/admin.html" />
        <Item label="未到着" href="/admin.html" />
        <Item label="設定" href="/admin.html" />
      </div>
    </aside>
  );
}

function Badge({status}:{status:Ticket["status"]}){
  const map:any = {
    queued: "bg-amber-100 text-amber-700",
    arrived:"bg-emerald-100 text-emerald-700",
    "no-show":"bg-rose-100 text-rose-700",
  };
  const label:any = { queued:"待ち", arrived:"来場", "no-show":"未到着" };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[status]}`}>{label[status]}</span>;
}

export function AdminApp(){
  const all = useTickets();

  // UI state
  const [q, setQ] = useState("");
  const [age, setAge] = useState<string>("");
  const [st, setSt]  = useState<string>("");

  // filter
  const filtered = useMemo(()=>{
    return all.filter(t=>{
      const okQ = q ? (t.email.toLowerCase().includes(q.toLowerCase()) || String(t.people)===q) : true;
      const okA = age ? t.ageGroup===age : true;
      const okS = st ? t.status===st : true;
      return okQ && okA && okS;
    });
  },[all,q,age,st]);

  const onStatus = (id:string, s:Ticket["status"])=> ticketsStore.update(id,{status:s});

  return (
    <div className="min-h-dvh flex" style={{ background: "linear-gradient(180deg,#fff7ed 0%,#fff1e6 100%)" }}>
      <SideNav />
      <div className="flex-1">
        <TopBar />

        <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
          {/* ツールバー（スマレジ風） */}
          <div className="bg-white rounded-base border p-3 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
            <div className="flex gap-2">
              <select className="h-9 px-2 rounded-base border" value={age} onChange={e=>setAge(e.target.value)}>
                <option value="">年齢層: すべて</option>
                <option value="高校生以下">高校生以下</option>
                <option value="大学生">大学生</option>
                <option value="一般">一般</option>
              </select>
              <select className="h-9 px-2 rounded-base border" value={st} onChange={e=>setSt(e.target.value)}>
                <option value="">状態: すべて</option>
                <option value="queued">待ち</option>
                <option value="arrived">来場</option>
                <option value="no-show">未到着</option>
              </select>
            </div>
            <input
              className="h-9 px-3 rounded-base border w-full md:w-72"
              placeholder="検索（メール / 人数）"
              value={q} onChange={e=>setQ(e.target.value)}
            />
          </div>

          {/* テーブル（スマレジ風） */}
          <div className="overflow-x-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(2,6,23,0.08)]">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
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
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-3 font-mono text-xs">{t.id.slice(0,8)}…</td>
                    <td className="px-4 py-3">{t.email}</td>
                    <td className="px-4 py-3">{t.people}</td>
                    <td className="px-4 py-3">{t.ageGroup}</td>
                    <td className="px-4 py-3">
                      {new Date(t.createdAt).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}
                    </td>
                    <td className="px-4 py-3"><Badge status={t.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="h-8 px-3 rounded-base bg-emerald-600 text-white" onClick={()=>onStatus(t.id,"arrived")}>来場</button>
                        <button className="h-8 px-3 rounded-base bg-amber-600 text-white" onClick={()=>onStatus(t.id,"queued")}>待ちへ</button>
                        <button className="h-8 px-3 rounded-base bg-rose-600 text-white" onClick={()=>onStatus(t.id,"no-show")}>未到着</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 受付へ戻る */}
          <div className="text-right">
            <a href="/reservation.html" className="inline-flex items-center h-9 px-3 rounded-base bg-slate-900 text-white hover:opacity-90">
              受付へ戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
