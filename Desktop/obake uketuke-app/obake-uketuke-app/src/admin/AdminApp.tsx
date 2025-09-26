import { useSyncExternalStore } from "react";
import { ticketsStore, segment, Ticket } from "../store/tickets";
import "../index.css"; // 念のため（admin/main.tsx で読み込んでいれば重複OK）

function useTickets() {
  const subscribe = (cb:()=>void)=> ticketsStore.onChange(cb);
  const getSnap = ()=> ticketsStore.getAll();
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}

function Column({ title, items, onStatus }:{
  title: string;
  items: Ticket[];
  onStatus: (id:string, status: Ticket["status"])=>void;
}) {
  return (
    <section className="bg-white rounded-base shadow-card p-4 space-y-3">
      <h3 className="font-semibold">{title}</h3>
      {items.length === 0 && <p className="text-sm text-slate-500">なし</p>}
      <ul className="space-y-2">
        {items.map(t=>(
          <li key={t.id} className="rounded-base border border-surface-muted p-3 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium tabular-nums">ID: {t.id.slice(0,8)}…</div>
              <div className="text-slate-700">{t.email}</div>
              <div className="text-slate-600">{t.people}名 / {t.ageGroup}</div>
            </div>
            <div className="flex gap-2">
              <button className="h-8 px-3 rounded-base bg-brand text-white" onClick={()=>onStatus(t.id,"arrived")}>来場</button>
              <button className="h-8 px-3 rounded-base bg-surface-muted" onClick={()=>onStatus(t.id,"no-show")}>未到着</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AdminApp(){
  const all = useTickets();
  const { queued, arrived, noShow } = segment(all);
  const onStatus = (id:string, status: Ticket["status"])=> ticketsStore.update(id, { status });

  return (
    <div className="min-h-dvh bg-surface-bg text-surface-text">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">管理画面</h1>
          <a href="/reservation.html" className="text-sm text-brand">受付へ</a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 grid gap-4 md:grid-cols-3">
        <Column title="これから呼ぶ" items={queued} onStatus={onStatus} />
        <Column title="呼出済 - 来場" items={arrived} onStatus={onStatus} />
        <Column title="呼出済 - 未到着" items={noShow} onStatus={onStatus} />
      </main>
    </div>
  );
}
