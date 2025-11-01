-- DB修復用SQLスクリプト
-- Heroku PostgresのSQLターミナルで実行してください

-- 1. 現在のテーブル構造を確認
-- \d reservations を実行して構造を確認

-- 2. 直近の発券状況を確認
SELECT 
  created_at::date AS event_date,
  MAX(ticket_no) AS max_ticket_no,
  COUNT(*) AS total_count
FROM reservations
GROUP BY created_at::date
ORDER BY created_at::date DESC
LIMIT 5;

-- 3. 現在の最大IDを確認
SELECT MAX(id) AS max_id FROM reservations;

-- 4. IDシーケンスを修復（必要に応じて）
-- シーケンス名を確認: \d reservations で確認
-- 通常は reservations_id_seq
-- 例: 最大IDが128の場合
-- ALTER SEQUENCE reservations_id_seq RESTART WITH 129;

-- 5. 今日の日付で重複チェック
SELECT 
  ticket_no,
  COUNT(*) as count
FROM reservations
WHERE created_at::date = CURRENT_DATE
GROUP BY ticket_no
HAVING COUNT(*) > 1;

-- 6. NULLチェック（必要なカラム）
SELECT 
  COUNT(*) FILTER (WHERE email IS NULL) as null_email,
  COUNT(*) FILTER (WHERE ticket_no IS NULL) as null_ticket_no,
  COUNT(*) FILTER (WHERE count IS NULL) as null_count,
  COUNT(*) FILTER (WHERE age IS NULL) as null_age
FROM reservations
WHERE created_at::date = CURRENT_DATE;

-- 7. テーブル構造の修正（もしカラムが不足している場合）
-- 注意: これらのSQLは既存のテーブル構造に応じて調整が必要です

-- ticket_noカラムが存在しない場合は追加
-- ALTER TABLE reservations ADD COLUMN IF NOT EXISTS ticket_no INTEGER;

-- channelカラムが存在しない場合は追加
-- ALTER TABLE reservations ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'web';

-- user_agentカラムが存在しない場合は追加
-- ALTER TABLE reservations ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- ageカラムが存在しない場合は追加（age_groupとの整合性確認が必要）
-- ALTER TABLE reservations ADD COLUMN IF NOT EXISTS age VARCHAR(50);

-- 8. 今日のデータを確認
SELECT 
  id,
  ticket_no,
  email,
  count,
  age,
  status,
  channel,
  created_at
FROM reservations
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 10;
