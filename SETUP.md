# お化け屋敷整理券システム - セットアップガイド

## 🔐 管理画面へのアクセス

### ログイン情報

**管理画面URL**: https://obake-uketuke-app2-iveo.vercel.app/admin.html  
または: https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/admin.html

**管理者パスワード**: `obake2024secure`

### 初回ログイン手順

1. 管理画面URLにアクセス
2. ログインフォームが表示されます
3. パスワード `obake2024secure` を入力
4. 「ログイン」ボタンをクリック
5. 管理画面にリダイレクトされます

**注意**: トークンは12時間有効です。期限切れの場合は再度ログインしてください。

---

## 📱 予約画面URL

**予約画面（一般ユーザー向け）**  
https://obake-uketuke-app2-iveo.vercel.app/reservation.html  
または: https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/reservation.html

このURLをQRコード化して配布してください。

---

## 🎯 実装機能

### 1. JWT認証システム
- 管理画面は認証必須
- トークン有効期限: 12時間
- 自動ログアウト機能

### 2. 複数デバイス対応
- **モバイル（mobile）**: スマートフォンからの予約
- **タブレット（tablet）**: タブレットからの予約  
- **PC（web）**: PCからの予約
- **管理画面（admin）**: 管理画面からの発行

### 3. リアルタイムデータ共有
- すべてのデバイスから同じデータベースに接続
- 3秒ごとに自動更新
- 予約→管理画面への即座反映

### 4. セキュリティ機能
- CORS設定: Vercelドメインのみ許可
- レート制限: 30秒間に5回まで
- バリデーション: メール形式、人数範囲、年齢層チェック

### 5. 統計機能
- ステータス別統計（未呼出、来場済、未確認、キャンセル）
- デバイス別統計（モバイル、タブレット、PC、管理画面）
- 年齢層別統計
- 時間帯別統計（CSV出力時）

### 6. 日次自動リセット
- 日付が変わると自動的にデータをリセット
- 整理券番号が1から再スタート

---

## 🔧 Heroku環境変数

現在設定されている環境変数:

```bash
ADMIN_PASSWORD=obake2024secure
ADMIN_JWT_SECRET=obake-jwt-secret-key-very-long-random-string-2024-hakusansai
DATABASE_URL=(Heroku Postgresが自動設定)
```

### 環境変数の変更方法

```bash
# パスワードを変更する場合
heroku config:set ADMIN_PASSWORD="新しいパスワード" --app obake-uketuke-app

# JWT秘密鍵を変更する場合
heroku config:set ADMIN_JWT_SECRET="新しい秘密鍵" --app obake-uketuke-app
```

---

## 📊 API エンドポイント

### 公開API（認証不要）
- `POST /api/reservations` - 整理券発行（レート制限あり）
- `GET /api/reservations/counter` - カウンター取得
- `GET /api/health` - ヘルスチェック

### 管理API（認証必須）
- `GET /api/reservations` - 整理券一覧取得
- `PUT /api/reservations/:id/status` - ステータス更新
- `DELETE /api/reservations/:id` - 整理券削除
- `GET /api/reservations/stats` - 統計情報取得
- `GET /api/reservations/current-number` - 呼び出し番号取得
- `PUT /api/reservations/current-number` - 呼び出し番号更新

### 認証API
- `POST /api/admin/login` - ログイン
- `GET /api/admin/verify` - トークン検証

---

## 🧪 動作確認手順

### 1. APIヘルスチェック
```bash
curl https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/api/health
```

期待される結果:
```json
{
  "ok": true,
  "timestamp": "2024-xx-xxTxx:xx:xx.xxxZ",
  "database": "connected",
  "environment": "production"
}
```

### 2. 予約機能のテスト

**スマホから予約:**
1. https://obake-uketuke-app2-iveo.vercel.app/reservation.html にアクセス
2. メールアドレス、人数、年齢層を入力
3. 「整理券を発行する」をクリック
4. 整理券番号が表示される

**PCの管理画面で確認:**
1. https://obake-uketuke-app2-iveo.vercel.app/admin.html にアクセス
2. パスワード `obake2024secure` でログイン
3. スマホからの予約が表示される（デバイス: 📱 モバイル）
4. 3秒ごとに自動更新される

### 3. 複数デバイステスト

**異なるデバイスから同時予約:**
- スマホA → モバイルとして記録
- タブレットB → タブレットとして記録
- PC C → PCとして記録

**どのデバイスの管理画面でも同じデータが見える:**
- PC管理画面
- タブレット管理画面
- 別のPC管理画面

すべて同じ内容を表示！

---

## ⚠️ 注意事項

### セキュリティ
- 管理画面のパスワードは定期的に変更してください
- 本番運用前に強力なパスワードに変更することを推奨

### データベース
- Herokuの無料プランではデータベースの行数制限があります
- 定期的に古いデータを削除してください

### レート制限
- 公開予約APIは30秒間に5回までの制限があります
- 過剰なリクエストは自動的にブロックされます

---

## 📞 トラブルシューティング

### 予約ができない場合
1. ブラウザのコンソールでエラーを確認
2. `heroku logs --tail --app obake-uketuke-app` でサーバーログを確認
3. CORS エラーの場合、オリジンが許可されているか確認

### 管理画面にログインできない場合
1. パスワードが正しいか確認
2. ブラウザのキャッシュをクリア
3. `heroku config --app obake-uketuke-app` で環境変数を確認

### データが表示されない場合
1. ブラウザのコンソールで401エラーが出ていないか確認
2. トークンの有効期限が切れていないか確認
3. 再度ログインしてみる

---

## 🚀 今後の改善案

- WebSocket/SSEによるリアルタイム更新
- メール自動送信機能（SendGrid/AWS SESなど）
- QRコードスキャン機能
- より詳細な分析ダッシュボード
- データベースバックアップ機能

