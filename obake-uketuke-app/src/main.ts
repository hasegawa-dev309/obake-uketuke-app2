import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { testConnection } from './db';
import reservationsRouter from './routes/reservations';

// 環境変数を読み込み
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

// CORS設定（すべてのオリジンを許可）
app.use(cors({
  origin: true,  // すべてのオリジンを許可
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// JSONパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信（フロントエンド）
app.use(express.static(path.join(__dirname, '..', 'public')));

// ヘルスチェックAPI
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 整理券関連のAPI
app.use('/api/reservations', reservationsRouter);

// 管理画面用のAPI（レガシーサポート）
app.get('/api/admin/tickets', async (req, res) => {
  // 既存のフロントエンドとの互換性のため、reservationsにリダイレクト
  try {
    const response = await fetch(`http://localhost:${port}/api/reservations`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "API error" });
  }
});

app.put('/api/admin/tickets/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const response = await fetch(`http://localhost:${port}/api/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "API error" });
  }
});

// 呼び出し管理用のAPI（LocalStorage併用）
app.get('/api/admin/call/current', (req, res) => {
  // フロントエンドのLocalStorageで管理されているため、ダミーレスポンス
  res.json({ current: 1 });
});

app.put('/api/admin/call/current', (req, res) => {
  const { current } = req.body;
  // フロントエンドのLocalStorageで管理されているため、ダミーレスポンス
  res.json({ current });
});

// すべてのルートをフロントエンドにリダイレクト（SPA対応）
app.get('*', (req, res) => {
  // APIルート以外はindex.htmlを返す
  if (!req.path.startsWith('/api')) {
    // HTMLファイルへのリクエストの場合、該当するHTMLファイルを返す
    if (req.path.endsWith('.html')) {
      res.sendFile(path.join(__dirname, '..', 'public', req.path));
    } else {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
  }
});

// サーバー起動
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // データベース接続テスト
  const dbConnected = await testConnection();
  if (!dbConnected && process.env.DATABASE_URL) {
    console.warn('⚠️  Database connection failed. Check DATABASE_URL.');
  }
});

export default app;