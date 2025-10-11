import React, { useMemo, useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, TicketIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Ghost } from "phosphor-react";

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
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // 一時停止状態を監視
  useEffect(() => {
    const checkPausedStatus = () => {
      const paused = localStorage.getItem("system_paused") === "true";
      setIsPaused(paused);
    };
    
    checkPausedStatus();
    const interval = setInterval(checkPausedStatus, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // 日付が変わったら整理券番号をリセット
  function checkAndResetIfNeeded() {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem("obake_last_reset_date");
    
    if (lastReset !== today) {
      // 日付が変わったのでリセット
      localStorage.setItem("obake_last_reset_date", today);
      localStorage.setItem("ticket_counter", "0");
      localStorage.setItem("current_number", "1");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // モック実装
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 日付チェックとリセット
      checkAndResetIfNeeded();
      
      // 整理券番号を1から順番に生成（ticket_counterを使用）
      const counter = parseInt(localStorage.getItem("ticket_counter") || "0");
      const nextTicketNo = counter + 1;
      localStorage.setItem("ticket_counter", nextTicketNo.toString());
      
      setTicketNo(nextTicketNo.toString());
      
      // データを保存
      const reservation = {
        id: nextTicketNo.toString(),
        email,
        count,
        age,
        status: "未呼出",
        createdAt: new Date().getTime(),
        ticketNo: nextTicketNo.toString()
      };
      
      // 管理画面用のデータを保存（localStorageで永続化）
      const existingTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
      existingTickets.push(reservation);
      localStorage.setItem("admin_tickets", JSON.stringify(existingTickets));
      
      // obake_tickets_v1にも保存（store.tsと互換性を保つ）
      const obakeTickets = JSON.parse(localStorage.getItem("obake_tickets_v1") || "[]");
      obakeTickets.unshift(reservation);
      localStorage.setItem("obake_tickets_v1", JSON.stringify(obakeTickets));
      
      // ページ更新のイベントを発火（管理画面の更新を促す）
      window.dispatchEvent(new CustomEvent('ticketAdded', { detail: reservation }));
      
    } catch (err: any) {
      setError(err?.message ?? "発行に失敗しました");
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
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 mb-6">
            <div className="font-bold mb-2">ご案内</div>
            <div className="text-sm">番号が呼ばれましたら、受付にお越しください。</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
            <div className="font-bold mb-2 text-center">重要</div>
            <div className="text-sm text-center">この画面は受付で使用するため、スクリーンショットをお願いいたします。</div>
          </div>

          <button
            onClick={() => {
              setTicketNo(null);
              setEmail("");
              setCount(1);
              setAge("一般");
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition-colors"
          >
            新しく予約する
          </button>
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