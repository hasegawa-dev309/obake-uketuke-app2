-- 既存のreservationsテーブルに新しい列を追加するマイグレーション

-- channel列を追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'channel'
  ) THEN
    ALTER TABLE reservations ADD COLUMN channel VARCHAR(50) DEFAULT 'web';
  END IF;
END $$;

-- user_agent列を追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE reservations ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- called_at列を追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'called_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN called_at TIMESTAMP;
  END IF;
END $$;

-- channelにインデックスを作成
CREATE INDEX IF NOT EXISTS idx_reservations_channel ON reservations(channel);

-- 日次リセット用のビュー（任意）
CREATE OR REPLACE VIEW today_reservations AS
SELECT * FROM reservations 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

