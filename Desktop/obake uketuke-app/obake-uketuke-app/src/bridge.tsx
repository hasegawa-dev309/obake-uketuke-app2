import { ticketsStore } from "./store/tickets";

function qs<T extends Element = Element>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector(sel) as T | null;
}
function findSubmitButtons(root: ParentNode = document): HTMLButtonElement[] {
  const re = /整理券\s*(を)?\s*(取得|発行)\s*|予約\s*する/i;
  return Array.from(root.querySelectorAll("button")).filter((b) => {
    const t = (b.textContent || "").replace(/\s+/g, " ").trim();
    return re.test(t);
  }) as HTMLButtonElement[];
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
  document.body.classList.add('font-sans','bg-surface-bg','text-surface-text');
  const inputCls = "h-10 w-full rounded-base border border-surface-muted bg-white px-3 outline-none focus:ring-2 focus:ring-brand";
  const selectCls = inputCls;
  const textareaCls = "w-full rounded-base border border-surface-muted bg-white p-3 outline-none focus:ring-2 focus:ring-brand";
  const buttonPrimary = "h-10 w-full rounded-base bg-brand text-white font-medium hover:opacity-90 disabled:opacity-60";

  (document.querySelectorAll('input[type="text"],input[type="email"],input[type="tel"],input[type="date"],input[type="number"]') as NodeListOf<HTMLInputElement>)
    .forEach(el => { if (!el.className.includes("rounded-base")) el.className = `${inputCls} ${el.className}`.trim(); });

  (document.querySelectorAll('select') as NodeListOf<HTMLSelectElement>)
    .forEach(el => { if (!el.className.includes("rounded-base")) el.className = `${selectCls} ${el.className}`.trim(); });

  (document.querySelectorAll('textarea') as NodeListOf<HTMLTextAreaElement>)
    .forEach(el => { if (!el.className.includes("rounded-base")) el.className = `${textareaCls} ${el.className}`.trim(); });

  Array.from(document.querySelectorAll('button'))
    .filter(b => /整理券を取得|整理券を発行|予約する/.test((b.textContent||"").trim()))
    .forEach(b => { if (!b.className.includes("bg-brand")) b.className = `${buttonPrimary} ${b.className}`.trim(); });

  document.querySelectorAll('main, form').forEach(c => {
    (c as HTMLElement).classList.add('mx-auto','max-w-3xl','px-4','pb-24');
  });
}

function debounce<F extends (...a:any)=>void>(fn:F, ms=80){
  let t:number|undefined; return (...a:Parameters<F>)=>{
    clearTimeout(t); t = window.setTimeout(()=>fn(...a), ms);
  };
}
const runStyle = debounce(styleForm, 80);

function readFieldsFromButton(btn: HTMLButtonElement) {
  const scope: ParentNode = (btn.closest("form") || document);
  const email = qs<HTMLInputElement>('input[type="email"]', scope)?.value?.trim() || "";
  const selectEl = qs<HTMLSelectElement>("select", scope);
  const numberEl = qs<HTMLInputElement>('input[type="number"]', scope);
  const people = selectEl ? Number(selectEl.value) : (numberEl ? Number(numberEl.value) : 1);
  const dateEl = qs<HTMLInputElement>('input[type="date"]', scope) 
              || qs<HTMLInputElement>('input[type="datetime-local"]', scope);
  const day = dateEl?.value ? dateEl.value.slice(0,10) : new Date().toISOString().slice(0,10);
  return { email, people, day };
}

function wireOnce(root: ParentNode = document) {
  ensureAdminFab();
  runStyle();

  const buttons = findSubmitButtons(root);
  if (buttons.length === 0) return;

  buttons.forEach((btn) => {
    if ((btn as any).__wired) return;
    (btn as any).__wired = true;

    btn.addEventListener("click", () => {
      try {
        const { email, people, day } = readFieldsFromButton(btn);
        if (!email) return;
        ticketsStore.add({ email, people, day });

        const toast = document.createElement("div");
        toast.textContent = `発行: ${email} / ${people}人 / ${day}`;
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

const observer = new MutationObserver((muts) => {
  muts.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node.nodeType === 1) wireOnce(node as Element);
    });
  });
  runStyle();
});

window.addEventListener("load", () => {
  wireOnce(document);
  observer.observe(document.documentElement, { childList: true, subtree: true });
});

if (location.pathname.startsWith("/admin")) {
  const fab = document.getElementById("__admin_fab");
  if (fab) fab.remove();
}
