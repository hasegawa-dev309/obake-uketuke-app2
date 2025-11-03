import { useEffect, useState } from "react";
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

export default function TicketsPage(){
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("すべて");
  const [statusFilter, setStatusFilter] = useState("すべて");

  // APIから整理券データを取得（認証付き）
  const loadTickets = async () => {
    try {
      console.log("🔄 [TicketsPage] 整理券データ取得開始...");
      const result = await fetchReservations();
      
      console.log("📥 [TicketsPage] APIレスポンス:", {
        ok: result.ok,
        dataLength: result.data?.length || 0,
        error: result.error
      });
      
      if (result.ok && result.data) {
        console.log("✅ 整理券データ取得成功:", result.data.length + "件");
        if (result.data.length > 0) {
          console.log("📄 サンプルデータ:", result.data[0]);
        }
        
        // データを正しい型に変換（idとticketNoを文字列に変換）
        const mappedTickets: Ticket[] = result.data.map((item: any) => {
          const ticketNo = item.ticketNo !== null && item.ticketNo !== undefined 
            ? String(item.ticketNo) 
            : (item.ticket_no !== null && item.ticket_no !== undefined 
                ? String(item.ticket_no) 
                : String(item.id || ''));
          
          return {
            id: String(item.id || ticketNo || ''),
            email: item.email || '',
            count: Number(item.count || 0),
            age: item.age || '',
            status: item.status || '未呼出',
            createdAt: item.createdAt || item.created_at || '',
            ticketNo: ticketNo
          };
        });
        
        console.log("🔄 マッピング後:", mappedTickets.length + "件", mappedTickets[0]);
        setTickets(mappedTickets);
      } else {
        console.error("⚠️ 整理券データの取得に失敗:", result);
        if (result.error) {
          console.error("エラー詳細:", result.error, result.details);
        }
        // エラー時も既存データを保持（空配列にしない）
        // setTickets([]);
      }
    } catch (err: any) {
      console.error("❌ 整理券データ取得エラー:", err);
      console.error("エラー詳細:", err.message, err.stack);
      // エラー時も既存データを保持
      // setTickets([]);
    }
  };

  useEffect(() => {
    // 初回読み込み
    loadTickets();
    
    // 定期的に更新（2秒ごとに短縮して即座に反映）
    const interval = setInterval(() => {
      console.log('🔄 [TicketsPage] 定期更新実行');
      loadTickets();
    }, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ticket.count.toString().includes(searchTerm);
    const matchesAge = ageFilter === "すべて" || ticket.age === ageFilter;
    const matchesStatus = statusFilter === "すべて" || ticket.status === statusFilter;
    
    return matchesSearch && matchesAge && matchesStatus;
  });

  const getStatusCount = (status: string) => {
    return tickets.filter(t => t.status === status).length;
  };

  const updateStatus = async (id: string, newStatus: string) => {
    console.log(`🔄 ステータス更新開始: id=${id}, status=${newStatus}`);
    
    try {
      // APIでステータスを更新（楽観的更新は削除）
      const result = await updateReservationStatus(id, newStatus);
      
      console.log("📝 APIレスポンス:", result);
      
      if (result.ok) {
        console.log("✅ ステータス更新成功");
        // 成功時のみUIを更新
        await loadTickets();
      } else {
        console.error("⚠️ ステータス更新失敗:", result);
        const errorMsg = result.error || result.details || "ステータス更新に失敗しました";
        alert(`エラー: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("❌ ステータス更新エラー:", err);
      console.error("❌ エラー詳細:", err.message);
      alert(`ステータス更新に失敗しました: ${err.message || "ネットワークを確認してください"}`);
    }
  };

  const handleDelete = async (id: string, ticketNo: string) => {
    if (!confirm(`整理券${ticketNo}番を削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      const result = await deleteReservation(id);
      
      if (result.ok) {
        console.log("✅ 削除成功");
        alert(`整理券${ticketNo}番を削除しました`);
        // 成功時のみUIを更新
        await loadTickets();
      } else {
        console.error("⚠️ 削除失敗:", result);
        alert(`エラー: ${result.error || "削除に失敗しました"}`);
      }
    } catch (err) {
      console.error("❌ 削除エラー:", err);
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id || ticket.ticketNo || `ticket-${ticket.email}`} className={`border-t ${ticket.status === "キャンセル" ? "opacity-40 bg-gray-50" : ""}`}>
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
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                    >
                      来場済
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, "未呼出")}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      未呼出
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, "未確認")}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                    >
                      未確認
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, "キャンセル")}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 flex items-center gap-1"
                    >
                      <XCircle size={14} weight="bold" />
                      キャンセル
                    </button>
                    <button 
                      onClick={() => handleDelete(ticket.id, ticket.ticketNo || ticket.id)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center gap-1"
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