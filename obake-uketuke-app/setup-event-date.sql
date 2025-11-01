-- event_dateカラムの追加とUNIQUE制約の設定
-- Heroku PostgresのSQLターミナルで実行してください

-- 1. event_dateカラムの追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE reservations ADD COLUMN event_date DATE DEFAULT CURRENT_DATE NOT NULL;
    RAISE NOTICE 'event_date column added';
  END IF;
END $$;

-- 2. 既存データのevent_dateを補完（created_at::dateから設定）
UPDATE reservations 
SET event_date = created_at::date 
WHERE event_date IS NULL;

-- 3. NOT NULL制約を確実に設定
ALTER TABLE reservations ALTER COLUMN event_date SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN event_date SET DEFAULT CURRENT_DATE;

-- 4. UNIQUE制約の追加（event_date + ticket_no）
CREATE UNIQUE INDEX IF NOT EXISTS ux_reservations_date_no 
  ON reservations(event_date, ticket_no);

-- 5. 確認クエリ
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reservations' 
  AND column_name IN ('event_date', 'ticket_no')
ORDER BY column_name;

