/**
 * App.tsx は変更しない前提で、既存DOMから値を読んで ticketsStore に保存するブリッジ。
 * - メール: 最初の input[type=email]
 * - 人数: 最初の select
 * - 日付: 最初の input[type=date]
 * - 送信ボタン: 「整理券を発行」または「予約する」という文言を含む button
 * また、右下に管理画面 (/admin) へ飛ぶフローティングボタンを描画。
 * さらに、フォームUIを自動整形してTailwind CSSクラスを適用する。
 */
import { ticketsStore } from "./store/tickets";

function qs(sel: string): HTMLElement | null {
  return document.querySelector(sel);
}
function findSubmitButtons(): HTMLButtonElement[] {
  const candidates = Array.from(document.querySelectorAll("button")) as HTMLButtonElement[];
  return candidates.filter(b=>{
    const t = (b.textContent || "").trim();
    return /整理券を発行|予約する|整理券を取得/.test(t);
  });
}
function ensureAdminFab() {
  if (document.getElementById("__admin_fab")) return;
  const a = document.createElement("a");
  a.id = "__admin_fab";
  a.href = "/admin";
  a.textContent = "管理画面へ";
  Object.assign(a.style, {
    position:"fixed", right:"16px", bottom:"16px", zIndex:"9999",
    padding:"10px 14px", borderRadius:"12px",
    background:"#2563eb", color:"#fff", textDecoration:"none",
    boxShadow:"0 6px 18px rgba(2,6,23,.18)", fontSize:"14px", fontWeight:"600"
  });
  document.body.appendChild(a);
}

function styleForm() {
  // ボディに基本スタイルを適用
  document.body.classList.add('font-sans','bg-surface-bg','text-surface-text');

  // フォーム要素のスタイル定義
  const inputCls = "h-10 w-full rounded-base border border-surface-muted bg-white px-3 outline-none focus:ring-2 focus:ring-brand";
  const selectCls = inputCls;
  const textareaCls = "w-full rounded-base border border-surface-muted bg-white p-3 outline-none focus:ring-2 focus:ring-brand";
  const buttonPrimary = "h-10 w-full rounded-base bg-brand text-white font-medium hover:opacity-90 disabled:opacity-60";

  // input要素にスタイルを適用
  (document.querySelectorAll('input[type="text"],input[type="email"],input[type="tel"],input[type="date"]') as NodeListOf<HTMLInputElement>)
    .forEach(el => { 
      if (!el.className.includes("rounded-base")) {
        el.className = `${inputCls} ${el.className}`.trim(); 
      }
    });

  // select要素にスタイルを適用
  (document.querySelectorAll('select') as NodeListOf<HTMLSelectElement>)
    .forEach(el => { 
      if (!el.className.includes("rounded-base")) {
        el.className = `${selectCls} ${el.className}`.trim(); 
      }
    });

  // textarea要素にスタイルを適用
  (document.querySelectorAll('textarea') as NodeListOf<HTMLTextAreaElement>)
    .forEach(el => { 
      if (!el.className.includes("rounded-base")) {
        el.className = `${textareaCls} ${el.className}`.trim(); 
      }
    });

  // 送信ボタンにスタイルを適用
  Array.from(document.querySelectorAll('button'))
    .filter(b => /整理券を取得|整理券を発行|予約する/.test((b.textContent||"").trim()))
    .forEach(b => { 
      if (!b.className.includes("bg-brand")) {
        b.className = `${buttonPrimary} ${b.className}`.trim(); 
      }
    });

  // メインコンテナにレイアウトクラスを適用
  document.querySelectorAll('main, form').forEach(c => {
    (c as HTMLElement).classList.add('mx-auto','max-w-3xl','px-4','pb-24');
  });
}

function wireOnce() {
  ensureAdminFab();
  styleForm(); // スタイル適用を追加

  const email = qs("input[type=email]") as HTMLInputElement | null;
  const select = qs("select") as HTMLSelectElement | null;
  const date   = qs("input[type=date]") as HTMLInputElement | null;

  const submitters = findSubmitButtons();
  if (submitters.length===0) return;

  submitters.forEach(btn=>{
    if ((btn as any).__wired) return;
    (btn as any).__wired = true;
    btn.addEventListener("click", ()=>{
      try {
        const emailVal = email?.value?.trim() || "";
        const peopleVal = select ? Number(select.value) : 1;
        const dayVal = date?.value || new Date().toISOString().slice(0,10);
        if (!emailVal) return; // 必須が空なら何もしない（UI側はApp.tsxに任せる）

        ticketsStore.add({ email: emailVal, people: peopleVal, day: dayVal });
        // 簡易トースト
        const toast = document.createElement("div");
        toast.textContent = `発行: ${emailVal} / ${peopleVal}人 / ${dayVal}`;
        Object.assign(toast.style, {
          position:"fixed", left:"50%", transform:"translateX(-50%)",
          bottom:"80px", background:"#111827", color:"#fff",
          padding:"10px 14px", borderRadius:"10px", zIndex:"9999"
        });
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(), 2000);
      } catch {}
    });
  });
}

// 初期化：DOM変化にも追従
const obs = new MutationObserver(()=>wireOnce());
obs.observe(document.documentElement, { childList:true, subtree:true });
window.addEventListener("load", wireOnce);

// スタイル適用のためのMutationObserver
const styleObs = new MutationObserver(() => styleForm());
styleObs.observe(document.documentElement, { childList:true, subtree:true });
