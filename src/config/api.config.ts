// API設定の統一管理
export const API_CONFIG = {
  // 本番環境では VITE_API_BASE_URL、開発環境では VITE_API_BASE_URL_DEV を使用
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_DEV || 'http://localhost:3001',
  
  // API エンドポイント
  endpoints: {
    reservations: '/reservations',
    adminReservations: '/admin/reservations',
    status: '/status',
    health: '/health',
    ageGroups: '/age-groups',
    callStatus: '/call-status',
    systemStatus: '/system-status',
    checkins: '/checkins'
  },
  
  // タイムアウト設定
  timeout: 10000,
  
  // ヘッダー設定
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const

// 環境変数の確認用
export const ENV_INFO = {
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  apiBaseUrl: API_CONFIG.baseURL,
  nodeEnv: import.meta.env.MODE
} 