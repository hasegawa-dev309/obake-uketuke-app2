import React, { useMemo, useState, useEffect, useRef } from "react";
import { CalendarIcon, ClockIcon, TicketIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Ghost } from "phosphor-react";
import { postReservation, getSystemStatus } from "../lib/api";
import { API_CONFIG } from "../config/api.config";

type Age = "一般" | "大学生" | "高校生以下";

export default function ReservationApp() {
  const nowStr = useMemo(() => new Date().toLocaleString("ja-JP", {
    year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"
  }), []);

  const [email, setEmail] = useState("");
  const [count, setCount] = useState<number>(1);
  const [age, setAge] = useState<Age>("一般");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNo, setTicketNo] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [currentTicketNumber, setCurrentTicketNumber] = useState<number>(0);

  // 一時停止状態をAPIから監視
  useEffect(() => {
    const checkPausedStatus = async () => {
      try {
        const result = await getSystemStatus();
        if (result.ok && result.data) {
          setIsPaused(result.data.systemPaused);
        }
      } catch (err) {
        console.error("システム状態取得エラー:", err);
        // エラー時はローカルの状態を維持
      }
    };
    
    checkPausedStatus();
    const interval = setInterval(checkPausedStatus, 3000); // 3秒ごとに確認
    return () => clearInterval(interval);
  }, []);

  // 現在の番号を取得（予約完了画面用）
  useEffect(() => {
    if (!ticketNo) return; // チケット番号がある場合のみ実行

    const fetchCurrentNumbers = async () => {
      try {
        const API_BASE = API_CONFIG.baseURL.replace(/\/api$/, '');
        const date = new Date().toISOString().split('T')[0];
        
        // 現在の呼び出し番号を取得（キャッシュ無効化）
        const statusResponse = await fetch(`${API_BASE}/api/reservations/status?date=${date}&v=${Date.now()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store'
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setCurrentNumber(statusData.data?.currentNumber || 1);
        }

        // 現在の整理券番号（カウンター）を取得（キャッシュ無効化）
        const counterResponse = await fetch(`${API_BASE}/api/reservations/counter?date=${date}&v=${Date.now()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store'
        });
        
        if (counterResponse.ok) {
          const counterData = await counterResponse.json();
          setCurrentTicketNumber(counterData.data?.counter || 1);
        }
      } catch (err) {
        console.error("現在の番号取得エラー:", err);
      }
    };
    
    fetchCurrentNumbers();
    // 定期的に更新（3秒ごと）
    const interval = setInterval(fetchCurrentNumbers, 3000);
    return () => clearInterval(interval);
  }, [ticketNo]);

  // 型安全なハンドラ
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCount(Number(e.target.value));
  };

  const onAgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAge(e.target.value as Age);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // デバイスタイプを判定
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
      const channel = isMobile && !isTablet ? 'mobile' : isTablet ? 'tablet' : 'web';
      
      console.log(`📤 予約送信: email=${email}, channel=${channel}`);
      
      // APIヘルパーを使用して送信
      const result = await postReservation({ email, count, age, channel });
      
      if (!result.ok) {
        console.error("API送信エラー:", result);
        throw new Error(result.error || '整理券の発行に失敗しました');
      }
      
      console.log("✅ 整理券発行成功:", result.data);
      
      // 整理券番号と登録時間を設定
      const ticketNumber = result.data.ticketNo || result.data.id;
      setTicketNo(ticketNumber);
      setCreatedAt(result.data.createdAt || "");
      
    } catch (err: any) {
      console.error("❌ 予約エラー:", err);
      setError(err?.message ?? "整理券の発行に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  if (ticketNo) {
    return (
      <div className="min-h-screen bg-[#fff6ef] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur rounded-2xl p-8 shadow-lg text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">整理券発行完了</h1>
          <p className="text-slate-600 mb-6">整理券が正常に発行されました！</p>

          <div className="mb-6">
            <div className="text-sm text-slate-500 mb-2">あなたの整理券番号</div>
            <div className="text-5xl font-bold text-violet-600">
              {ticketNo}
            </div>
            {createdAt && (
              <div className="mt-3 text-sm text-slate-600">
                登録時間: <span className="font-medium">{createdAt}</span>
              </div>
            )}
          </div>

          {/* 現在の状況表示 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">現在の整理券番号</div>
              <div className="text-2xl font-bold text-green-600">
                #{currentTicketNumber}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">現在の呼び出し番号</div>
              <div className="text-2xl font-bold text-blue-600">
                #{currentNumber}
              </div>
            </div>
          </div>


          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 mb-6">
            <div className="font-bold mb-2">ご案内</div>
            <div className="text-sm">20組前になったら受付会場にお越しください。</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
            <div className="font-bold mb-2 text-center">重要</div>
            <div className="text-sm text-center">この画面は受付で使用するため、ブラウザのタブは削除しないでください。また呼び出し番号はリアルタイムで反映されるためリロードは行わないでください。</div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff6ef]">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Ghost className="h-6 w-6 text-white" />
            </span>
            <span className="font-bold">お化け屋敷 整理券システム</span>
          </div>
          <nav className="text-sm text-slate-600 flex items-center gap-6">
            <a className="font-semibold text-slate-900" href="/reservation">予約フォーム</a>
          </nav>
        </div>
      </header>

      {/* 一時停止メッセージ */}
      {isPaused && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  現在点検中のため一時休止中です。しばらくお待ちください。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 py-10">
        <form onSubmit={onSubmit} className="mx-auto max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">
          <div className="pb-3 border-b">
            <div className="text-2xl font-bold text-center">お化け屋敷整理券フォーム</div>
            <div className="mt-2 text-center text-slate-500 flex items-center justify-center gap-3 text-sm">
              <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {nowStr.split(" ")[0]}</span>
              <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {nowStr.split(" ")[1]}</span>
            </div>
          </div>

          <label className="block">
            <span className="text-slate-600 text-sm">メールアドレス</span>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={onEmailChange}
              placeholder="example@email.com"
              className="mt-1 w-full rounded-lg border px-3 h-11" 
            />
            <div className="mt-2 text-xs text-slate-500">
              ※ メールアドレスは整理券発行の記録のみに使用され、個人情報として保存されます。連絡や通知には使用されません。
            </div>
          </label>

          <label className="block">
            <span className="text-slate-600 text-sm">人数</span>
            <select 
              className="mt-1 w-full rounded-lg border h-11 px-3"
              value={count} 
              onChange={onCountChange}
            >
              {[1,2,3,4,5,6,7,8].map(n=> <option key={n} value={n}>{n}名</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-slate-600 text-sm">年齢層</span>
            <select 
              className="mt-1 w-full rounded-lg border h-11 px-3"
              value={age} 
              onChange={onAgeChange}
            >
              {(["一般","大学生","高校生以下"] as Age[]).map(a=> <option key={a} value={a}>{a}</option>)}
            </select>
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            disabled={submitting}
            className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-violet-600 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                発行中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <TicketIcon className="w-5 h-5" />
                整理券を発行する
              </span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}