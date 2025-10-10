import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

// CORS設定
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// JSONパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信（フロントエンド）
app.use(express.static(path.join(__dirname, '..', 'public')));

// API ルート
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// 整理券関連のAPI
app.get('/api/reservations', (req, res) => {
  // モックデータまたはDBからの取得
  res.json([]);
});

app.post('/api/reservations', (req, res) => {
  // 整理券の作成
  const { email, count, age } = req.body;
  
  // 基本的なバリデーション
  if (!email || !count || !age) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // レスポンス（実際の実装ではDBに保存）
  const reservation = {
    id: Date.now().toString(),
    email,
    count,
    age,
    status: '未呼出',
    createdAt: new Date().toISOString(),
    ticketNo: Date.now().toString()
  };
  
  res.json(reservation);
});

// 管理画面用のAPI
app.get('/api/admin/tickets', (req, res) => {
  // モックデータ
  res.json([]);
});

app.put('/api/admin/tickets/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // ステータス更新のロジック
  res.json({ id, status, updated: true });
});

// 呼び出し管理用のAPI
app.get('/api/admin/call/current', (req, res) => {
  res.json({ current: 1 });
});

app.put('/api/admin/call/current', (req, res) => {
  const { current } = req.body;
  res.json({ current });
});

// すべてのルートをフロントエンドにリダイレクト（SPA対応）
app.get('*', (req, res) => {
  // APIルート以外はindex.htmlを返す
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
