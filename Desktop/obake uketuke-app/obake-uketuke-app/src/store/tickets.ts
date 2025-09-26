/**
 * クライアントサイド簡易ストア：
 * - localStorage 保存 (key: 'tickets:v1')
 * - BroadcastChannel('tickets') で他タブ同期
 */

export type Ticket = {
  id: string;
  email: string;
  people: number;
  ageGroup: "高校生以下" | "大学生" | "一般";
  status: "queued" | "arrived" | "no-show";
  createdAt: number; // epoch ms
};

const LS_KEY = "tickets:v1";
const CH = typeof window !== "undefined" ? new BroadcastChannel("tickets") : null;

function load(): Ticket[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Ticket[]; }
  catch { return []; }
}
function save(data: Ticket[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  CH?.postMessage({ type: "sync" });
}

export const ticketsStore = {
  getAll(): Ticket[] { return load().sort((a,b)=>a.createdAt-b.createdAt); },
  add(t: { email: string; people: number; ageGroup: Ticket["ageGroup"] }): Ticket {
    const all = load();
    const newT: Ticket = {
      id: crypto.randomUUID(),
      email: t.email,
      people: t.people,
      ageGroup: t.ageGroup,
      status: "queued",
      createdAt: Date.now(),
    };
    all.push(newT); save(all);
    return newT;
  },
  update(id: string, patch: Partial<Ticket>) {
    const all = load();
    const idx = all.findIndex(x=>x.id===id);
    if (idx>=0) { all[idx] = { ...all[idx], ...patch }; save(all); }
  },
  onChange(cb: ()=>void) {
    const handler = (e: MessageEvent)=>{ if (e.data?.type==="sync") cb(); };
    CH?.addEventListener("message", handler);
    window.addEventListener("storage", (ev)=>{ if (ev.key===LS_KEY) cb(); });
    return ()=>{ CH?.removeEventListener("message", handler); };
  }
};

export function segment(all: Ticket[]) {
  return {
    queued: all.filter(t=>t.status==="queued"),
    arrived: all.filter(t=>t.status==="arrived"),
    noShow:  all.filter(t=>t.status==="no-show"),
  };
}
