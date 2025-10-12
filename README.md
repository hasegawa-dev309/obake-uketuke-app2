# Obake Uketsuke - お化け屋敷整理券システム

第61回 東洋大学 白山祭で使用された、お化け屋敷の整理券予約・管理システムです。  
リアルタイムで整理券の発行・呼び出し・管理ができるWebアプリケーションです。

## 🔧 主な機能

### 📱 一般ユーザー向け機能
- **整理券予約**: メールアドレス、人数、年齢層を入力して整理券を取得
- **予約完了画面**: 整理券番号と現在の呼び出し状況を表示
- **リアルタイム更新**: 現在の呼び出し番号を3秒ごとに自動更新
- **多デバイス対応**: PC・スマートフォン・タブレットに対応
- **チャンネル追跡**: デバイスタイプを自動判定して記録

### 🛠 管理者向け機能
- **整理券管理**: 全整理券の一覧表示・検索・フィルタリング
- **呼び出し管理**: 現在の呼び出し番号の管理・一時停止機能
- **整理券発行**: 管理者による直接的な整理券発行
- **統計表示**: 年齢層別・来場状況別・時間別の統計情報
- **CSVエクスポート**: 整理券データの一括エクスポート
- **JWT認証**: セキュアな管理者ログイン機能

## ✨ 特徴

- **マルチデバイス対応**: PC・スマートフォン・タブレットで同じデータを共有
- **リアルタイム同期**: 複数デバイス間でのリアルタイムデータ同期
- **日本時間対応**: 登録時間をJST（日本標準時）で表示
- **レスポンシブデザイン**: あらゆる画面サイズに対応
- **高速パフォーマンス**: Vite + React による高速読み込み
- **セキュア**: JWT認証とCORS設定による安全なAPI通信

## 🛠 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** - 高速ビルドツール
- **React Router v6** - クライアントサイドルーティング
- **Tailwind CSS v3.4.18** - ユーティリティファーストCSS
- **Phosphor Icons** - モダンなアイコンセット

### バックエンド
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** - データベース（Heroku Postgres）
- **JWT** - 認証トークン管理
- **CORS** - クロスオリジンリソース共有
- **express-rate-limit** - APIレート制限

### インフラ・デプロイ
- **Vercel** - フロントエンドホスティング
- **Heroku** - バックエンドAPIホスティング
- **GitHub Actions** - CI/CD（自動デプロイ）
- **PostgreSQL** - データベース（Heroku Postgres）

## 🚀 ライブデモ

### 📱 一般ユーザー向け
- **予約フォーム**: [https://obake-uketuke-app2-iveo.vercel.app/](https://obake-uketuke-app2-iveo.vercel.app/)
- **予約完了画面**: 予約後に自動表示

### 🛠 管理者向け
- **管理画面**: [https://obake-uketuke-app2-iveo.vercel.app/admin.html](https://obake-uketuke-app2-iveo.vercel.app/admin.html)
- **ログインパスワード**: `obake2025`

### 🔧 API エンドポイント
- **ヘルスチェック**: [https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/api/health](https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/api/health)

## 📊 データベーススキーマ

### reservations テーブル
```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  ticket_no INTEGER NOT NULL,
  email VARCHAR(255) NOT NULL,
  count INTEGER NOT NULL,
  age VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT '未呼出',
  channel VARCHAR(50) DEFAULT 'web',
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  called_at TIMESTAMP
);
```

## 🔐 認証・セキュリティ

### 管理者認証
- **JWT認証**: 12時間有効なトークン
- **パスワード**: 環境変数で管理
- **自動ログアウト**: トークン期限切れ時

### API セキュリティ
- **CORS設定**: Vercelドメインとlocalhostのみ許可
- **レート制限**: 公開APIに30秒間5リクエスト制限
- **入力検証**: サーバーサイドでのデータ検証

## 🚀 デプロイ方法

### 1. リポジトリのクローン
```bash
git clone https://github.com/hasegawa-dev309/obake-uketuke-app2.git
cd obake-uketuke-app2
```

### 2. 依存関係のインストール
```bash
# ルートディレクトリ
npm install

# フロントエンド
cd frontend
npm install

# バックエンド
cd ../obake-uketuke-app
npm install
```

### 3. 環境変数の設定

#### Vercel（フロントエンド）
```
VITE_API_URL=https://your-heroku-app.herokuapp.com/api
```

#### Heroku（バックエンド）
```
DATABASE_URL=postgres://...
ADMIN_PASSWORD=your-secure-password
ADMIN_JWT_SECRET=your-jwt-secret
```

### 4. デプロイ

#### Vercelへのデプロイ
```bash
# Vercel CLIを使用
npm install -g vercel
vercel --prod
```

#### Herokuへのデプロイ
```bash
# Heroku CLIを使用
heroku create your-app-name
git push heroku main
```

## 🏗️ プロジェクト構成

```
obake-uketuke-app2/
├── frontend/                    # React フロントエンド
│   ├── src/
│   │   ├── admin/              # 管理者向けページ
│   │   ├── reservation/        # 予約関連コンポーネント
│   │   ├── components/         # 共通コンポーネント
│   │   ├── lib/                # API・ユーティリティ
│   │   └── types/              # TypeScript型定義
│   ├── dist/                   # ビルド出力
│   └── package.json
├── obake-uketuke-app/          # Express バックエンド
│   ├── src/
│   │   ├── routes/             # API ルート
│   │   ├── middleware/         # 認証・検証ミドルウェア
│   │   └── main.ts             # エントリーポイント
│   ├── dist/                   # ビルド出力
│   └── package.json
├── schema.sql                  # データベーススキーマ
├── migration.sql               # マイグレーション
└── README.md
```

## 🔧 開発環境

### ローカル開発サーバー起動
```bash
# フロントエンド（開発サーバー）
cd frontend
npm run dev

# バックエンド（開発サーバー）
cd obake-uketuke-app
npm run dev
```

### 本番ビルド
```bash
# フロントエンドビルド
cd frontend
npm run build

# バックエンドビルド
cd obake-uketuke-app
npm run build
```

## 📱 使用方法

### 一般ユーザー
1. 予約フォームにアクセス
2. メールアドレス、人数、年齢層を入力
3. 「整理券を発行」ボタンをクリック
4. 整理券番号を確認し、呼び出しを待つ

### 管理者
1. 管理画面にアクセス
2. パスワード `obake2025` でログイン
3. 整理券管理・呼び出し管理・統計確認を行う
4. 必要に応じてCSVエクスポートを実行

## 🎯 想定ユースケース

- **大学祭・文化祭**: 混雑緩和と来場者体験向上
- **イベント運営**: 整理券による効率的な受付管理
- **マルチデバイス環境**: 様々なデバイスからのアクセス対応
- **リアルタイム管理**: 複数スタッフでの同時運用

## 📈 パフォーマンス

- **フロントエンド**: Viteによる高速ビルド・HMR
- **API**: PostgreSQLインデックスによる高速クエリ
- **キャッシュ**: ブラウザキャッシュとCDN活用
- **レスポンス**: 平均レスポンス時間 < 200ms

## 🔄 更新履歴

### v1.0.0 (2025/10/12)
- ✅ 基本機能実装完了
- ✅ マルチデバイス対応
- ✅ 日本時間表示対応
- ✅ JWT認証実装
- ✅ 統計・エクスポート機能
- ✅ 本番デプロイ完了

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

### 開発に参加する場合
1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👥 開発者

**第61回 東洋大学 白山祭 実行委員会**
- お化け屋敷整理券システム開発チーム

---

**📞 お問い合わせ**: システムに関するお問い合わせは、GitHubのIssuesまでお願いします。