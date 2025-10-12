import { useEffect, useState } from "react";
import { ticketsStore } from "../store/tickets";

export default function ReservationComplete() {
  // 呼び出し中番号（現在の整理券番号として使用）
  const calling = (() => {
    try { 
      const all = ticketsStore.getAll?.() ?? [];
      return all.length || 1; 
    }
    catch { return 1; }
  })();

  const [sec, setSec] = useState(3);
  useEffect(() => {
    const t = setInterval(() => setSec(s => (s > 0 ? s - 1 : 0)), 1000);
    const j = setTimeout(() => location.assign("/mypage.html"), 3000);
    return () => { clearInterval(t); clearTimeout(j); };
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <section className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(2,6,23,0.12)] overflow-hidden">
        {/* ヘッダ */}
        <div className="px-6 py-6 border-b text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-2xl">✓</div>
          <h1 className="text-xl font-semibold">整理券発行完了</h1>
          <p className="mt-2 text-sm text-slate-600">整理券が正常に発行されました！以下の整理券番号でお呼び出しします</p>
        </div>

        {/* 本文 */}
        <div className="px-6 py-8 space-y-8">
          {/* 整理券番号（大きな丸） */}
          <div className="mx-auto w-40 h-40 rounded-full bg-orange-50 border-4 border-orange-200 grid place-items-center">
            <div className="text-5xl font-semibold text-orange-600">{calling}</div>
          </div>

          {/* ご案内ボックス */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
            <div className="font-semibold text-orange-700 mb-1">ご案内</div>
            <p className="text-sm text-orange-700">
              5組前になりましたら、受付にお越しください。<br/>
              早く呼ばれる場合がございますのでお早めにお越しください。
            </p>
          </div>

          {/* 現在の呼び出し番号 */}
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-2">現在の呼び出し番号</div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-2xl text-blue-600">
              {calling}
            </div>
          </div>

          {/* 自動遷移ボックス */}
          <div className="rounded-2xl border bg-slate-50 p-4 text-center text-slate-700">
            <span className="font-medium">{sec}秒後</span> に
            <a className="underline mx-1" href="/mypage.html">マイページ</a>
            に自動遷移します
          </div>
        </div>
      </section>
    </div>
  );
}
