import { useEffect, useMemo, useState } from "react";
import { ArrowDownTrayIcon, FunnelIcon, MagnifyingGlassIcon, PencilIcon, CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

export type Ticket = {
  id: number;
  email: string;
  headcount: number;
  ageGroup: string;
  status: "未呼出" | "来場済" | "未確認";
  memo?: string | null;
  createdAt?: string;
};

type Props = {
  fetchTickets: () => Promise<Ticket[]>;
  onUpdateStatus: (id: number, next: Ticket["status"]) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export default function TicketsTable({ fetchTickets, onUpdateStatus, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | Ticket["status"]>("");
  const [rows, setRows] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTickets();
        setRows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchTickets]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const hit =
        r.email.toLowerCase().includes(query.toLowerCase()) ||
        String(r.id).includes(query) ||
        r.ageGroup.includes(query);
      const statusOK = status ? r.status === status : true;
      return hit && statusOK;
    });
  }, [rows, query, status]);

  const exportCSV = () => {
    const header = ["整理券番号","メール","人数","年齢層","来場状況","メモ"];
    const data = filtered.map(r => [r.id, r.email, r.headcount, r.ageGroup, r.status, r.memo ?? ""]);
    const csv = [header, ...data].map(a => a.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tickets_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
      {/* toolbar */}
      <div className="p-3 gap-2 flex flex-col sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 text-slate-400 w-[18px] h-[18px]"/>
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="整理券番号、メール、年齢層で検索…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="">全ステータス</option>
            <option>未呼出</option>
            <option>来場済</option>
            <option>未確認</option>
          </select>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm">
            <ArrowDownTrayIcon className="w-4 h-4"/> エクスポート
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="text-left px-4 py-2">整理券番号</th>
              <th className="text-left px-4 py-2">メールアドレス</th>
              <th className="px-4 py-2">人数</th>
              <th className="px-4 py-2">年齢層</th>
              <th className="px-4 py-2">来場状況</th>
              <th className="px-4 py-2">メモ</th>
              <th className="px-4 py-2 w-[120px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">読み込み中…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">該当データがありません</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{r.id}</td>
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2 text-center">{r.headcount}</td>
                <td className="px-4 py-2 text-center">{r.ageGroup}</td>
                <td className="px-4 py-2 text-center">
                  <span className={
                    "px-2 py-1 text-xs rounded-lg " +
                    (r.status === "来場済" ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                     : r.status === "未確認" ? "bg-amber-50 text-amber-700 border border-amber-100"
                     : "bg-slate-50 text-slate-700 border border-slate-100")
                  }>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">{r.memo ?? "-"}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="p-1.5 rounded-lg border hover:bg-slate-50"
                      title="来場済にする"
                      onClick={() => onUpdateStatus(r.id, r.status === "来場済" ? "未呼出" : "来場済")}
                    >
                      <CheckCircleIcon className="w-4 h-4"/>
                    </button>
                    <button className="p-1.5 rounded-lg border hover:bg-slate-50" title="編集">
                      <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button
                      className="p-1.5 rounded-lg border hover:bg-red-50 text-red-600"
                      title="削除"
                      onClick={() => onDelete(r.id)}
                    >
                      <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
