import { useMemo, useState } from "react";
import MobileOnly from "./MobileOnly";
import { ticketsStore } from "../store/tickets";

const labelCls = "text-xs text-slate-500";
const inputCls =
  "h-12 w-full rounded-base border border-surface-muted bg-white px-3 outline-none focus:ring-2 focus:ring-brand";

export default function MobileReservationApp() {
  const [email, setEmail] = useState("");
  const [people, setPeople] = useState(1);
  const [age, setAge] = useState<"高校生以下" | "大学生" | "一般">("一般");
  const disabled = useMemo(() => !email || !/^\S+@\S+\.\S+$/.test(email), [email]);

  const submit = () => {
    if (disabled) return;
    const day = new Date().toISOString().slice(0, 10);
    ticketsStore.add?.({ email, people, ageGroup: age, day });
    // 完了画面へ
    location.href = "/reservation/complete";
  };

  return (
    <MobileOnly>
      <div
        className="min-h-dvh"
        style={{ background: "linear-gradient(180deg,#fff7ed 0%,#fff1e6 100%)" }}
      >
        {/* ヘッダー（固定） */}
        <div className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur border-b">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 grid place-items-center rounded-xl bg-brand text-white">👻</span>
              <div className="text-sm font-semibold">お化け屋敷 整理券フォーム</div>
            </div>
            <a
              href="/admin.html"
              className="text-xs h-8 px-3 inline-flex items-center rounded-base border hover:bg-slate-50"
            >
              管理
            </a>
          </div>
        </div>

        {/* フォームカード */}
        <div className="px-4 py-6">
          <div className="mx-auto max-w-md bg-white rounded-2xl shadow-[0_20px_60px_rgba(2,6,23,.08)]">
            <div className="px-4 py-3 border-b">
              <div className="text-base font-semibold">整理券取得</div>
              <div className="mt-1 text-[11px] text-slate-500">
                {new Date().toLocaleDateString("ja-JP")}・{new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className={labelCls}>メールアドレス</div>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className={labelCls}>人数</div>
                <select
                  className={inputCls}
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}名
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className={labelCls}>年齢層</div>
                <select
                  className={inputCls}
                  value={age}
                  onChange={(e) => setAge(e.target.value as any)}
                >
                  <option>高校生以下</option>
                  <option>大学生</option>
                  <option>一般</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 送信ボタン（固定フッター） */}
        <div className="sticky bottom-0 z-30 px-4 pb-6 pt-3 bg-gradient-to-t from-[#fff1e6] via-[rgba(255,241,230,.85)] to-transparent">
          <button
            disabled={disabled}
            onClick={submit}
            className="mx-auto block w-full max-w-md h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold shadow-[0_16px_40px_rgba(168,85,247,.35)] disabled:opacity-50"
          >
            整理券を発行する
          </button>
          <div className="mt-2 text-center text-[11px] text-slate-500">
            送信で整理券番号が発行されます
          </div>
        </div>
      </div>
    </MobileOnly>
  );
}
