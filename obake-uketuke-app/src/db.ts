import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined,
  // 1日2000人対応の接続プール設定
  max: 15, // 最大接続数（Free Tier: 20のうち15を使用）
  min: 2,  // 最小接続数
  idleTimeoutMillis: 30000, // 30秒でアイドル接続を閉じる
  connectionTimeoutMillis: 2000, // 2秒で接続タイムアウト
});

// 接続テスト関数
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully:', result.rows[0]);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
}
