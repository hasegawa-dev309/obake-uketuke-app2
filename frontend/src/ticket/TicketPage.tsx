import { useEffect, useMemo, useState } from 'react';
import { Ghost } from 'phosphor-react';
import { useParams } from 'react-router-dom';
import { publicFetch } from '../lib/api';

type TicketData = {
  ticketNo: number;
  count: number;
  status: string;
  currentNumber: number;
  systemPaused: boolean;
};

function statusMessage(ticket: TicketData): string {
  if (ticket.systemPaused) return '現在、受付は一時停止中です';
  if (ticket.status === 'キャンセル') return 'この整理券はキャンセルされています';
  if (ticket.status === '来場済') return '受付済みです';
  if (ticket.ticketNo <= ticket.currentNumber) return 'あなたの順番です。受付へお越しください';
  const remaining = ticket.ticketNo - ticket.currentNumber;
  return `あなたの順番まであと${remaining}組です`;
}

export default function TicketPage() {
  const { token = '' } = useParams();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await publicFetch(`/reservations/ticket/${encodeURIComponent(token)}`);
        const body = await response.json();
        if (!active) return;
        if (!response.ok || !body.ok) {
          setTicket(null);
          setNotFound(true);
          return;
        }
        setTicket(body.data);
        setNotFound(false);
      } catch {
        if (active) {
          setTicket(null);
          setNotFound(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [token]);

  const message = useMemo(() => ticket ? statusMessage(ticket) : '', [ticket]);

  return (
    <main className="min-h-screen bg-[#fff6ef] px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg" aria-live="polite">
        <div className="flex items-center justify-center gap-2 text-violet-700">
          <Ghost size={30} weight="fill" />
          <span className="font-bold">お化け屋敷 デジタル整理券</span>
        </div>

        {loading && <p className="py-16 text-center text-slate-600">整理券を確認しています…</p>}

        {!loading && notFound && (
          <div className="py-12 text-center">
            <h1 className="text-xl font-bold text-slate-900">整理券を確認できません</h1>
            <p className="mt-3 text-sm text-slate-600">URLの有効期限が切れているか、URLが正しくありません。</p>
          </div>
        )}

        {!loading && ticket && (
          <>
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">あなたの整理券番号</p>
              <h1 className="mt-1 text-6xl font-black text-violet-700">{ticket.ticketNo}</h1>
              <p className="mt-2 text-slate-600">受付人数：{ticket.count}名</p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-500">現在の呼び出し番号</p>
              <p className="mt-1 text-4xl font-bold text-blue-700">{ticket.currentNumber}</p>
              <p className="mt-4 font-bold text-slate-900">{message}</p>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border p-3">
                <dt className="text-xs text-slate-500">営業状態</dt>
                <dd className="mt-1 font-bold">{ticket.systemPaused ? '一時停止中' : '受付中'}</dd>
              </div>
              <div className="rounded-xl border p-3">
                <dt className="text-xs text-slate-500">呼び出し状況</dt>
                <dd className="mt-1 font-bold">{ticket.status}</dd>
              </div>
            </dl>

            <p className="mt-6 text-center text-xs text-slate-500">画面は約5秒ごとに自動更新されます。</p>
          </>
        )}
      </section>
    </main>
  );
}
