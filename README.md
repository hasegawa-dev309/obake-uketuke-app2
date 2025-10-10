# お化け屋敷整理券システム

サイドバー付き管理UIで整理券を簡単に管理できるWebアプリケーションです。

## 🚀 Herokuデプロイ方法

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

## ✨ 特徴

- **サイドバー付き管理UI**: 直感的なナビゲーション
- **整理券管理**: メトリクス表示・検索・エクスポート機能
- **呼び出し管理**: リアルタイムな呼び出し番号管理
- **メール送信**: 整理券発行時の自動メール通知
- **レスポンシブデザイン**: スマホ・タブレット・PCに対応
- **モバイルフレンドリー**: タッチ操作に最適化
- **高速読み込み**: HerokuのCDNで高速配信

## 🛠️ 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Node.js + Express + TypeScript
- **スタイリング**: Tailwind CSS v3.4.18
- **ルーティング**: React Router v6
- **アイコン**: Heroicons + Phosphor Icons
- **デプロイ**: Heroku (統合アプリ)
- **API**: Express.js REST API
- **静的配信**: Express.js静的ファイル配信

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

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

## 📄 ライセンス

MIT License