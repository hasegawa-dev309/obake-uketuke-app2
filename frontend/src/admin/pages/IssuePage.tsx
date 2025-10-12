import React, { useState } from 'react';
import { Plus } from 'phosphor-react';
import { API_CONFIG } from '../../config/api.config';

type Age = "一般" | "大学生" | "高校生以下";

export function IssuePage() {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState<number>(1);
  const [age, setAge] = useState<Age>("一般");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNo, setTicketNo] = useState<string | null>(null);

  // 日付が変わったら整理券番号をリセット
  function checkAndResetIfNeeded() {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem("obake_last_reset_date");
    
    if (lastReset !== today) {
      // 日付が変わったのでリセット
      localStorage.setItem("obake_last_reset_date", today);
      localStorage.setItem("ticket_counter", "0");
      localStorage.setItem("current_number", "1");
      
      // 整理券データを全削除（新しい日の開始）
      localStorage.setItem("admin_tickets", "[]");
      localStorage.setItem("obake_tickets_v1", "[]");
      
      console.log("新しい日が開始されました。整理券データをリセットしました。");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // 日付チェックとリセット
      checkAndResetIfNeeded();
      
      // まずLocalStorageで整理券を発行
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
        createdAt: new Date().toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }),
        ticketNo: nextTicketNo.toString()
      };
      
      // admin_ticketsに保存
      const adminTickets = JSON.parse(localStorage.getItem("admin_tickets") || "[]");
      adminTickets.unshift(reservation);
      localStorage.setItem("admin_tickets", JSON.stringify(adminTickets));
      
      // バックグラウンドでAPIにも送信
      try {
        await fetch(`${API_CONFIG.baseURL}/reservations`, {
          method: 'POST',
          headers: API_CONFIG.headers,
          body: JSON.stringify({ email, count, age })
        });
      } catch (apiErr) {
        console.log("API送信エラー（ローカルには保存済み）:", apiErr);
      }
      
    } catch (err) {
      setError("整理券の発行に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (ticketNo) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">整理券発行完了</h1>
          <p className="text-slate-600 mb-6">整理券が正常に発行されました！</p>

          <div className="mb-6">
            <div className="text-sm text-slate-500 mb-2">整理券番号</div>
            <div className="text-5xl font-bold text-violet-600">
              {ticketNo}
            </div>
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
            新しく整理券を発行する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">整理券発行</h1>
      
      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            人数
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}名
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            年齢層
          </label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value as Age)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="一般">一般</option>
            <option value="大学生">大学生</option>
            <option value="高校生以下">高校生以下</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          disabled={submitting}
          className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-violet-600 disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              発行中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Plus size={20} weight="bold" />
              整理券を発行する
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
