# 専用整理券URL 本番導入手順

## 影響

- `reservations` に nullable 列を3つ追加し、部分UNIQUEインデックスを1つ追加する。
- 既存レコードは変更せず、既存の予約・管理APIは維持する。
- 専用URLは新規発行分から利用できる。既存レコードにはURLを後付けしない。
- Herokuに `TICKET_TOKEN_SECRET`（32文字以上）と `PUBLIC_FRONTEND_URL` を追加する。

## バックアップ

デプロイ直前に Heroku Postgres の手動バックアップを取得する。

```sh
heroku pg:backups:capture --app obake-uketuke-app
heroku pg:backups --app obake-uketuke-app
```

バックアップ完了を確認してから次へ進む。

## 適用順序

1. 本番DBの列・制約・件数を読み取り確認する。
2. バックアップを取得する。
3. `TICKET_TOKEN_SECRET` と `PUBLIC_FRONTEND_URL` を設定する。
4. `obake-uketuke-app/migrations/20261013_add_ticket_tokens.sql` を適用する。
5. Herokuへバックエンドをデプロイし、healthと既存管理者認証を確認する。
6. Vercelへフロントエンドをデプロイする。
7. テスト予約1件で専用URL、呼び出し反映、ヘッダーを確認し、テスト予約を削除する。

## ロールバック

障害時はまず直前のアプリ版へ戻す。列はnullableなので、DB列を残したままでも旧版は動作する。

DBも戻す必要がある場合だけ、旧版へ戻した後に
`obake-uketuke-app/migrations/20261013_add_ticket_tokens.rollback.sql` を適用する。
データ復元が必要な場合は、取得したHeroku Postgresバックアップを使用する。

## 秘密値

- `TICKET_TOKEN_SECRET` はリポジトリ、ログ、画面に出さない。
- 値を変更すると、既存の管理画面メール本文用URLを復号できなくなるため、イベント中は変更しない。
