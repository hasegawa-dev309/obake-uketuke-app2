// Vercel Serverless Function: 管理系アクションの中継
// 期待するリクエスト: POST JSON { action: "clear_all" }
// 認証: ヘッダー "x-admin-password": process.env.ADMIN_PASSWORD と一致

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), { status: 405 });
    }

    const adminPassword = req.headers.get("x-admin-password") || "";
    if (!adminPassword || adminPassword !== (process.env.ADMIN_PASSWORD || "")) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "clear_all") {
      // Heroku API に中継（DELETE 由来の問題を避けるため POST + _method=DELETE 方式）
      const res = await fetch(`${process.env.HEROKU_API_BASE}/api/reservations/clear-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _method: "DELETE" }),
        // 失敗を掴みやすくする
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        return new Response(JSON.stringify({ ok: false, error: "heroku_call_failed", detail: data }), { status: 502 });
      }
      return new Response(JSON.stringify({ ok: true, result: "cleared" }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: false, error: "unknown_action" }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: "proxy_error", message: e?.message }), { status: 500 });
  }
}
