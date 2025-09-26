import React, { useState } from "react";
import { ticketsStore } from "../store/tickets";

const ReservationForm: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    people: "1",
    ageGroup: "",
  });
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.ageGroup) return;
    setSending(true);
    try {
      ticketsStore.add({
        email: form.email.trim(),
        people: Number(form.people),
        ageGroup: form.ageGroup as any,
      });
      console.log("Reservation saved:", form);
      alert("整理券を登録しました。管理画面で確認できます。");
      // 必要ならここでフォーム初期化
      // setForm({ email:"", people:"1", ageGroup:"" });
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-surface-card shadow-card rounded-base space-y-4"
    >
      <h2 className="text-xl font-bold text-center">整理券取得</h2>

      <input
        type="email"
        name="email"
        placeholder="メールアドレス"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full h-10 px-3 border border-surface-muted rounded-base focus:ring-2 focus:ring-brand"
      />

      <select
        name="people"
        value={form.people}
        onChange={handleChange}
        className="w-full h-10 px-3 border border-surface-muted rounded-base focus:ring-2 focus:ring-brand"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}人
          </option>
        ))}
      </select>

      <select
        name="ageGroup"
        value={form.ageGroup}
        onChange={handleChange}
        required
        className="w-full h-10 px-3 border border-surface-muted rounded-base focus:ring-2 focus:ring-brand"
      >
        <option value="">年齢層を選択してください</option>
        <option value="高校生以下">高校生以下</option>
        <option value="大学生">大学生</option>
        <option value="一般">一般</option>
      </select>

      <button
        type="submit"
        disabled={sending}
        className="w-full bg-brand text-white font-medium py-2 px-4 rounded-base hover:opacity-90 disabled:opacity-60"
      >
        整理券を取得する
      </button>
    </form>
  );
};

export default ReservationForm;
