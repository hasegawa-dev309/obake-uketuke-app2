import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowClockwise, Envelope, EnvelopeOpen, Play, Pause } from "phosphor-react";
import { fetchReservations, getCurrentNumber, updateCurrentNumber } from "../../lib/api";
import { API_CONFIG } from "../../config/api.config";

// ポーリング間隔の定数
const NORMAL_MS = 5000;  // 通常時は5秒
const BURST_MS = 250;   // 操作直後の高速間隔

type Ticket = { 
  id: string; 
  email: string; 
  count: number; 
  age: string; 
  status: string;
  createdAt: string;
  ticketNo?: string;
  eventDate?: string; // event_dateフィールド（あれば）
  ticketUrl?: string;
};

export default function CallPage(){
  const [current, setCurrent] = useState<number>(1);
  const [paused, setPaused] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const holdRef = useRef(false); // 一時ホールドフラグ（操作直後の上書き防止）
  const pollStopRef = useRef(false); // ポーリング停止フラグ
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // ポーリングタイマー
  const currentPollIntervalRef = useRef<number>(NORMAL_MS); // 現在のポーリング間隔

  const openMail = (to: string, subject: string, body: string, from: string) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&authuser=${encodeURIComponent(from)}`;
    const newWin = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (!newWin) {
      // ポップアップブロック時は mailto にフォールバック
      const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  // ステータス取得（即時tick対応）
  const tick = async (date: string) => {
    try {
      const API_BASE = API_CONFIG.baseURL.replace(/\/api$/, '');
      const res = await fetch(`${API_BASE}/api/reservations/status?date=${date}&v=${Date.now()}`, { 
        cache: 'no-store' 
      });
      const st = await res.json();
      
      if (!pollStopRef.current && !holdRef.current && st.ok && st.data) {
        setCurrent(st.data.currentNumber || 1);
        setPaused(st.data.systemPaused || false);
      }
    } catch (err) {
      console.error("❌ ステータス取得エラー:", err);
    }
  };

  // 自己再帰setTimeoutによるポーリング
  const startPolling = (interval: number = NORMAL_MS) => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    currentPollIntervalRef.current = interval;
    const date = new Date().toISOString().split('T')[0];

    const loop = async () => {
      if (pollStopRef.current) return;
      await tick(date);
      pollTimeoutRef.current = setTimeout(loop, currentPollIntervalRef.current);
    };

    loop();
  };

  // APIから現在の番号とシステム状態を取得（認証付き）
  useEffect(() => {
    const loadCurrentNumber = async () => {
      try {
        const result = await getCurrentNumber();
        
        if (result.ok && result.data) {
          setCurrent(result.data.currentNumber || 1);
          setPaused(result.data.systemPaused || false);
        }
      } catch (err) {
        console.error("❌ 現在の番号取得エラー:", err);
      }
    };
    
    loadCurrentNumber();
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

  // currentまたはpausedが変更されたらAPIに保存（認証付き）
  useEffect(() => {
    const saveCurrentNumber = async () => {
      try {
        await updateCurrentNumber(current, paused);
      } catch (err) {
        console.error("❌ 現在の番号保存エラー:", err);
      }
    };
    
    saveCurrentNumber();
  }, [current, paused]);

  // 整理券データをAPIから取得（認証付き）
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const result = await fetchReservations();
        
        if (result.ok && result.data) {
          // データを正しい型に変換（idとticketNoを確実に設定）
          const mappedTickets: Ticket[] = result.data.map((item: any) => {
            const ticketNo = item.ticketNo !== null && item.ticketNo !== undefined 
              ? String(item.ticketNo) 
              : (item.ticket_no !== null && item.ticket_no !== undefined 
                  ? String(item.ticket_no) 
                  : String(item.id || ''));
            
            // idを確実に一意にする（idがなければeventDate-ticketNoの組み合わせ）
            const uniqueId = String(item.id || '');
            const eventDate = item.eventDate || item.event_date || '';
            
            return {
              id: uniqueId || (eventDate && ticketNo ? `${eventDate}-${ticketNo}` : ticketNo || ''),
              email: item.email || '',
              count: Number(item.count || 0),
              age: item.age || '',
              status: item.status || '未呼出',
              createdAt: item.createdAt || item.created_at || '',
              ticketNo: ticketNo,
              eventDate: eventDate,
              ticketUrl: item.ticketUrl || undefined
            };
          });
          
          // keyの衝突チェック
          const keySet = new Set(mappedTickets.map(t => t.id));
          if (keySet.size !== mappedTickets.length) {
            console.warn('⚠️ [CallPage] keyの衝突が検出されました:', mappedTickets.length - keySet.size, '件');
          }
          
          setTickets(mappedTickets);
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

  // idで確実に検索（useCallbackでメモ化）
  const sendEmailToCurrentNumber = useCallback(() => {
    console.debug('📧 [sendEmailToCurrentNumber] 呼び出し:', { current });
    
    // find()で確実にデータを取得（ticketNoで検索）
    const ticket = tickets.find(t => {
      const ticketNo = Number(t.ticketNo || t.id || 0);
      return ticketNo === current;
    });
    
    if (!ticket) {
      console.error(`❌ [sendEmailToCurrentNumber] エラー: 整理券番号 ${current} が見つかりません`);
      console.error('📊 [sendEmailToCurrentNumber] 現在の整理券番号:', tickets.map(t => t.ticketNo));
      alert(`整理券番号 ${current} 番が見つかりません`);
      return;
    }
    
    if (!ticket.email) {
      console.error('❌ [sendEmailToCurrentNumber] メールアドレスが登録されていません');
      alert("メールアドレスが登録されていません");
      return;
    }
    
    const fromEmail = "obakeyasiki.pla.haku@gmail.com";
    const toEmail = ticket.email;
    const subject = "お化け屋敷：順番のお知らせ";
    const ticketNumber = ticket.ticketNo || ticket.id || current;
    const body = `整理券番号 ${ticketNumber} 番のお客様へ

まもなくお化け屋敷へのご案内となります。
恐れ入りますが、受付前までお越しください。

待機場所：5号館1階5102教室(お化け屋敷受付)
キャンセルされる場合は、このメールに返信せずそのままにしてください。
${ticket.ticketUrl ? `\n整理券の確認：${ticket.ticketUrl}\n` : ''}

それでは、皆さまの勇気をお待ちしております👻

—
第61回 東洋大学 白山祭　お化け屋敷スタッフ一同`;
    
    // Gmail作成を開く（失敗時はmailto）
    openMail(toEmail, subject, body, fromEmail);
  }, [tickets, current]);

  // useMemo + slice()で非破壊的にフィルタとソート（useCallbackでメモ化）
  const sendEmailToUpcomingNumbers = useCallback(() => {
    const currentNum = Number(current);
    
    // 表示用配列を安定化（useMemo + slice()で非破壊）
    const upcomingTickets = tickets
      .slice() // 破壊防止（元配列を触らない）
      .filter(t => {
        const ticketNo = Number(t.ticketNo || t.id || 0);
        return ticketNo > currentNum && ticketNo <= currentNum + 5;
      })
      .slice() // 再度slice()で安全に
      .sort((a, b) => {
        // ticketNoでソート
        const numA = Number(a.ticketNo || a.id || 0);
        const numB = Number(b.ticketNo || b.id || 0);
        return numA - numB;
      });
    
    if (upcomingTickets.length === 0) {
      console.warn('⚠️ [sendEmailToUpcomingNumbers] 次の5組の整理券が見つかりません');
      alert("次の5組の整理券が見つかりません");
      return;
    }
    
    console.debug('📧 [sendEmailToUpcomingNumbers] メール送信対象件数:', upcomingTickets.length);
    
    const fromEmail = "obakeyasiki.pla.haku@gmail.com";
    const subject = "お化け屋敷：まもなくお呼びします";
    
    // 複数の宛先にメールを送る場合は、各宛先に対して個別にGmail作成画面を開く
    // find()で取得した正しいticketオブジェクトを使用
    upcomingTickets.forEach((ticket, index) => {
      if (!ticket.email) {
        console.warn(`⚠️ [sendEmailToUpcomingNumbers] 整理券番号 ${ticket.ticketNo || ticket.id} にはメールアドレスがありません`);
        return;
      }
      
      const ticketNumber = ticket.ticketNo || ticket.id;
      const body = `整理券番号 ${ticketNumber} 番のお客様へ

まもなくお化け屋敷へのご案内となります。
恐れ入りますが、受付前までお越しください。

待機場所：5号館1階5102教室(お化け屋敷受付)
キャンセルされる場合は、このメールに返信せずそのままにしてください。
${ticket.ticketUrl ? `\n整理券の確認：${ticket.ticketUrl}\n` : ''}

それでは、皆さまの勇気をお待ちしております👻

—
第61回 東洋大学 白山祭　お化け屋敷スタッフ一同`;
      
      setTimeout(() => {
        openMail(ticket.email, subject, body, fromEmail);
      }, index * 500); // 0.5秒ずつ遅延させて開く
    });
  }, [tickets, current]);

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
          onClick={async () => {
            // 楽観更新
            const newValue = Math.max(1, current - 1);
            setCurrent(newValue);
            holdRef.current = true;

            // 即時tick
            const date = new Date().toISOString().split('T')[0];
            tick(date);

            // バーストポーリング
            startPolling(BURST_MS);
            setTimeout(() => {
              startPolling(NORMAL_MS);
            }, 3000);

            try {
              await updateCurrentNumber(newValue, paused);
              setTimeout(() => {
                holdRef.current = false;
                tick(date);
              }, 800);
            } catch (err: any) {
              console.error("❌ 呼び出し番号更新エラー:", err);
              holdRef.current = false;
              setCurrent(current);
              alert("呼び出し番号の更新に失敗しました");
            }
          }}
        >
          ◀
        </button>

        <div className="text-4xl font-bold text-center min-w-[120px]">
          {current}
        </div>

        <button 
          className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-violet-500 hover:bg-violet-50 flex items-center justify-center text-2xl transition-colors"
          onClick={async () => {
            // 楽観更新（即時反映、体感0秒）
            const newValue = current + 1;
            setCurrent(newValue);
            holdRef.current = true;

            // 即時tickで他端末も追従
            const date = new Date().toISOString().split('T')[0];
            tick(date);

            // バーストポーリング：数秒だけ高速
            startPolling(BURST_MS);
            setTimeout(() => {
              startPolling(NORMAL_MS);
            }, 3000);

            try {
              await updateCurrentNumber(newValue, paused);
              // 800msはサーバー値で上書きしない（古いレスが来ても跳ねる）
              setTimeout(() => {
                holdRef.current = false;
                tick(date);
              }, 800);
            } catch (err: any) {
              // 失敗時はロールバック
              console.error("❌ 呼び出し番号更新エラー:", err);
              holdRef.current = false;
              setCurrent(current);
              alert("呼び出し番号の更新に失敗しました");
            }
          }}
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
