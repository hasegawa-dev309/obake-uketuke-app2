import React, { useState } from "react";
import { ticketsStore } from "../store/tickets";

export default function ReservationForm() {
  const [form, setForm] = useState({ email: "", people: "1", ageGroup: "" });
  const [sending, setSending] = useState(false);

  const change = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>{
    const { name, value } = e.target;
    setForm(s=>({ ...s, [name]: value }));
  };

  const submit = (e: React.FormEvent)=>{
    e.preventDefault();
    if (!form.email || !form.ageGroup) return;
    setSending(true);
    ticketsStore.add({
      email: form.email.trim(),
      people: Number(form.people),
      ageGroup: form.ageGroup as any
    });
    setTimeout(()=>{ setSending(false); location.assign("/reservation/complete"); }, 200);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <section className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(2,6,23,0.12)] overflow-hidden">
        {/* Header row */}
        <div className="px-5 py-5 border-b flex items-center gap-3">
          <span className="text-2xl">👻</span>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">お化け屋敷整理券フォーム</h1>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-4">
              <div>📅 {new Date().toLocaleDateString("ja-JP")}</div>
              <div>🕑 {new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="p-5 space-y-4">
          {/* email */}
          <label className="block">
            <span className="text-sm text-slate-600 flex items-center gap-2 mb-1">✉️ メールアドレス</span>
            <input
              type="email" required name="email" value={form.email} onChange={change}
              className="w-full h-12 px-3 rounded-base border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="you@example.com"
            />
          </label>

          {/* people */}
          <label className="block">
            <span className="text-sm text-slate-600 flex items-center gap-2 mb-1">👥 人数</span>
            <select
              name="people" value={form.people} onChange={change}
              className="w-full h-12 px-3 rounded-base border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}名</option>)}
            </select>
          </label>

          {/* ageGroup */}
          <label className="block">
            <span className="text-sm text-slate-600 flex items-center gap-2 mb-1">🧑‍🎓 年齢層</span>
            <select
              required name="ageGroup" value={form.ageGroup} onChange={change}
              className="w-full h-12 px-3 rounded-base border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">選択してください</option>
              <option value="高校生以下">高校生以下</option>
              <option value="大学生">大学生</option>
              <option value="一般">一般</option>
            </select>
          </label>

          {/* submit */}
          <button
            data-primary
            disabled={sending}
            className="w-full h-12 rounded-base text-white font-semibold shadow-card
                       bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500
                       hover:opacity-90 active:scale-[.99] transition"
          >
            👻 整理券を発行する
          </button>
        </form>
      </section>
    </div>
  );
}
