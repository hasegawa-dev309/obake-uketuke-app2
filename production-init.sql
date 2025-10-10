-- 本番環境用データベース初期化SQL
-- Heroku Postgres で実行するためのファイル

-- 年齢層テーブルの作成と初期データ投入
CREATE TABLE IF NOT EXISTS age_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 年齢層の初期データ
INSERT INTO age_groups (id, name, description) VALUES
(1, '中学生以下', '13歳以下'),
(2, '高校生', '14歳〜18歳'),
(3, '大学生', '19歳〜22歳'),
(4, '一般', '23歳以上')
ON CONFLICT (id) DO NOTHING;

-- 予約テーブルの作成
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    people_count INTEGER NOT NULL CHECK (people_count >= 1 AND people_count <= 10),
    age_group_id INTEGER NOT NULL REFERENCES age_groups(id),
    reservation_number VARCHAR(20) UNIQUE NOT NULL,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    checkin_status VARCHAR(20) DEFAULT 'not_called' CHECK (checkin_status IN ('not_called', 'arrived', 'unconfirmed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 呼び出し状況テーブルの作成
CREATE TABLE IF NOT EXISTS call_status (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL UNIQUE,
    current_call_number INTEGER NOT NULL DEFAULT 1,
    is_paused BOOLEAN DEFAULT FALSE,
    notice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- システム状況テーブルの作成
CREATE TABLE IF NOT EXISTS system_status (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL UNIQUE,
    is_paused BOOLEAN DEFAULT FALSE,
    pause_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- チェックイン履歴テーブルの作成
CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id),
    reservation_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('not_called', 'arrived', 'unconfirmed')),
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 今日の日付で初期レコードを作成
INSERT INTO call_status (event_date, current_call_number, is_paused, notice) VALUES
(CURRENT_DATE, 1, FALSE, 'システム稼働中')
ON CONFLICT (event_date) DO NOTHING;

INSERT INTO system_status (event_date, is_paused, pause_message) VALUES
(CURRENT_DATE, FALSE, 'システム正常稼働中')
ON CONFLICT (event_date) DO NOTHING;

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_reservations_event_date ON reservations(event_date);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_number ON reservations(reservation_number);
CREATE INDEX IF NOT EXISTS idx_checkins_reservation_id ON checkins(reservation_id);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(status);

-- 予約番号の自動採番用シーケンス
CREATE SEQUENCE IF NOT EXISTS reservation_number_seq START 1;

-- 予約番号を自動採番する関数
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reservation_number := 'R' || LPAD(NEXTVAL('reservation_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER set_reservation_number
    BEFORE INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION generate_reservation_number();

-- 日付が変わった時にカウンターをリセットする関数
CREATE OR REPLACE FUNCTION reset_daily_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- 新しい日付の場合はカウンターをリセット
    IF NEW.event_date != OLD.event_date THEN
        ALTER SEQUENCE reservation_number_seq RESTART WITH 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 日付変更時のトリガー
CREATE TRIGGER reset_counters_on_date_change
    AFTER UPDATE OF event_date ON call_status
    FOR EACH ROW
    EXECUTE FUNCTION reset_daily_counters();

-- 更新日時の自動更新用関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに更新日時自動更新のトリガーを設定
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_status_updated_at
    BEFORE UPDATE ON call_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_status_updated_at
    BEFORE UPDATE ON system_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkins_updated_at
    BEFORE UPDATE ON checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 権限の設定
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres; 