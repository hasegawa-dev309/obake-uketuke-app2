import { API_CONFIG } from '../config/api.config';

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
    ...API_CONFIG.headers,
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    ...options,
    headers,
    mode: 'cors',
    credentials: 'include'
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
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    mode: 'cors'
  });
  
  return response;
}

