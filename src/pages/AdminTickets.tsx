import { useEffect, useMemo, useState } from "react";
import { ArrowDownTrayIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Button, Card, Badge } from "../components/ui";
import { listTickets, removeTicket, Ticket } from "../services/api";

export default function AdminTickets() {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { (async () => setRows(await listTickets()))(); }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(r =>
      [r.id, r.email, r.age, r.name].some(v => (v ?? "").toLowerCase().includes(k))
    );
  }, [q, rows]);

  const stats = useMemo(() => ({
    未呼出: rows.filter(r=>r.status==="未呼出").length,
    来場済: rows.filter(r=>r.status==="来場済").length,
    未確認: rows.filter(r=>r.status==="未確認").length,
  }), [rows]);

  const exportCSV = () => {
    const header = ["整理券番号","メール","人数","年齢層","来場状況","メモ","登録日時"];
    const lines = filtered.map(r=>[r.id,r.email,r.count,r.age,r.status??"",r.memo??"",r.createdAt??""].join(","));
    const blob = new Blob([ [header.join(","), ...lines].join("\n") ], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `tickets_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">整理券管理</h1>

      {/* メトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5"><div className="text-slate-500 text-sm">未呼出</div><div className="text-3xl font-semibold">{stats["未呼出"]}</div></Card>
        <Card className="p-5"><div className="text-slate-500 text-sm">来場済</div><div className="text-3xl font-semibold">{stats["来場済"]}</div></Card>
        <Card className="p-5"><div className="text-slate-500 text-sm">未確認</div><div className="text-3xl font-semibold">{stats["未確認"]}</div></Card>
      </div>

      {/* 検索・操作 */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
        <input
          value={q} onChange={e=>setQ(e.target.value)}
          placeholder="整理券番号、メール、年齢層で検索..."
          className="w-full md:w-1/2 rounded-lg border px-3 py-2"
        />
        <div className="flex gap-2">
          <Button variant="outline"><FunnelIcon className="w-4 h-4 mr-1"/>フィルター</Button>
          <Button onClick={exportCSV}><ArrowDownTrayIcon className="w-4 h-4 mr-1"/>エクスポート</Button>
        </div>
      </div>

      {/* 一覧 */}
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">整理券番号</th>
              <th className="p-3 text-left">メールアドレス</th>
              <th className="p-3">人数</th>
              <th className="p-3">年齢層</th>
              <th className="p-3">来場状況</th>
              <th className="p-3">メモ</th>
              <th className="p-3 w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3 text-center">{r.count}</td>
                <td className="p-3">{r.age}</td>
                <td className="p-3">
                  <Badge color={r.status==="来場済"?"green":r.status==="未確認"?"yellow":"slate"}>
                    {r.status ?? "-"}
                  </Badge>
                </td>
                <td className="p-3">{r.memo ?? "-"}</td>
                <td className="p-3">
                  <Button variant="outline" className="w-full"
                    onClick={async()=>{ await removeTicket(r.id); 
                      // 即時反映
                      setRows(prev => prev.filter(x=>x.id!==r.id));
                    }}>
                    削除
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td className="p-6 text-center text-slate-500" colSpan={7}>データがありません</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}