import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { testConnection } from './db';
import reservationsRouter from './routes/reservations';
import authRouter from './routes/auth';

// 環境変数を読み込み
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

// CORS設定（Vercelドメインのみ許可）
const allowedOrigins = [
  'https://obake-uketuke-app2-iveo.vercel.app',
  'https://obake-uketuke-app2-iveo-git-main-hasegawa-dev309s-projects.vercel.app',
  /^https:\/\/.*\.vercel\.app$/,  // すべてのVercelプレビューURL
];

app.use(cors({
  origin: (origin, callback) => {
    // オリジンがない場合（同一オリジン）またはHerokuからのリクエストは許可
    if (!origin || origin.includes('herokuapp.com')) {
      return callback(null, true);
    }
    
    // 許可されたオリジンかチェック
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// レート制限（公開API用）
const publicLimiter = rateLimit({
  windowMs: 30 * 1000, // 30秒
  max: 5, // 30秒間に5回まで
  message: { error: '送信回数が多すぎます。しばらく待ってから再度お試しください。' },
  standardHeaders: true,
  legacyHeaders: false,
});

// JSONパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信（フロントエンド）
app.use(express.static(path.join(__dirname, '..', 'public')));

// ヘルスチェックAPI（公開）
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 認証関連のAPI
app.use('/api/admin', authRouter);

// 整理券関連のAPI（公開予約 + 管理機能は認証付き）
app.use('/api/reservations', reservationsRouter);

// レート制限を公開予約エンドポイントに適用
app.post('/api/reservations', publicLimiter);

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