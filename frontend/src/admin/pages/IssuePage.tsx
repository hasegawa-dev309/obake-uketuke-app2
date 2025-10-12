import React, { useState } from 'react';
import { Plus } from 'phosphor-react';
import { postReservation } from '../../lib/api';

type Age = "一般" | "大学生" | "高校生以下";

export function IssuePage() {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState<number>(1);
  const [age, setAge] = useState<Age>("一般");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNo, setTicketNo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // 管理画面からの発行はchannelを'admin'とする
      const channel = 'admin';
      
      console.log(`📤 管理画面から発行: email=${email}, channel=${channel}`);
      
      // APIヘルパーを使用して送信
      const result = await postReservation({ email, count, age, channel });
      
      if (!result.ok) {
        console.error("⚠️ API送信エラー:", result);
        throw new Error(result.error || '整理券の発行に失敗しました');
      }
      
      console.log("✅ 整理券発行成功:", result.data);
      
      // 整理券番号を設定
      const ticketNumber = result.data.ticketNo || result.data.id;
      setTicketNo(ticketNumber);
      
    } catch (err: any) {
      console.error("❌ 予約エラー:", err);
      setError(err?.message ?? "整理券の発行に失敗しました。もう一度お試しください。");
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
