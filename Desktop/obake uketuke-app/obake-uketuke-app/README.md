# お化け屋敷整理券システム

## 📱 モバイル対応・PWA機能

このアプリケーションは、モバイルデバイスに最適化されたPWA（Progressive Web App）として設計されています。

### 🚀 主な機能

- **レスポンシブデザイン**: デスクトップとモバイルの両方に対応
- **PWA対応**: ホーム画面にインストール可能
- **オフライン対応**: Service Workerによるキャッシュ機能
- **タッチ操作最適化**: モバイルでの使いやすさを重視
- **ネイティブアプリ体験**: スムーズなアニメーションとインタラクション

### 📱 モバイル専用機能

#### 1. モバイルレイアウト
- 専用のヘッダーとボトムナビゲーション
- タッチ操作に最適化されたボタンサイズ
- スワイプジェスチャー対応

#### 2. PWA機能
- **インストールプロンプト**: アプリのインストールを促す
- **オフラインキャッシュ**: 重要なリソースをキャッシュ
- **プッシュ通知**: 予約状況の更新通知（実装予定）

#### 3. モバイル最適化コンポーネント
- `MobileLayout`: モバイル専用レイアウト
- `MobileHomePage`: タッチ操作に最適化されたホームページ
- `MobileReservationForm`: モバイル用予約フォーム
- `MobileComplete`: 予約完了ページ
- `MobileMyPage`: マイページ
- `MobileInstallPrompt`: PWAインストールプロンプト

### 🛠️ 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **ルーティング**: React Router DOM
- **ビルドツール**: Vite
- **PWA**: Service Worker + Web App Manifest

### 📦 インストール

```bash
npm install
```

### 🚀 開発サーバー起動

```bash
npm run dev
```

### 🏗️ ビルド

```bash
npm run build
```

### 📱 PWA機能の確認

1. ブラウザでアプリを開く
2. アドレスバーの横にインストールアイコンが表示される
3. または、メニューから「アプリをインストール」を選択

### 🔧 カスタマイズ

#### モバイル判定の調整
`src/hooks/useMobile.ts`でブレークポイントを調整可能：

```typescript
const checkMobile = () => {
  setIsMobile(window.innerWidth <= 768); // 768px以下をモバイルとする
};
```

#### PWA設定の変更
`public/manifest.json`でアプリの設定を変更：

```json
{
  "name": "お化け屋敷整理券システム",
  "short_name": "お化け屋敷",
  "theme_color": "#ff6b35",
  "background_color": "#ffffff"
}
```

### 📊 パフォーマンス最適化

- **コード分割**: 必要なコンポーネントのみ読み込み
- **画像最適化**: WebP形式の使用
- **キャッシュ戦略**: Service Workerによる効率的なキャッシュ
- **バンドル最適化**: Viteによる高速ビルド

### 🔒 セキュリティ

- **HTTPS必須**: PWA機能のため
- **CSP設定**: コンテンツセキュリティポリシー
- **入力検証**: フォームデータの検証

### 📈 今後の改善予定

- [ ] プッシュ通知機能
- [ ] オフライン時のデータ同期
- [ ] 音声入力対応
- [ ] カメラ機能（QRコード読み取り）
- [ ] 生体認証対応

### 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

## 🎯 デプロイ方法

### Vercelでのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリを接続
3. 自動デプロイが開始

### カスタムドメインの設定

1. Vercelダッシュボードでドメインを追加
2. DNSレコードを設定
3. SSL証明書が自動で発行

### 環境変数の設定

```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=お化け屋敷整理券システム
```

---

**お化け屋敷整理券システム** - モバイルファーストのPWAアプリケーション 