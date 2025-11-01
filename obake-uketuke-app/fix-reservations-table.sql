-- reservationsテーブルの修復用SQL
-- Heroku PostgresのSQLターミナルで実行してください

-- 1. 必要なカラムの存在確認と追加
DO $$ 
BEGIN
  -- ticket_noカラム（整数型）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'ticket_no'
  ) THEN
    ALTER TABLE reservations ADD COLUMN ticket_no INTEGER;
    -- 既存データに番号を付与（日付ごとに連番）
    WITH numbered AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY created_at::date ORDER BY created_at) as rn
      FROM reservations
      WHERE ticket_no IS NULL
    )
    UPDATE reservations r
    SET ticket_no = n.rn
    FROM numbered n
    WHERE r.id = n.id;
    -- NOT NULL制約を追加
    ALTER TABLE reservations ALTER COLUMN ticket_no SET NOT NULL;
    RAISE NOTICE 'ticket_no column added and populated';
  END IF;

  -- countカラム（存在確認）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'count'
  ) THEN
    ALTER TABLE reservations ADD COLUMN count INTEGER DEFAULT 1;
    ALTER TABLE reservations ALTER COLUMN count SET NOT NULL;
    RAISE NOTICE 'count column added';
  END IF;

  -- ageカラム（存在確認）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'age'
  ) THEN
    ALTER TABLE reservations ADD COLUMN age VARCHAR(50) DEFAULT '一般';
    ALTER TABLE reservations ALTER COLUMN age SET NOT NULL;
    RAISE NOTICE 'age column added';
  END IF;

  -- statusカラム（存在確認、デフォルト値設定）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'status'
  ) THEN
    ALTER TABLE reservations ADD COLUMN status VARCHAR(20) DEFAULT '未呼出';
    ALTER TABLE reservations ALTER COLUMN status SET NOT NULL;
    RAISE NOTICE 'status column added';
  END IF;

  -- channelカラム
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'channel'
  ) THEN
    ALTER TABLE reservations ADD COLUMN channel VARCHAR(50) DEFAULT 'web';
    RAISE NOTICE 'channel column added';
  END IF;

  -- user_agentカラム
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE reservations ADD COLUMN user_agent TEXT;
    RAISE NOTICE 'user_agent column added';
  END IF;

  -- called_atカラム
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'called_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN called_at TIMESTAMP;
    RAISE NOTICE 'called_at column added';
  END IF;

END $$;

-- 2. 今日の日付で最大ticket_noを確認
SELECT 
  created_at::date AS event_date,
  MAX(ticket_no) AS max_ticket_no,
  COUNT(*) AS total_count
FROM reservations
WHERE created_at::date = CURRENT_DATE
GROUP BY created_at::date;

-- 3. IDシーケンスの修復（必要に応じて）
DO $$
DECLARE
  max_id INTEGER;
  seq_name TEXT;
BEGIN
  -- 最大IDを取得
  SELECT COALESCE(MAX(id), 0) INTO max_id FROM reservations;
  
  -- シーケンス名を取得（通常は reservations_id_seq）
  SELECT pg_get_serial_sequence('reservations', 'id') INTO seq_name;
  
  IF seq_name IS NOT NULL THEN
    -- シーケンスを最大ID+1に設定
    EXECUTE format('SELECT setval(%L, %s)', seq_name, GREATEST(max_id, 1));
    RAISE NOTICE 'ID sequence reset to %', max_id + 1;
  END IF;
END $$;

-- 4. インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_reservations_ticket_no ON reservations(ticket_no);
CREATE INDEX IF NOT EXISTS idx_reservations_created_date ON reservations((created_at::date));
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_channel ON reservations(channel);

-- 5. 今日のデータを確認
SELECT 
  id,
  ticket_no,
  email,
  count,
  age,
  status,
  channel,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
FROM reservations
WHERE created_at::date = CURRENT_DATE
ORDER BY ticket_no
LIMIT 20;
