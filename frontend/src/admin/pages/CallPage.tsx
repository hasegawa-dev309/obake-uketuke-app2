import { useEffect, useRef, useState } from "react";
import { ArrowClockwise, Envelope, EnvelopeOpen, Play, Pause } from "phosphor-react";
import { fetchReservations, getCurrentNumber, updateCurrentNumber } from "../../lib/api";

type Ticket = { 
  id: string; 
  email: string; 
  count: number; 
  age: string; 
  status: string;
  createdAt: string;
  ticketNo?: string;
};

export default function CallPage(){
  const [current, setCurrent] = useState<number>(1);
  const [paused, setPaused] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const lastManualChangeAtRef = useRef<number>(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

  const openMail = (to: string, subject: string, body: string, from: string) => {
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&authuser=${encodeURIComponent(from)}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // モバイルは既定メールアプリを優先（Gmailアカウント固定は不可）
      try {
        const a = document.createElement('a');
        a.href = mailtoUrl;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        window.location.href = mailtoUrl;
      }
      return;
    }

    // デスクトップは Gmail を優先（authuser で送信元アカウントを固定）
    const win = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      // ブロック時は同一タブ遷移
      window.location.href = gmailUrl;
    }
  };

  // APIから現在の番号とシステム状態を取得（認証付き）
  useEffect(() => {
    const loadCurrentNumber = async () => {
      try {
        const result = await getCurrentNumber();
        
        if (result.ok && result.data) {
          const now = Date.now();
          const isRecentlyChanged = now - lastManualChangeAtRef.current < 1500; // 手動変更から1.5秒以内は上書きしない
          if (!isRecentlyChanged) {
            setCurrent(result.data.currentNumber || 1);
            setPaused(result.data.systemPaused || false);
          }
        }
      } catch (err) {
        console.error("❌ 現在の番号取得エラー:", err);
      }
    };
    
    loadCurrentNumber();
    const interval = setInterval(loadCurrentNumber, 1000);
    return () => clearInterval(interval);
  }, []);

  // current/paused の保存はデバウンスしてネットワーク往復を間引く
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await updateCurrentNumber(current, paused);
      } catch (err) {
        console.error("❌ 現在の番号保存エラー:", err);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [current, paused]);

  const markManualChange = () => {
    lastManualChangeAtRef.current = Date.now();
  };

  const startHold = (delta: number) => {
    markManualChange();
    setCurrent(n => Math.max(1, n + delta));
    // 初回遅延後に連続リピート
    holdTimerRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        markManualChange();
        setCurrent(n => Math.max(1, n + delta));
      }, 60);
    }, 250);
  };

  const stopHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // 整理券データをAPIから取得（認証付き）
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const result = await fetchReservations();
        
        if (result.ok && result.data) {
          setTickets(result.data);
        }
      } catch (err) {
        console.error("❌ 整理券データ取得エラー:", err);
      }
    };
    
    loadTickets();
    const interval = setInterval(loadTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  const sendEmailToCurrentNumber = () => {
    const ticket = tickets.find(t => t.ticketNo === String(current) || t.id === String(current));
    if (!ticket) {
      alert("該当する整理券が見つかりません");
      return;
    }
    
    const fromEmail = "obakeyasiki.pla.haku@gmail.com";
    const toEmail = ticket.email;
    const subject = "お化け屋敷：順番のお知らせ";
    const body = `整理券番号 ${current} 番のお客様へ

まもなくお化け屋敷へのご案内となります。
恐れ入りますが、受付前までお越しください。

待機場所：5号館1階5102教室(お化け屋敷受付)
キャンセルされる場合は、このメールに返信せずそのままにしてください。

それでは、皆さまの勇気をお待ちしております👻

—
第61回 東洋大学 白山祭　お化け屋敷スタッフ一同`;
    
    // Gmail作成を開く（失敗時はmailto）
    openMail(toEmail, subject, body, fromEmail);
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
    
    const fromEmail = "obakeyasiki.pla.haku@gmail.com";
    const subject = "お化け屋敷：まもなくお呼びします";
    
    // 複数の宛先にメールを送る場合は、各宛先に対して個別にGmail作成画面を開く
    upcomingTickets.forEach((ticket, index) => {
      const ticketNumber = ticket.ticketNo || ticket.id;
      const body = `整理券番号 ${ticketNumber} 番のお客様へ

まもなくお化け屋敷へのご案内となります。
恐れ入りますが、受付前までお越しください。

待機場所：5号館1階5102教室(お化け屋敷受付)
キャンセルされる場合は、このメールに返信せずそのままにしてください。

それでは、皆さまの勇気をお待ちしております👻

—
第61回 東洋大学 白山祭　お化け屋敷スタッフ一同`;
      
      setTimeout(() => {
        openMail(ticket.email, subject, body, fromEmail);
      }, index * 500); // 0.5秒ずつ遅延させて開く
    });
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
          <ArrowClockwise size={18} weight="bold" />
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
          className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 flex items-center justify-center text-2xl transition-colors"
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(-1)}
          onTouchEnd={stopHold}
          onClick={() => { markManualChange(); setCurrent(n => Math.max(1, n - 1)); }}
        >
          ◀
        </button>

        <div className="text-4xl font-bold text-center min-w-[120px]">
          {current}
        </div>

        <button 
          className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 flex items-center justify-center text-2xl transition-colors"
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(1)}
          onTouchEnd={stopHold}
          onClick={() => { markManualChange(); setCurrent(n => n + 1); }}
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
          <Envelope size={20} weight="bold" />
          現在の番号にメール送信
        </button>
        
        <button 
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          onClick={sendEmailToUpcomingNumbers}
        >
          <EnvelopeOpen size={20} weight="bold" />
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
          <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
            {paused ? <Pause size={32} weight="fill" /> : <Play size={32} weight="fill" />}
          </div>
          <div className="text-sm text-slate-600">状態</div>
        </div>
      </div>
    </div>
  );
}