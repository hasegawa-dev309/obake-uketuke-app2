import { API_CONFIG } from '../config/api.config';

const API = API_CONFIG.baseURL.replace(/\/$/, '');

// 認証付きfetchヘルパー
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    throw new Error('認証トークンがありません');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
    mode: 'cors',
    cache: 'no-store'
  });
  
  // 401エラーの場合、トークンを削除してログイン画面へ
  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expires');
    window.location.hash = '/login';
    throw new Error('認証の有効期限が切れました。再度ログインしてください。');
  }
  
  return response;
}

// 公開APIのfetch（認証不要）
export async function publicFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
    mode: 'cors',
    cache: 'no-store'
  });
  
  return response;
}

// 予約投稿（公開API）
export async function postReservation(payload: {
  email: string;
  count: number;
  age: string;
  channel?: string;
}) {
  const res = await publicFetch('/reservations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  return res.json();
}

// システム状態取得（公開API・認証不要）
export async function getSystemStatus() {
  const res = await publicFetch('/reservations/status');
  return res.json();
}

// 整理券一覧取得（管理API）
export async function fetchReservations() {
  const res = await authenticatedFetch('/reservations');
  return res.json();
}

// ステータス更新（管理API）
export async function updateReservationStatus(id: string, status: string) {
  const res = await authenticatedFetch(`/reservations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return res.json();
}

// 呼び出し番号取得（管理API）
export async function getCurrentNumber() {
  const res = await authenticatedFetch('/reservations/current-number');
  return res.json();
}

// 呼び出し番号更新（管理API）
export async function updateCurrentNumber(currentNumber: number, systemPaused: boolean) {
  const res = await authenticatedFetch('/reservations/current-number', {
    method: 'PUT',
    body: JSON.stringify({ currentNumber, systemPaused })
  });
  return res.json();
}

// カウンターリセット（管理API）
export async function resetCounter() {
  const res = await authenticatedFetch('/reservations/reset-counter', {
    method: 'POST'
  });
  return res.json();
}

// すべてのデータをクリア（POST統一・認証付き）
export async function deleteAllReservations() {
  try {
    console.log("[deleteAllReservations] リクエスト送信開始");
    const token = localStorage.getItem("admin_token") || "";
    const res = await fetch(`${API}/reservations/clear-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    
    console.log("[deleteAllReservations] レスポンス受信:", res.status, res.statusText);
    
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const msg = json?.error || `HTTP ${res.status}`;
      console.error("[deleteAllReservations] HTTPエラー:", msg);
      return { ok: false, error: msg };
    }
    
    const data = await res.json();
    console.log("[deleteAllReservations] データ取得成功:", data);
    return data;
  } catch (err: any) {
    console.error("[deleteAllReservations] ネットワークエラー:", err);
    return { ok: false, error: "network_error", detail: err.message };
  }
}

