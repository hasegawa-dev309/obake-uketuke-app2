-- 整理券テーブル
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  ticket_no INTEGER NOT NULL,
  email VARCHAR(255) NOT NULL,
  count INTEGER NOT NULL,
  age VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT '未呼出',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_reservations_ticket_no ON reservations(ticket_no);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);

-- サンプルデータ（オプション）
-- INSERT INTO reservations (ticket_no, email, count, age, status) 
-- VALUES (1, 'test@example.com', 2, '一般', '未呼出');
