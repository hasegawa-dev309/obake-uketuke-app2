import { useEffect, useState, useRef } from "react";
import { API_CONFIG } from "../../config/api.config";

type Ticket = { 
  id: string; 
  email: string; 
  count: number; 
  age: string; 
  status: string;
  createdAt: string;
  ticketNo?: string;
};

type SystemStatus = {
  current_call_number: number;
  is_paused: boolean;
  notice?: string;
};

export default function CallPage(){
  const [current, setCurrent] = useState<number>(Number(localStorage.getItem("current_number") ?? "1"));
  const [paused, setPaused] = useState(localStorage.getItem("system_paused") === "true");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // ポーリング間隔を動的に管理
  const [pollInterval, setPollInterval] = useState<number>(5000); // 通常は5秒
  // 操作直後の高速ポーリングタイマー
  const fastPollTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 楽観的更新のロールバック用
  const previousNumberRef = useRef<number>(Number(localStorage.getItem("current_number") ?? "1"));

  // 現在の呼び出し番号をlocalStorageに保存
  useEffect(() => {
    localStorage.setItem("current_number", String(current));
    previousNumberRef.current = current;
  }, [current]);

  useEffect(() => {
    localStorage.setItem("system_paused", String(paused));
  }, [paused]);

  // /api/public/status をポーリングして呼び出し番号を取得
  useEffect(() => {
    let alive = true;

    const fetchStatus = async () => {
      try {
        // キャッシュ無効化のためtimestampを付与
        const eventDate = new Date().toISOString().split('T')[0];
        const url = `${API_CONFIG.baseURL}/public/status?date=${eventDate}&v=${Date.now()}`;
        
        const res = await fetch(url, {
          method: 'GET',
          headers: API_CONFIG.headers,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: SystemStatus = await res.json();
        
        if (alive) {
          // サーバーの値と同期（楽観的更新中でない場合のみ）
          setCurrent(prev => {
            // 楽観的更新後の値と大きく異なる場合のみ更新
            const diff = Math.abs(data.current_call_number - prev);
            // 2以上差がある場合はサーバー優先で更新（楽観的更新が反映されなかった場合）
            if (diff >= 2) {
              return data.current_call_number;
            }
            return prev;
          });
          setPaused(data.is_paused);
        }
      } catch (err) {
        console.error("呼び出し番号の取得エラー:", err);
        // エラー時はログのみ（UIは維持）
      }
    };

    // 初回取得
    fetchStatus();

    // ポーリング開始
    const intervalId = setInterval(fetchStatus, pollInterval);

    return () => {
      alive = false;
      clearInterval(intervalId);
    };
  }, [pollInterval]);

  // 整理券データを定期的に取得
  useEffect(() => {
    const updateTickets = () => {
      const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
      setTickets(adminTickets);
    };
    updateTickets();
    const interval = setInterval(updateTickets, 1000);
    return () => clearInterval(interval);
  }, []);

  // 呼び出し番号を進める/戻す（オプティミスティックUI更新）
  const handleCallNumberChange = async (direction: 'next' | 'prev') => {
    // 楽観的更新：即座にUIを更新
    const previousValue = current;
    const newValue = direction === 'next' 
      ? current + 1 
      : Math.max(1, current - 1);
    
    // UIを即座に更新（APIレスポンスを待たない）
    setCurrent(newValue);
    previousNumberRef.current = previousValue;

    // 高速ポーリングを開始（操作直後の3秒間）
    if (fastPollTimerRef.current) {
      clearTimeout(fastPollTimerRef.current);
    }
    setPollInterval(400); // 400ms間隔に短縮
    fastPollTimerRef.current = setTimeout(() => {
      setPollInterval(5000); // 3秒後に通常間隔に戻す
      fastPollTimerRef.current = null;
    }, 3000);

    // API呼び出し
    try {
      const url = `${API_CONFIG.baseURL}/call/next`;
      const method = direction === 'next' ? 'POST' : 'POST';
      const body = direction === 'next' 
        ? JSON.stringify({ action: 'next' })
        : JSON.stringify({ action: 'prev' });

      const res = await fetch(url, {
        method,
        headers: API_CONFIG.headers,
        body: method === 'POST' ? body : undefined,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      // サーバーから返された値を確認（必要に応じて同期）
      if (data.current_call_number !== undefined && data.current_call_number !== newValue) {
        setCurrent(data.current_call_number);
      }
    } catch (err) {
      // API呼び出し失敗時はロールバック
      console.error("呼び出し番号の更新に失敗:", err);
      setCurrent(previousValue);
      previousNumberRef.current = previousValue;
      alert("呼び出し番号の更新に失敗しました。ネットワークを確認してください。");
    }
  };

  const handleReload = () => {
    const savedNumber = Number(localStorage.getItem("current_number") ?? "1");
    setCurrent(savedNumber);
    const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
    setTickets(adminTickets);
  };

  const sendEmailToCurrentNumber = () => {
    const ticket = tickets.find(t => t.ticketNo === String(current) || t.id === String(current));
    if (!ticket) {
      alert("該当する整理券が見つかりません");
      return;
    }
    
    const subject = encodeURIComponent("お化け屋敷：順番のお知らせ");
    const body = encodeURIComponent(
      `整理券番号 ${current} のお客様\n\nまもなく順番となります。受付までお越しください。\n\nお化け屋敷スタッフ`
    );
    
    window.open(`mailto:${ticket.email}?subject=${subject}&body=${body}`);
  };

  const sendEmailToUpcomingNumbers = () => {
    const upcomingTickets = tickets.filter(t => {
      const num = Number(t.ticketNo || t.id);
      return num > current && num <= current + 5;
    });
    
    if (upcomingTickets.length === 0) {
      alert("次の5組の整理券が見つかりません");
      return;
    }
    
    const emails = upcomingTickets.map(t => t.email).join(",");
    const subject = encodeURIComponent("お化け屋敷：まもなくお呼びします");
    const body = encodeURIComponent(
      `お化け屋敷の整理券をお持ちのお客様\n\n現在の呼び出し番号は ${current} です。\nまもなくお呼びしますので、受付付近でお待ちください。\n\nお化け屋敷スタッフ`
    );
    
    window.open(`mailto:${emails}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">呼び出し管理</h1>
        <button 
          onClick={handleReload}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
          title="データを再読み込み"
        >
          <span>🔄</span>
          リロード
        </button>
      </div>

      {/* 現在の呼び出し番号 */}
      <div className="text-center mb-12">
        <div className="text-6xl font-bold text-violet-600 mb-4">
          {current}
        </div>
        <div className="text-lg text-slate-600">
          {paused ? "一時停止中" : "呼び出し中"}
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex justify-center items-center gap-8 mb-8">
        <button 
          className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 flex items-center justify-center text-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleCallNumberChange('prev')}
          disabled={current <= 1}
        >
          ◀
        </button>

        <div className="text-4xl font-bold text-center min-w-[120px]">
          {current}
        </div>

        <button 
          className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 flex items-center justify-center text-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleCallNumberChange('next')}
        >
          ▶
        </button>
      </div>

      {/* その他の操作 */}
      <div className="flex justify-center gap-4 flex-wrap">
        <button 
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            paused 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          }`}
          onClick={() => setPaused(p => !p)}
        >
          {paused ? "再開" : "一時停止"}
        </button>
        
        <button 
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          onClick={() => setCurrent(1)}
        >
          リセット
        </button>
      </div>

      {/* メール送信ボタン */}
      <div className="flex justify-center gap-4 mt-6 flex-wrap">
        <button 
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          onClick={sendEmailToCurrentNumber}
        >
          <span>📧</span>
          現在の番号にメール送信
        </button>
        
        <button 
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          onClick={sendEmailToUpcomingNumbers}
        >
          <span>📬</span>
          次の5組にメール送信
        </button>
      </div>

      {/* 統計情報 */}
      <div className="mt-12 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-violet-600">{current}</div>
          <div className="text-sm text-slate-600">現在の番号</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {paused ? "⏸️" : "▶️"}
          </div>
          <div className="text-sm text-slate-600">状態</div>
        </div>
      </div>
    </div>
  );
}