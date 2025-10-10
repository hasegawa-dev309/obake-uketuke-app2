-- お化け屋敷整理券システム用データベーススキーマ
-- Supabase PostgreSQL用

-- 予約テーブル
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    count INTEGER NOT NULL CHECK (count > 0),
    age_group VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT '未呼出' CHECK (status IN ('未呼出', '呼び出し中', '来場済', '未確認')),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ（開発用）
INSERT INTO reservations (email, count, age_group, status, memo) VALUES
('demo1@example.com', 2, '一般', '来場済', ''),
('demo2@example.com', 4, '小学生', '未呼出', ''),
('demo3@example.com', 1, '一般', '未確認', ''),
('demo4@example.com', 3, '中高生', '呼び出し中', ''),
('demo5@example.com', 2, '一般', '来場済', '')
ON CONFLICT DO NOTHING;
