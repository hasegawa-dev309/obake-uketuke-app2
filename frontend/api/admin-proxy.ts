import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS対応
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const adminPassword = req.headers["x-admin-password"] as string || "";
    if (!adminPassword || adminPassword !== (process.env.ADMIN_PASSWORD || "obake2025")) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    const action = req.body?.action;

    if (action === "clear_all") {
      // Heroku API に中継
      const herokuResponse = await fetch(`${process.env.HEROKU_API_BASE || 'https://obake-uketuke-app-ae91e2b5463a.herokuapp.com'}/api/reservations/clear-all`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ADMIN_TOKEN || ''}`
        },
        body: JSON.stringify({ _method: "DELETE" }),
      });

      const data = await herokuResponse.json().catch(() => ({}));
      
      if (!herokuResponse.ok || !data?.ok) {
        return res.status(502).json({ ok: false, error: "heroku_call_failed", detail: data });
      }
      
      return res.status(200).json({ ok: true, result: "cleared" });
    }

    return res.status(400).json({ ok: false, error: "unknown_action" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "proxy_error", message: e?.message });
  }
}
