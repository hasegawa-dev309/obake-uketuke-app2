import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowClockwise, Download, UserCircle, Ticket as TicketIcon, CheckCircle, Clock, XCircle } from "phosphor-react";
import { fetchReservations, updateReservationStatus, deleteReservation } from "../../lib/api";

type Ticket = { 
  id: string; 
  email: string; 
  count: number; 
  age: string; 
  status: string;
  createdAt: string;
  ticketNo?: string;
};

// ポーリング間隔の定数
const NORMAL_MS = 5000;  // 通常時は5秒
const BURST_MS = 200;    // 操作直後の高速間隔

export default function TicketsPage(){
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("すべて");
  const [statusFilter, setStatusFilter] = useState("すべて");

  // 楽観的更新の保護用（サーバーポーリングで上書きされないようにする）
  const pendingStatusRef = useRef(new Map<string, string>()); // id -> newStatus
  const pendingDeleteRef = useRef(new Set<string>()); // id
  const pendingRowRef = useRef(new Set<string>()); // 操作中の行 id
  const holdRef = useRef(false); // 一時ホールドフラグ（操作直後の上書き防止）
  const pollStopRef = useRef(false); // ポーリング停止フラグ
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // ポーリングタイマー
  const currentPollIntervalRef = useRef<number>(NORMAL_MS); // 現在のポーリング間隔

  // 入力デバウンス
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  // APIから整理券データを取得（認証付き）
  const loadTickets = async () => {
    try {
      const result = await fetchReservations();
      
      if (result.ok && result.data) {
        console.log("✅ 整理券データ取得成功:", result.data.length + "件");
        
        // hold中はサーバー値で上書きしない（楽観的更新を保護）
        if (holdRef.current) {
          console.log("⏸️ 一時ホールド中：サーバー値をスキップ");
          return;
        }

        // 差分マージ：サーバーデータを基準にしつつ、未確定の楽観的変更を優先
        setTickets(prev => {
          const pendingStatus = pendingStatusRef.current;
          const pendingDelete = pendingDeleteRef.current;

          // サーバーデータから基本配列を作成（削除予定のものは除外）
          const merged: Ticket[] = result.data
            .filter((t: Ticket) => !pendingDelete.has(t.id))
            .map((t: Ticket) => {
              const override = pendingStatus.get(t.id);
              return override ? { ...t, status: override } : t;
            });

          // 既存にのみ存在（サーバー未反映の新規や直後の削除済みなど）は維持
          const existingOnly = prev.filter(p =>
            !result.data.some((s: Ticket) => s.id === p.id) && !pendingDelete.has(p.id)
          ).map(p => {
            const override = pendingStatus.get(p.id);
            return override ? { ...p, status: override } : p;
          });

          const next = [...merged, ...existingOnly];
          // 無駄な再描画を避けるため、内容が同一なら前回値を返す
          if (next.length === prev.length) {
            let same = true;
            for (let i = 0; i < next.length; i++) {
              const a = next[i];
              const b = prev[i];
              if (!b || a.id !== b.id || a.status !== b.status || a.email !== b.email || a.count !== b.count || a.age !== b.age || a.createdAt !== b.createdAt) {
                same = false; break;
              }
            }
            if (same) return prev;
          }
          return next;
        });
      } else {
        console.error("⚠️ 整理券データの取得に失敗:", result);
        setTickets([]);
      }
    } catch (err) {
      console.error("❌ 整理券データ取得エラー:", err);
      setTickets([]);
    }
  };

  // 自己再帰setTimeoutによるポーリング（操作直後の即時tickに対応）
  const startPolling = (interval: number = NORMAL_MS) => {
    // 既存のタイマーをクリア
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    currentPollIntervalRef.current = interval;

    const tick = async () => {
      if (pollStopRef.current) return;

      await loadTickets();

      // 次のポーリングをスケジュール
      pollTimeoutRef.current = setTimeout(tick, currentPollIntervalRef.current);
    };

    // 初回実行
    tick();
  };

  useEffect(() => {
    // 初回読み込み
    pollStopRef.current = false;
    startPolling(NORMAL_MS);
    
    return () => {
      pollStopRef.current = true;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, []);

  const filteredTickets = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return tickets.filter(ticket => {
      const matchesSearch = ticket.id.toLowerCase().includes(s) || 
                           ticket.email.toLowerCase().includes(s) || 
                           ticket.count.toString().includes(searchTerm);
      const matchesAge = ageFilter === "すべて" || ticket.age === ageFilter;
      const matchesStatus = statusFilter === "すべて" || ticket.status === statusFilter;
      return matchesSearch && matchesAge && matchesStatus;
    });
  }, [tickets, searchTerm, ageFilter, statusFilter]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tickets) {
      map[t.status] = (map[t.status] || 0) + 1;
    }
    return map;
  }, [tickets]);
  const getStatusCount = (status: string) => statusCounts[status] || 0;

  const updateStatus = async (id: string, newStatus: string) => {
    console.log(`🔄 ステータス更新開始: id=${id}, status=${newStatus}`);
    const startTime = performance.now();
    
    // 1) 楽観的更新（即時反映、体感0秒）
    const prev = tickets;
    pendingStatusRef.current.set(id, newStatus);
    pendingRowRef.current.add(id);
    holdRef.current = true; // 一時ホールド開始
    setTickets(tickets => tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));

    // 2) 即時tickで他端末も追従（Interval待ちしない）
    loadTickets();

    // 3) バーストポーリング：数秒だけ高速
    startPolling(BURST_MS);
    setTimeout(() => {
      startPolling(NORMAL_MS);
    }, 3000);

    try {
      const result = await updateReservationStatus(id, newStatus);
      const apiTime = performance.now() - startTime;
      console.log(`📝 APIレスポンス (${Math.round(apiTime)}ms):`, result);
      
      if (!result.ok) {
        throw new Error(result.error || result.details || "update failed");
      }
      
      // サーバー反映後はペンディング解除
      pendingStatusRef.current.delete(id);
      pendingRowRef.current.delete(id);
      
      // 4) 800msはサーバー値で上書きしない（古いレスが来ても跳ねる）
      setTimeout(() => {
        holdRef.current = false;
        // ホールド解除後に即時更新
        loadTickets();
      }, 800);
    } catch (err: any) {
      // 失敗時はロールバック
      console.error("❌ ステータス更新エラー:", err);
      holdRef.current = false;
      pendingStatusRef.current.delete(id);
      pendingRowRef.current.delete(id);
      setTickets(prev);
      alert(`ステータス更新に失敗しました`);
    }
  };

  const handleDelete = async (id: string, ticketNo: string) => {
    if (!confirm(`整理券${ticketNo}番を削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    // 楽観的削除（即時反映）
    const prev = tickets;
    pendingDeleteRef.current.add(id);
    pendingRowRef.current.add(id);
    holdRef.current = true; // 一時ホールド開始
    setTickets(tickets => tickets.filter(t => t.id !== id));

    // 即時tickで他端末も追従
    loadTickets();

    // バーストポーリング
    startPolling(BURST_MS);
    setTimeout(() => {
      startPolling(NORMAL_MS);
    }, 3000);

    try {
      const result = await deleteReservation(id);
      if (!result.ok) {
        throw new Error(result.error || "delete failed");
      }
      console.log("✅ 削除成功");
      alert(`整理券${ticketNo}番を削除しました`);
      
      // 800ms後ホールド解除
      setTimeout(() => {
        holdRef.current = false;
        pendingDeleteRef.current.delete(id);
        pendingRowRef.current.delete(id);
        loadTickets();
      }, 800);
    } catch (err) {
      console.error("❌ 削除エラー:", err);
      // ロールバック
      holdRef.current = false;
      pendingDeleteRef.current.delete(id);
      pendingRowRef.current.delete(id);
      setTickets(prev);
      alert("削除に失敗しました。ネットワークを確認してください。");
    }
  };

  const exportToCSV = () => {
    // 整理券データ（メールアドレスなし）
    const dataRows = [
      ["整理券番号", "人数", "年齢層", "来場状況", "登録時間"],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.count.toString(),
        ticket.age,
        ticket.status,
        ticket.createdAt
      ])
    ];

    // 年齢層別の統計
    const ageStats = ["一般", "大学生", "高校生以下"].map(ageGroup => {
      const count = tickets.filter(t => t.age === ageGroup).length;
      return `${ageGroup}: ${count}名`;
    });

    // 来場状況別の統計
    const statusStats = ["未確認", "未呼出", "来場済", "キャンセル"].map(status => {
      const count = tickets.filter(t => t.status === status).length;
      return `${status}: ${count}件`;
    });

    // 登録時間別の統計（1時間ごと）
    const hourStats: { [key: string]: number } = {};
    tickets.forEach(ticket => {
      try {
        // APIから既に日本時間が返されているので、そのまま時間を抽出
        const match = ticket.createdAt.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          const hour = parseInt(match[1]);
          const hourKey = `${hour}:00-${hour}:59`;
          hourStats[hourKey] = (hourStats[hourKey] || 0) + 1;
        }
      } catch (e) {
        // エラーは無視
      }
    });

    const timeStats = Object.entries(hourStats)
      .sort((a, b) => {
        const hourA = parseInt(a[0].split(":")[0]);
        const hourB = parseInt(b[0].split(":")[0]);
        return hourA - hourB;
      })
      .map(([time, count]) => `${time}: ${count}件`);

    // CSV作成
    const csvLines = [
      ...dataRows.map(row => row.join(",")),
      "",
      "【年齢層別統計】",
      ...ageStats,
      "",
      "【来場状況別統計】",
      ...statusStats,
      "",
      "【登録時間別統計（1時間ごと）】",
      ...timeStats
    ];

    const csvContent = csvLines.join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `整理券データ_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">整理券管理</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="検索..."
            className="px-3 py-2 border rounded-lg w-64"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
            title="ページを再読み込み"
          >
            <ArrowClockwise size={18} weight="bold" />
            リロード
          </button>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Download size={18} weight="bold" />
            エクスポート
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2">
            <UserCircle size={18} weight="bold" />
            管理者
          </button>
        </div>
      </div>

      {/* 統計カード - ステータス別 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">未呼出</div>
            <TicketIcon size={24} weight="fill" className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("未呼出")}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">来場済</div>
            <CheckCircle size={24} weight="fill" className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("来場済")}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">未確認</div>
            <Clock size={24} weight="fill" className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("未確認")}</div>
        </div>
      </div>


      {/* フィルター */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <select 
            className="px-3 py-2 border rounded-lg"
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <option value="すべて">年齢層: すべて</option>
            <option value="高校生以下">高校生以下</option>
            <option value="大学生">大学生</option>
            <option value="一般">一般</option>
          </select>
          <select 
            className="px-3 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="すべて">状態: すべて</option>
            <option value="未呼出">未呼出</option>
            <option value="来場済">来場済</option>
            <option value="未確認">未確認</option>
            <option value="キャンセル">キャンセル</option>
          </select>
          <input
            type="text"
            placeholder="整理券番号・メール・人数"
            className="px-3 py-2 border rounded-lg flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
          >
            <Download size={18} weight="bold" />
            エクスポート (CSV)
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">整理券番号</th>
              <th className="px-3 py-2 text-left">メールアドレス</th>
              <th className="px-3 py-2 text-left">人数</th>
              <th className="px-3 py-2 text-left">年齢層</th>
              <th className="px-3 py-2 text-left">来場状況</th>
              <th className="px-3 py-2 text-left">登録時間</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <tr key={`${ticket.id}-${index}`} className={`border-t ${ticket.status === "キャンセル" ? "opacity-40 bg-gray-50" : ""}`}>
                <td className="px-3 py-2 font-mono text-sm font-bold text-violet-600">
                  #{ticket.ticketNo || ticket.id}
                </td>
                <td className="px-3 py-2">{ticket.email}</td>
                <td className="px-3 py-2">{ticket.count}名</td>
                <td className="px-3 py-2">{ticket.age}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === "未確認" ? "bg-yellow-100 text-yellow-700" :
                    ticket.status === "未呼出" ? "bg-blue-100 text-blue-700" :
                    ticket.status === "キャンセル" ? "bg-red-100 text-red-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {new Date(ticket.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => updateStatus(ticket.id, "来場済")}
                      disabled={pendingRowRef.current.has(ticket.id)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 disabled:opacity-50"
                    >
                      来場済
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, "未呼出")}
                      disabled={pendingRowRef.current.has(ticket.id)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 disabled:opacity-50"
                    >
                      未呼出
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, "未確認")}
                      disabled={pendingRowRef.current.has(ticket.id)}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 disabled:opacity-50"
                    >
                      未確認
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, "キャンセル")}
                      disabled={pendingRowRef.current.has(ticket.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle size={14} weight="bold" />
                      キャンセル
                    </button>
                    <button 
                      onClick={() => handleDelete(ticket.id, ticket.ticketNo || ticket.id)}
                      disabled={pendingRowRef.current.has(ticket.id)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle size={14} weight="bold" />
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredTickets.length && (
              <tr>
                <td colSpan={7} className="text-center text-slate-500 py-8">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}