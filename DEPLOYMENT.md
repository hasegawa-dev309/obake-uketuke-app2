# 🚀 お化け屋敷整理券システム - 本番デプロイガイド

## 📋 概要

このガイドでは、お化け屋敷整理券システムを本番環境にデプロイする手順を説明します。

### 🏗️ アーキテクチャ
- **フロントエンド**: Vite + React (Vercel)
- **バックエンド**: NestJS (Render)
- **データベース**: Heroku Postgres
- **メール送信**: SendGrid

## 🎯 デプロイ手順

### 1. フロントエンド（Vercel）のデプロイ

#### 1.1 Vercelアカウントの準備
1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでログイン
3. 新しいプロジェクトを作成

#### 1.2 プロジェクトのインポート
1. GitHubリポジトリを選択
2. フレームワークプリセット: **Vite** を選択
3. ルートディレクトリ: `obake-uketuke-app` を指定

#### 1.3 ビルド設定
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 1.4 環境変数の設定
Vercelのダッシュボードで以下の環境変数を設定：

```bash
# 本番環境のAPI URL
VITE_API_BASE_URL=https://your-nestjs-app.onrender.com

# 開発環境のAPI URL（フォールバック）
VITE_API_BASE_URL_DEV=http://localhost:3000
```

#### 1.5 デプロイ実行
1. **Deploy** ボタンをクリック
2. ビルド完了を待つ
3. デプロイされたURLを確認

### 2. バックエンド（Render）のデプロイ

#### 2.1 Renderアカウントの準備
1. [Render](https://render.com) にアクセス
2. GitHubアカウントでログイン
3. 新しいWeb Serviceを作成

#### 2.2 サービスの設定
1. **GitHubリポジトリ**を選択
2. **Service Type**: Web Service
3. **Name**: `obake-uketuke-backend`
4. **Environment**: Docker
5. **Branch**: `main`

#### 2.3 ビルド設定
- **Build Command**: `docker build -t obake-backend .`
- **Start Command**: `docker run -p $PORT:3000 obake-backend`

#### 2.4 環境変数の設定
Renderのダッシュボードで以下の環境変数を設定：

```bash
# データベース
DATABASE_URL=postgresql://username:password@host:port/database_name

# メール設定
SENDGRID_API_KEY=your_sendgrid_api_key_here
MAIL_FROM=noreply@yourdomain.com

# アプリケーション設定
NODE_ENV=production
TZ=Asia/Tokyo

# CORS設定
CORS_ORIGIN=https://your-app.vercel.app
```

#### 2.5 デプロイ実行
1. **Create Web Service** をクリック
2. ビルド完了を待つ
3. デプロイされたURLを確認

### 3. データベース（Heroku Postgres）の設定

#### 3.1 Herokuアカウントの準備
1. [Heroku](https://heroku.com) にアクセス
2. アカウントを作成・ログイン
3. 新しいアプリを作成

#### 3.2 Postgresアドオンの追加
```bash
# Heroku CLIで実行
heroku addons:create heroku-postgresql:mini
```

#### 3.3 データベースの初期化
1. HerokuダッシュボードでPostgresを開く
2. **Settings** → **View Credentials** で接続情報を確認
3. 以下のコマンドでSQLファイルを実行：

```bash
# ローカルから実行
psql "postgresql://username:password@host:port/database_name" -f production-init.sql

# または、Heroku CLIから実行
heroku pg:psql -a your-app-name < production-init.sql
```

#### 3.4 接続URLの取得
```bash
# 環境変数として設定
heroku config:get DATABASE_URL
```

### 4. メール送信（SendGrid）の設定

#### 4.1 SendGridアカウントの準備
1. [SendGrid](https://sendgrid.com) にアクセス
2. アカウントを作成・ログイン
3. APIキーを生成

#### 4.2 ドメイン認証
1. **Settings** → **Sender Authentication**
2. **Domain Authentication** を設定
3. DNSレコードを追加

#### 4.3 APIキーの設定
1. **Settings** → **API Keys**
2. **Full Access** または **Restricted Access** でキーを生成
3. 生成されたキーをRenderの環境変数に設定

## 🔧 設定ファイルの詳細

### フロントエンド設定

#### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### `src/config/api.config.ts`
```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 
           import.meta.env.VITE_API_BASE_URL_DEV || 
           'http://localhost:3000',
  // ... その他の設定
}
```

### バックエンド設定

#### `Dockerfile`
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# ... ビルドステージ

FROM node:18-alpine AS runtime
# ... ランタイムステージ
```

#### `production-init.sql`
- テーブル作成
- 初期データ投入
- インデックス作成
- トリガー設定

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. CORSエラー
```bash
# Renderの環境変数でCORS_ORIGINを正しく設定
CORS_ORIGIN=https://your-app.vercel.app
```

#### 2. データベース接続エラー
```bash
# Heroku Postgresの接続情報を確認
heroku config:get DATABASE_URL
```

#### 3. ビルドエラー
```bash
# ローカルでビルドテスト
npm run build
```

#### 4. 環境変数が反映されない
- Vercel/Renderのダッシュボードで再デプロイ
- 環境変数の設定を確認

## 📊 監視とログ

### 1. Vercel（フロントエンド）
- **Analytics**: ページビュー、パフォーマンス
- **Functions**: サーバーレス関数のログ
- **Deployments**: デプロイ履歴

### 2. Render（バックエンド）
- **Logs**: リアルタイムログ
- **Metrics**: CPU、メモリ使用量
- **Health Checks**: ヘルスチェック結果

### 3. Heroku Postgres
- **Metrics**: データベースパフォーマンス
- **Logs**: クエリログ
- **Backups**: 自動バックアップ

## 🔒 セキュリティ設定

### 1. 環境変数の管理
- 機密情報は環境変数で管理
- `.env` ファイルはGitにコミットしない
- 本番環境では強力なパスワードを使用

### 2. CORS設定
```typescript
// 本番環境でのみ許可するドメイン
const allowedOrigins = [
  'https://your-app.vercel.app',
  'https://your-custom-domain.com'
]
```

### 3. データベースセキュリティ
- SSL接続の強制
- 最小権限の原則
- 定期的なバックアップ

## 📈 パフォーマンス最適化

### 1. フロントエンド
- コード分割（Code Splitting）
- 画像の最適化
- CDNの活用

### 2. バックエンド
- データベースインデックスの最適化
- キャッシュの活用
- 非同期処理の実装

### 3. データベース
- クエリの最適化
- 接続プールの設定
- 定期的なメンテナンス

## 🔄 CI/CD設定

### 1. GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. 自動デプロイ
- メインブランチへのプッシュで自動デプロイ
- プレビューデプロイの設定
- ロールバック機能の活用

## 📞 サポート

### 1. 公式ドキュメント
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com)

### 2. コミュニティ
- GitHub Issues
- Stack Overflow
- 各プラットフォームのフォーラム

---

## 🎉 デプロイ完了！

設定が完了したら、以下のURLでアクセスできます：

- **フロントエンド**: `https://your-app.vercel.app`
- **バックエンド**: `https://your-nestjs-app.onrender.com`
- **管理画面**: `https://your-app.vercel.app/admin/tickets`

システムが正常に動作することを確認し、必要に応じて設定を調整してください。 