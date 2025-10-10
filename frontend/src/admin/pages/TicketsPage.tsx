import { useEffect, useState } from "react";

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

  useEffect(() => {
    // localStorageから予約データを取得
    const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
    setTickets(adminTickets);
  }, []);

  // 予約データの更新を監視
  useEffect(() => {
    const handleStorageChange = () => {
      const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
      setTickets(adminTickets);
    };

    // カスタムイベントリスナー（予約フォームからの通知）
    const handleTicketAdded = () => {
      handleStorageChange();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ticketAdded', handleTicketAdded);
    // 定期的にチェック（予約フォームから直接更新された場合）
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ticketAdded', handleTicketAdded);
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

  const updateStatus = (id: string, newStatus: string) => {
    const updatedTickets = tickets.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTickets(updatedTickets);
    
    // localStorageにも保存
    localStorage.setItem("admin_tickets", JSON.stringify(updatedTickets));
  };

  const exportToCSV = () => {
    const csvContent = [
      ["整理券番号", "メール", "人数", "年齢層", "来場状況", "登録時間"],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.email,
        ticket.count.toString(),
        ticket.age,
        ticket.status,
        ticket.createdAt
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
            onClick={() => {
              const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
              setTickets(adminTickets);
            }}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
            title="データを再読み込み"
          >
            <span>🔄</span>
            リロード
          </button>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            エクスポート
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2">
            <span>👤</span>
            管理者
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">未呼出</div>
            <div className="text-slate-400">🎫</div>
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("未呼出")}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">来場済</div>
            <div className="text-slate-400">👤</div>
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("来場済")}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">未確認</div>
            <div className="text-slate-400">🕐</div>
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("未確認")}</div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-4">
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
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
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
              <tr key={`${ticket.id}-${index}`} className="border-t">
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
                    "bg-green-100 text-green-700"
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-3 py-2">{ticket.createdAt}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
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