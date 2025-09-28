import { useEffect, useMemo, useRef, useState } from "react";
import { ticketsStore, Ticket } from "../store/tickets";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Menu,
  X,
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import "../index.css";

/** 変更がある時だけ state を更新（参照が無駄に変わらないように） */
function useTicketsStable() {
  const [data, setData] = useState<Ticket[]>(() => ticketsStore.getAll?.() ?? []);
  const cacheRef = useRef<string>("");

  useEffect(() => {
    // 初回キャッシュ
    cacheRef.current = JSON.stringify(data.map(t => [t.id, t.status, t.people, t.ageGroup, t.createdAt]));

    const unsub = ticketsStore.onChange?.(() => {
      const next = ticketsStore.getAll?.() ?? [];
      const sig = JSON.stringify(next.map(t => [t.id, t.status, t.people, t.ageGroup, t.createdAt]));
      if (sig !== cacheRef.current) {
        cacheRef.current = sig;
        setData(next);
      }
    });

    // マウント時にも最新を1回取り込む（onChangeが来ない構成のための保険）
    const next = ticketsStore.getAll?.() ?? [];
    const sig = JSON.stringify(next.map(t => [t.id, t.status, t.people, t.ageGroup, t.createdAt]));
    if (sig !== cacheRef.current) {
      cacheRef.current = sig;
      setData(next);
    }

    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  return data;
}

// サイドバーコンポーネント
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const menuItems = [
    { icon: BarChart3, label: "ダッシュボード", href: "/admin.html" },
    { icon: Calendar, label: "予約一覧", href: "/admin.html" },
    { icon: Users, label: "ユーザー管理", href: "/admin.html" },
    { icon: BarChart3, label: "統計", href: "/admin.html" },
    { icon: Settings, label: "設定", href: "/admin.html" },
    { icon: LogOut, label: "ログアウト", href: "/" },
  ];

  return (
    <>
      {/* オーバーレイ（モバイル用） */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* サイドバー */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">👻</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">管理画面</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}

// ヘッダーコンポーネント
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">ダッシュボード</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 検索バー */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="検索..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* 通知アイコン */}
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* プロフィール */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">管理者</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// 統計カードコンポーネント
function StatsCard({ title, value, icon: Icon, color }: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string; 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// バッジコンポーネント
function Badge({ status }: { status: Ticket["status"] }) {
  const map: any = {
    queued: "bg-amber-100 text-amber-800",
    arrived: "bg-green-100 text-green-800",
    "no-show": "bg-red-100 text-red-800",
  };
  const label: any = { queued: "待ち", arrived: "来場", "no-show": "未到着" };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export function AdminApp() {
  const all = useTicketsStable();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState("");
  const [age, setAge] = useState<string>("");
  const [st, setSt] = useState<string>("");

  // 統計データ
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayTickets = all.filter(t => new Date(t.createdAt).toDateString() === today);
    
    return {
      today: todayTickets.length,
      arrived: all.filter(t => t.status === "arrived").length,
      queued: all.filter(t => t.status === "queued").length,
      noShow: all.filter(t => t.status === "no-show").length,
    };
  }, [all]);

  // フィルタリング
  const filtered = useMemo(() => {
    return all.filter(t => {
      const okQ = q ? (t.email.toLowerCase().includes(q.toLowerCase()) || String(t.people) === q) : true;
      const okA = age ? t.ageGroup === age : true;
      const okS = st ? t.status === st : true;
      return okQ && okA && okS;
    });
  }, [all, q, age, st]);

  const onStatus = (id: string, s: Ticket["status"]) => ticketsStore.update?.(id, { status: s });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="今日の予約数"
              value={stats.today}
              icon={Calendar}
              color="bg-blue-500"
            />
            <StatsCard
              title="来場済み"
              value={stats.arrived}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <StatsCard
              title="待ち"
              value={stats.queued}
              icon={Clock}
              color="bg-amber-500"
            />
            <StatsCard
              title="未到着"
              value={stats.noShow}
              icon={AlertCircle}
              color="bg-red-500"
            />
          </div>

          {/* フィルターバー */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-4">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={age} 
                  onChange={e => setAge(e.target.value)}
                >
                  <option value="">年齢層: すべて</option>
                  <option value="高校生以下">高校生以下</option>
                  <option value="大学生">大学生</option>
                  <option value="一般">一般</option>
                </select>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={st} 
                  onChange={e => setSt(e.target.value)}
                >
                  <option value="">状態: すべて</option>
                  <option value="queued">待ち</option>
                  <option value="arrived">来場</option>
                  <option value="no-show">未到着</option>
                </select>
              </div>
              <input
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="検索（メール / 人数）"
                value={q} 
                onChange={e => setQ(e.target.value)}
              />
            </div>
          </div>

          {/* テーブル */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      人数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年齢層
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {t.id.slice(0, 8)}…
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {t.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {t.people}名
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {t.ageGroup}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(t.createdAt).toLocaleTimeString("ja-JP", { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={t.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            onClick={() => onStatus(t.id, "arrived")}
                          >
                            来場
                          </button>
                          <button 
                            className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                            onClick={() => onStatus(t.id, "queued")}
                          >
                            待ちへ
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            onClick={() => onStatus(t.id, "no-show")}
                          >
                            未到着
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 受付へ戻る */}
          <div className="mt-6 text-right">
            <a 
              href="/reservation.html" 
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              受付へ戻る
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
