-- 整理券テーブル
CREATE TABLE IF NOT EXISTS reservations (
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

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_reservations_ticket_no ON reservations(ticket_no);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_channel ON reservations(channel);

-- 既存テーブルに列を追加（マイグレーション用）
-- ALTER TABLE reservations ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'web';
-- ALTER TABLE reservations ADD COLUMN IF NOT EXISTS user_agent TEXT;
-- ALTER TABLE reservations ADD COLUMN IF NOT EXISTS called_at TIMESTAMP;
