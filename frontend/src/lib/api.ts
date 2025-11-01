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
  
  // HTTPエラーステータスのチェック
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'ネットワークエラーが発生しました' }));
    console.error('❌ [postReservation] HTTPエラー:', res.status, errorData);
    return {
      ok: false,
      error: errorData.error || errorData.message || `HTTPエラー: ${res.status}`,
      details: errorData.details
    };
  }
  
  const data = await res.json();
  console.log('✅ [postReservation] 成功:', data);
  return data;
}

// システム状態取得（公開API・認証不要）
export async function getSystemStatus() {
  const res = await publicFetch('/reservations/status');
  return res.json();
}

// 整理券一覧取得（管理API）
export async function fetchReservations() {
  try {
    const res = await authenticatedFetch('/reservations');
    
    // HTTPエラーステータスのチェック
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'ネットワークエラーが発生しました' }));
      console.error('❌ [fetchReservations] HTTPエラー:', res.status, errorData);
      return {
        ok: false,
        error: errorData.error || errorData.message || `HTTPエラー: ${res.status}`,
        details: errorData.details
      };
    }
    
    const data = await res.json();
    console.log('✅ [fetchReservations] 成功:', data);
    return data;
  } catch (err: any) {
    console.error('❌ [fetchReservations] 例外エラー:', err);
    return {
      ok: false,
      error: err.message || '予約データの取得に失敗しました',
      details: err.stack
    };
  }
}

// ステータス更新（管理API）
export async function updateReservationStatus(id: string, status: string) {
  const res = await authenticatedFetch(`/reservations/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
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

// 個別整理券削除（管理API）
export async function deleteReservation(id: string) {
  const res = await authenticatedFetch(`/reservations/${id}`, {
    method: 'DELETE'
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

// 全データ削除（管理API）
export async function clearAllData() {
  const res = await authenticatedFetch('/reservations/clear-all', {
    method: 'POST'
  });
  return res.json();
}


