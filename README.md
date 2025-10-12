# Obake Uketsuke - お化け屋敷予約システム

文化祭の混雑を解消するために開発した、お化け屋敷の受付予約アプリです。  
サイドバー付き管理UIで整理券を簡単に管理できるWebアプリケーションです。

## 🔧 主な機能

- **整理券管理**: メトリクス表示・検索・エクスポート機能
- **呼び出し管理**: リアルタイムな呼び出し番号管理
- **名前・人数・メールアドレスの入力**
- **時間枠の選択・満枠時の受付停止**
- **予約完了時にメール送信**
- **管理者用ダッシュボードで予約状況の確認**
- **チェックイン管理（QRコード読み取り or 手動）**

## ✨ 特徴

- **サイドバー付き管理UI**: 直感的なナビゲーション
- **レスポンシブデザイン**: スマホ・タブレット・PCに対応
- **モバイルフレンドリー**: タッチ操作に最適化
- **高速読み込み**: CDNで高速配信

## 🛠 使用技術

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Node.js + Express + TypeScript
- **スタイリング**: Tailwind CSS v3.4.18
- **ルーティング**: React Router v6
- **アイコン**: Heroicons + Phosphor Icons
- **データベース**: PostgreSQL（Heroku）
- **インフラ**: Vercel（フロントエンド）, Heroku（バックエンドAPI）, GitHub Actions（CI/CD）

## 🚀 デプロイ方法

### Vercelデプロイ（フロントエンド）+ Heroku（バックエンドAPI）

このプロジェクトは、フロントエンドをVercel、バックエンドAPIをHerokuで動作させる構成です。

#### 1. GitHubリポジトリを作成

1. [GitHub](https://github.com)にアクセス
2. **New repository**をクリック
3. Repository nameを`obake-uketuke-app`に設定
4. Public/Privateを選択
5. **Create repository**をクリック

#### 2. GitHubにプッシュ

```bash
# リポジトリのルートで実行
cd "/path/to/obake-uketuke-app"

# GitHubリモートを登録
git remote add origin https://github.com/<YOUR-USERNAME>/obake-uketuke-app.git

# メインブランチとしてプッシュ
git branch -M main
git push -u origin main
```

#### 3. Vercelにデプロイ

1. [Vercel](https://vercel.com)にログイン（GitHub連携推奨）
2. 右上の**Add New** → **Project**
3. **Import Git Repository**で`obake-uketuke-app`を選択
4. 設定画面で以下を入力：

**General**
- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

**Environment Variables**
- Key: `VITE_API_URL`
- Value: `https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/api`

5. **Deploy**をクリック

#### 4. デプロイ完了

VercelのビルドがT完了すると、URLが発行されます（例：`https://obake-uketuke-app.vercel.app/`）

---

## 🚀 Herokuデプロイ方法（バックエンドAPI）

### 1. 必要な準備

1. [Heroku](https://heroku.com)アカウントを作成
2. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)をインストール
3. GitHubアカウントでログイン

### 2. ローカルでの準備

```bash
# Herokuにログイン
heroku login

# Gitリポジトリを初期化（まだの場合）
git init

# ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit for Heroku deployment"
```

### 3. Herokuアプリの作成とデプロイ

```bash
# Herokuアプリを作成
heroku create obake-uketuke-app

# メインブランチをHerokuにプッシュ
git push heroku main

# Webプロセスをスケール
heroku ps:scale web=1

# アプリを開く
heroku open
```

### 4. デプロイ完了

デプロイが完了すると、以下のようなURLでアクセスできます：
- `https://obake-uketuke-app.herokuapp.com`

## 📱 アクセス可能なURL

デプロイ後、以下のURLでアクセスできます：

- **🏠 ホーム**: `https://obake-uketuke-app.herokuapp.com/`
- **🎫 一般予約フォーム**: `https://obake-uketuke-app.herokuapp.com/reservation.html`
- **📊 管理画面**: `https://obake-uketuke-app.herokuapp.com/admin.html`
- **🔧 ヘルスチェック**: `https://obake-uketuke-app.herokuapp.com/api/health`

## 🔧 開発環境

```bash
# フロントエンド開発サーバーを起動
npm run dev

# バックエンド開発サーバーを起動
npm run dev:backend

# 本番ビルド
npm run build

# 本番サーバーを起動
npm start
```

## 🏗️ プロジェクト構成

```
/
├── frontend/          # React + Vite フロントエンド
│   ├── src/          # ソースコード
│   ├── dist/         # ビルド出力（backend/publicにコピーされる）
│   └── package.json  # フロントエンド依存関係
├── backend/          # Express.js バックエンド
│   ├── src/          # ソースコード
│   ├── dist/         # ビルド出力
│   ├── public/       # フロントエンド静的ファイル（ビルド時にコピー）
│   └── package.json  # バックエンド依存関係
├── Procfile          # Heroku起動設定
└── package.json      # ルート設定（ビルド・デプロイ用）
```

## 📝 注意事項

### 本番環境での動作
- フロントエンドとバックエンドが統合されたアプリとして動作
- `/api/*` パスでバックエンドAPIにアクセス
- 静的ファイルはExpress.jsで配信
- 環境変数は `process.env` で管理

### 開発環境での動作
- フロントエンド: `http://localhost:5174`
- バックエンド: `http://localhost:3000`
- ViteのプロキシでAPI呼び出し

## 💡 想定ユースケース

- 高校の文化祭など、短期間で多くの来場者が見込まれるイベント
- スマホ予約が可能で、運営の負担も最小限に抑えられる

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

## 📄 ライセンス

MIT License
