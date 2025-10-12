import { pool } from './db';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('🔄 マイグレーション開始...');
  
  try {
    // channel列を追加
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'reservations' AND column_name = 'channel'
        ) THEN
          ALTER TABLE reservations ADD COLUMN channel VARCHAR(50) DEFAULT 'web';
          RAISE NOTICE 'channel列を追加しました';
        ELSE
          RAISE NOTICE 'channel列は既に存在します';
        END IF;
      END $$;
    `);
    console.log('✅ channel列の確認完了');

    // user_agent列を追加
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'reservations' AND column_name = 'user_agent'
        ) THEN
          ALTER TABLE reservations ADD COLUMN user_agent TEXT;
          RAISE NOTICE 'user_agent列を追加しました';
        ELSE
          RAISE NOTICE 'user_agent列は既に存在します';
        END IF;
      END $$;
    `);
    console.log('✅ user_agent列の確認完了');

    // called_at列を追加
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'reservations' AND column_name = 'called_at'
        ) THEN
          ALTER TABLE reservations ADD COLUMN called_at TIMESTAMP;
          RAISE NOTICE 'called_at列を追加しました';
        ELSE
          RAISE NOTICE 'called_at列は既に存在します';
        END IF;
      END $$;
    `);
    console.log('✅ called_at列の確認完了');

    // インデックスを作成
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_channel ON reservations(channel);
    `);
    console.log('✅ インデックスの確認完了');

    // ビューを作成
    await pool.query(`
      CREATE OR REPLACE VIEW today_reservations AS
      SELECT * FROM reservations 
      WHERE DATE(created_at) = CURRENT_DATE
      ORDER BY created_at DESC;
    `);
    console.log('✅ ビューの作成完了');

    console.log('🎉 マイグレーション完了！');
    process.exit(0);
  } catch (err) {
    console.error('❌ マイグレーションエラー:', err);
    process.exit(1);
  }
}

runMigration();

