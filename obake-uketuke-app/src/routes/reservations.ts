import express from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db";
import { requireAdmin } from "../middleware/auth";
import { validateReservation, validateStatus } from "../middleware/validation";
import {
  decryptTicketToken,
  encryptTicketToken,
  generateTicketToken,
  hashTicketToken,
  isValidTokenFormat,
  ticketUrl,
} from "../ticketToken";

const router = express.Router();
const ticketLookupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'too_many_requests' },
});

function setPrivateResponseHeaders(res: express.Response) {
  res.set('Cache-Control', 'no-store, private, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('X-Content-Type-Options', 'nosniff');
}

// 呼び出し番号管理用（メモリ）
let currentNumber = 1;
let systemPaused = false;
let lastResetDate = new Date().toISOString().split('T')[0]; // 最後にリセットした日付

// 日付変更チェック関数
async function checkAndResetIfNeeded() {
  const today = new Date().toISOString().split('T')[0];
  
  if (lastResetDate !== today) {
    console.log(`📅 日付が変更されました: ${lastResetDate} → ${today}`);
    console.log("🔄 自動リセットを実行します...");
    
    try {
      // メモリ内のカウンターをリセット
      currentNumber = 1;
      systemPaused = false;
      lastResetDate = today;
      
      console.log("✅ 自動リセット完了: 呼び出し番号 = 1");
    } catch (err) {
      console.error("❌ 自動リセットエラー:", err);
    }
  }
}

// DB確認用エンドポイント（管理者のみ）
router.get("/debug/db-info", requireAdmin, async (_req, res) => {
  try {
    // 1. テーブル構造を確認
    const schemaResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'reservations'
      ORDER BY ordinal_position
    `);
    
    // 2. 今日のデータ件数を確認
    const todayCountResult = await pool.query(`
      SELECT 
        COUNT(*) AS total_count,
        COALESCE(MAX(ticket_no), 0) AS max_ticket_no,
        MIN(created_at::date) AS first_date,
        MAX(created_at::date) AS last_date
      FROM reservations
      WHERE created_at::date = CURRENT_DATE
    `);
    
    // 3. 全期間のデータ件数
    const allCountResult = await pool.query(`
      SELECT 
        COUNT(*) AS total_count,
        COUNT(DISTINCT created_at::date) AS date_count,
        MIN(created_at) AS oldest_record,
        MAX(created_at) AS newest_record
      FROM reservations
    `);
    
    // 4. 今日のデータサンプル（最新5件）
    const todaySamplesResult = await pool.query(`
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
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    // 5. IDシーケンス情報（エラーハンドリング付き）
    let seqInfo = { sequence_name: null, last_value: null };
    try {
      const seqNameResult = await pool.query(`
        SELECT pg_get_serial_sequence('reservations', 'id') AS sequence_name
      `);
      const seqName = seqNameResult.rows[0]?.sequence_name;
      if (seqName) {
        const lastValueResult = await pool.query(`SELECT last_value FROM ${seqName}`);
        seqInfo = {
          sequence_name: seqName,
          last_value: lastValueResult.rows[0]?.last_value
        };
      }
    } catch (seqErr) {
      console.log("⚠️ シーケンス情報取得エラー（無視）:", seqErr);
    }
    
    // 6. 最大ID
    const maxIdResult = await pool.query(`
      SELECT COALESCE(MAX(id), 0) AS max_id FROM reservations
    `);
    
    return res.json({ 
      ok: true,
      schema: {
        columns: schemaResult.rows,
        column_count: schemaResult.rows.length
      },
      today: {
        count: parseInt(todayCountResult.rows[0]?.total_count || '0'),
        max_ticket_no: parseInt(todayCountResult.rows[0]?.max_ticket_no || '0'),
        first_date: todayCountResult.rows[0]?.first_date,
        last_date: todayCountResult.rows[0]?.last_date
      },
      all_time: {
        total_count: parseInt(allCountResult.rows[0]?.total_count || '0'),
        date_count: parseInt(allCountResult.rows[0]?.date_count || '0'),
        oldest_record: allCountResult.rows[0]?.oldest_record,
        newest_record: allCountResult.rows[0]?.newest_record
      },
      samples: {
        today_recent: todaySamplesResult.rows
      },
      sequence: {
        sequence_name: seqInfo.sequence_name,
        last_value: seqInfo.last_value,
        max_id: parseInt(maxIdResult.rows[0]?.max_id || '0')
      }
    });
  } catch (err: any) {
    console.error("❌ [GET /debug/db-info] エラー:", err);
    return res.status(500).json({ 
      ok: false, 
      error: err.message,
      details: err
    });
  }
});

// 整理券一覧取得API（管理者のみ）
router.get("/", requireAdmin, async (_req, res) => {
  console.log('📋 [GET /api/reservations] リクエスト受信');
  
  try {
    // event_dateカラムの存在確認
    const schemaCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'reservations' AND column_name IN ('event_date', 'ticket_no')
    `);
    const columns = schemaCheck.rows.map((r: any) => r.column_name);
    const hasEventDate = columns.includes('event_date');
    const hasTicketNo = columns.includes('ticket_no');
    
    // 日本時間の今日を取得（UTC+9）
    const todayJST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    console.log(`📅 [GET] 日本時間の今日: ${todayJST}`);
    
    // event_dateがある場合はそれを使用、ない場合はcreated_at::dateを使用
    let result;
    
      if (hasEventDate) {
        // event_date基準で取得（JST基準・パラメータ化クエリ）
        result = await pool.query(`
          SELECT 
            id,
            ${hasTicketNo ? 'COALESCE(ticket_no, 0) AS "ticketNo",' : 'NULL AS "ticketNo",'}
            email,
            count,
            age,
            COALESCE(status, '未呼出') AS status,
            channel,
            user_agent AS "userAgent",
            TO_CHAR(created_at, 'YYYY/MM/DD HH24:MI') AS "createdAt",
            called_at AS "calledAt",
            ticket_token_ciphertext AS "ticketTokenCiphertext"
        FROM reservations 
        WHERE event_date = $1::date
        ORDER BY ${hasTicketNo ? 'ticket_no' : 'created_at'} ASC NULLS LAST
      `, [todayJST]);
    } else {
      // created_at基準で取得（JST基準・パラメータ化クエリ）
      result = await pool.query(`
        SELECT 
          id,
          ${hasTicketNo ? 'COALESCE(ticket_no, 0) AS "ticketNo",' : 'NULL AS "ticketNo",'}
          email,
          count,
          age,
          COALESCE(status, '未呼出') AS status,
          channel,
          user_agent AS "userAgent",
          TO_CHAR(created_at, 'YYYY/MM/DD HH24:MI') AS "createdAt",
          called_at AS "calledAt",
          ticket_token_ciphertext AS "ticketTokenCiphertext"
        FROM reservations 
        WHERE created_at::date = $1::date
        ORDER BY ${hasTicketNo ? 'ticket_no' : 'created_at'} ASC NULLS LAST
      `, [todayJST]);
    }
    
    console.log(`✅ [GET /api/reservations] DB取得成功: ${result.rows.length}件 (${hasEventDate ? 'event_date基準' : 'created_at基準'})`);
    if (result.rows.length === 0) {
      console.log(`⚠️ [GET /api/reservations] 今日のデータが0件です`);
    }

    const data = result.rows.map((row: any) => {
      const { ticketTokenCiphertext, ...safeRow } = row;
      if (!ticketTokenCiphertext) return safeRow;
      try {
        return { ...safeRow, ticketUrl: ticketUrl(decryptTicketToken(ticketTokenCiphertext)) };
      } catch {
        return safeRow;
      }
    });
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("❌ [GET /api/reservations] DBエラー:", err);
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

// 整理券発行API（公開 - 認証不要、レート制限あり）
router.post("/", validateReservation, async (req, res) => {
  const { email, count, age, channel = 'web' } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  
  // 日付変更チェック
  await checkAndResetIfNeeded();
  
  console.log(`📥 [POST /api/reservations] count=${count}, age=${age}, channel=${channel}`);
  
  // リトライロジック（最大5回）
  const MAX_RETRIES = 5;
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log(`💾 [POST] トランザクション開始 (試行 ${attempt}/${MAX_RETRIES})`);
      
      // テーブル構造を確認
      const schemaCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        ORDER BY ordinal_position
      `);
      const columns = schemaCheck.rows.map((r: any) => r.column_name);
      console.log('📊 [POST] テーブルカラム:', columns);
      
      // event_dateが存在するか確認
      const hasEventDate = columns.includes('event_date');
      const hasTicketNo = columns.includes('ticket_no');
      const hasTicketTokens = ['ticket_token_hash', 'ticket_token_ciphertext', 'ticket_token_expires_at']
        .every(column => columns.includes(column));

      if (!hasTicketTokens) {
        throw new Error('ticket_token_schema_missing');
      }

      const accessToken = generateTicketToken();
      
      // 整理券番号の採番（JST基準で当日のMAX+1を取得）
      // 日本時間の今日を取得（UTC+9）
      const todayJST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      console.log(`📅 [POST] 日本時間の今日: ${todayJST}`);
      
      let ticketNo = 1;
      
      if (hasTicketNo) {
        // ticket_noカラムがある場合：MAX+1で採番（シンプルな方法）
        // テーブル全体をロックしてからMAXを取得（最も確実な方法）
        await client.query(`LOCK TABLE reservations IN SHARE ROW EXCLUSIVE MODE`);
        
        if (hasEventDate) {
          // event_dateがある場合：event_date = 今日でMAX+1
          const maxResult = await client.query<{ next_no: number }>(`
            SELECT COALESCE(MAX(ticket_no), 0) + 1 AS next_no 
            FROM reservations 
            WHERE event_date = $1::date
          `, [todayJST]);
          ticketNo = maxResult.rows[0]?.next_no ?? 1;
        } else {
          // event_dateがない場合：created_at::date = 今日でMAX+1
          const maxResult = await client.query<{ next_no: number }>(`
            SELECT COALESCE(MAX(ticket_no), 0) + 1 AS next_no 
            FROM reservations 
            WHERE created_at::date = $1::date
          `, [todayJST]);
          ticketNo = maxResult.rows[0]?.next_no ?? 1;
        }
        
        console.log(`🎫 [POST] 当日の最大ticket_no + 1 = ${ticketNo} (JST基準: ${todayJST})`);
        console.log(`🎫 [POST] 当日の最大ticket_noから採番: ${ticketNo} (${hasEventDate ? 'event_date基準' : 'created_at基準'})`);
      } else {
        // ticket_noカラムがない場合：カウントベース
        const whereClause = hasEventDate 
          ? `WHERE event_date = '${todayJST}'::date`
          : `WHERE created_at::date = '${todayJST}'::date`;
        
        await client.query(`LOCK TABLE reservations IN SHARE ROW EXCLUSIVE MODE`);
        
        const countResult = await client.query<{ count: string }>(`
          SELECT COUNT(*) AS count FROM reservations ${whereClause}
        `);
        ticketNo = parseInt(countResult.rows[0]?.count || '0') + 1;
        console.log(`🎫 [POST] カウントベース採番: ${ticketNo} (ticket_noカラムなし)`);
      }
      
      // ticket_noは必ず1以上の値を設定
      if (ticketNo < 1) {
        ticketNo = 1;
      }
      
      console.log(`🎟️ [POST] 確定整理券番号: ${ticketNo}`);
      
      // INSERT文を構築
      const insertColumns: string[] = [];
      const insertValues: any[] = [];
      const insertPlaceholders: string[] = [];
      let paramIndex = 1;
      
      // event_date（存在する場合のみ、JST基準の日付を使用）
      if (hasEventDate) {
        insertColumns.push('event_date');
        insertValues.push(todayJST);
        insertPlaceholders.push(`$${paramIndex++}`);
      }
      
      if (hasTicketNo) {
        insertColumns.push('ticket_no');
        insertValues.push(ticketNo);
        insertPlaceholders.push(`$${paramIndex++}`);
      }
      
      if (columns.includes('email')) {
        insertColumns.push('email');
        insertValues.push(email);
        insertPlaceholders.push(`$${paramIndex++}`);
      }
      
      if (columns.includes('count')) {
        insertColumns.push('count');
        insertValues.push(count);
        insertPlaceholders.push(`$${paramIndex++}`);
      }
      
      if (columns.includes('age')) {
        insertColumns.push('age');
        insertValues.push(age);
        insertPlaceholders.push(`$${paramIndex++}`);
      }
      
      if (columns.includes('status')) {
        insertColumns.push('status');
        insertValues.push('未呼出');
        insertPlaceholders.push(`$${paramIndex++}`);
      }
      
      if (columns.includes('channel')) {
        insertColumns.push('channel');
        insertValues.push(channel);
        insertPlaceholders.push(`$${paramIndex++}`);
      }
      
      if (columns.includes('user_agent')) {
        insertColumns.push('user_agent');
        insertValues.push(userAgent);
        insertPlaceholders.push(`$${paramIndex++}`);
      }

      insertColumns.push('ticket_token_hash');
      insertValues.push(hashTicketToken(accessToken));
      insertPlaceholders.push(`$${paramIndex++}`);

      insertColumns.push('ticket_token_ciphertext');
      insertValues.push(encryptTicketToken(accessToken));
      insertPlaceholders.push(`$${paramIndex++}`);

      insertColumns.push('ticket_token_expires_at');
      const expiresAt = new Date(`${todayJST}T15:00:00.000Z`);
      insertValues.push(expiresAt);
      insertPlaceholders.push(`$${paramIndex++}`);
      
      // created_at
      if (columns.includes('created_at')) {
        insertColumns.push('created_at');
        insertValues.push(null);
        insertPlaceholders.push(`NOW() AT TIME ZONE 'Asia/Tokyo'`);
      }
      
      // パラメータの値をフィルタリング（NOW()などは除外、ただしevent_dateのJST日付は含める）
      const paramValues = insertValues.filter((v, i) => {
        const placeholder = insertPlaceholders[i];
        // event_dateの場合はJST日付文字列なので含める
        if (hasEventDate && insertColumns[i] === 'event_date') {
          return true;
        }
        // その他の場合はNOW()やCURRENT_DATEを含むものは除外
        return placeholder && !placeholder.includes('NOW()') && !placeholder.includes('CURRENT_DATE') && v !== null;
      });
      
      // RETURNING句を構築（必ずticketNoを含める）
      const returningFields = [
        'id',
        hasEventDate ? 'event_date AS "eventDate"' : '',
        hasTicketNo ? 'ticket_no AS "ticketNo"' : 'NULL AS "ticketNo"',
        'email',
        columns.includes('count') ? 'count' : '',
        columns.includes('age') ? 'age' : '',
        columns.includes('status') ? 'status' : '',
        columns.includes('channel') ? 'channel' : '',
        columns.includes('user_agent') ? 'user_agent AS "userAgent"' : '',
        'TO_CHAR(created_at, \'YYYY/MM/DD HH24:MI\') AS "createdAt"'
      ].filter(f => f !== '').join(', ');
      
      const insertSQL = `
        INSERT INTO reservations (${insertColumns.join(', ')})
        VALUES (${insertPlaceholders.join(', ')})
        RETURNING ${returningFields}
      `;
      
      console.log(`🔨 [POST] INSERT SQL: ${insertSQL}`);
      const inserted = await client.query(insertSQL, paramValues);
      
      await client.query('COMMIT');
      console.log(`✅ [POST] DB保存成功: #${ticketNo} (${channel})`);
      
      // レスポンスを正規化（ticketNoを確実に含める）
      const insertedRow = inserted.rows[0];
      const responseData = {
        id: String(insertedRow.id || ''),
        ticketNo: insertedRow.ticketNo || insertedRow.ticket_no || ticketNo || 1,
        count: Number(insertedRow.count || count),
        age: insertedRow.age || age,
        status: insertedRow.status || '未呼出',
        channel: insertedRow.channel || channel,
        createdAt: insertedRow.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
        ticketUrl: ticketUrl(accessToken),
      };
      
      // ticketNoが確実に含まれていることを確認
      console.log(`🎟️ [POST] レスポンス送信: #${ticketNo}`);
      
      client.release();
      return res.status(201).json({ ok: true, data: responseData });
      
    } catch (err: any) {
      await client.query('ROLLBACK');
      client.release();
      lastError = err;
      
      // UNIQUE制約違反の場合はリトライ
      if (err?.code === '23505' && attempt < MAX_RETRIES) {
        console.warn(`⚠️ [POST] UNIQUE制約違反、リトライします (${attempt}/${MAX_RETRIES}):`, err.constraint);
        // 短い待機時間（指数バックオフ）
        await new Promise(resolve => setTimeout(resolve, Math.min(50 * attempt, 200)));
        continue;
      }
      
      // その他のエラーまたは最終試行の場合はエラーを返す
      console.error(`❌ [POST /api/reservations] ROLLBACK (試行 ${attempt}):`, err);
      console.error("エラー詳細:", err);
      console.error("エラーメッセージ:", err?.message);
      console.error("エラーコード:", err?.code);
      console.error("エラー詳細メッセージ:", err?.detail);
      console.error("エラーSQL:", err?.where);
      
      const errorDetails = {
        message: err?.message || String(err),
        code: err?.code,
        detail: err?.detail,
        hint: err?.hint,
        constraint: err?.constraint,
        table: err?.table,
        column: err?.column,
        attempt: attempt
      };
      
      return res.status(500).json({ 
        ok: false, 
        error: "db_error", 
        details: errorDetails
      });
    }
  }
  
  // すべてのリトライが失敗した場合
  return res.status(500).json({ 
    ok: false, 
    error: "db_error", 
    details: {
      message: "すべてのリトライが失敗しました",
      last_error: lastError?.message
    }
  });
});

// 利用者向け専用整理券取得API（URLトークンのみでアクセス）
router.get("/ticket/:token", ticketLookupLimiter, async (req, res) => {
  setPrivateResponseHeaders(res);
  const { token } = req.params;

  if (!isValidTokenFormat(token)) {
    return res.status(404).json({ ok: false, error: 'ticket_not_found' });
  }

  try {
    await checkAndResetIfNeeded();
    const schemaCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'reservations' AND column_name = 'event_date'
    `);
    const dateColumn = schemaCheck.rows.length > 0 ? 'event_date' : 'created_at::date';
    const todayJST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const result = await pool.query(`
      SELECT
        ticket_no AS "ticketNo",
        count,
        COALESCE(status, '未呼出') AS status
      FROM reservations
      WHERE ticket_token_hash = $1
        AND ${dateColumn} = $2::date
        AND ticket_token_expires_at > NOW()
      LIMIT 1
    `, [hashTicketToken(token), todayJST]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'ticket_not_found' });
    }

    return res.json({
      ok: true,
      data: {
        ticketNo: Number(result.rows[0].ticketNo),
        count: Number(result.rows[0].count),
        status: result.rows[0].status,
        currentNumber,
        systemPaused,
      },
    });
  } catch (err) {
    console.error('❌ [GET /ticket/:token] 整理券取得エラー');
    return res.status(500).json({ ok: false, error: 'db_error' });
  }
});

// 整理券ステータス更新API（管理者のみ）
router.put("/:id/status", requireAdmin, validateStatus, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`📝 [PUT /:id/status] id=${id}, status=${status}`);
  
  try {
    // 数値に変換してidで検索（最も確実）
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      console.log(`⚠️ [PUT] 無効なid形式: ${id}`);
      return res.status(400).json({ ok: false, error: 'Invalid id format' });
    }
    
    // まず対象のレコードが存在するかチェック（idだけで検索、1件のみ）
    const checkResult = await pool.query(
      `SELECT id, ticket_no FROM reservations WHERE id = $1::bigint LIMIT 1`,
      [numericId]
    );
    
    if (checkResult.rows.length === 0) {
      console.log(`⚠️ [PUT] 整理券が見つかりません: id=${numericId}`);
      return res.status(404).json({ ok: false, error: 'Reservation not found' });
    }
    
    const targetRecord = checkResult.rows[0];
    console.log(`📝 [PUT] 対象レコード発見: id=${targetRecord.id}, ticket_no=${targetRecord.ticket_no}`);
    
    // 必ず1件だけを更新（idで確実に特定）
    const result = await pool.query(
      `UPDATE reservations 
       SET status = $1, called_at = NOW() AT TIME ZONE 'Asia/Tokyo'
       WHERE id = $2::bigint
       RETURNING 
         id,
         ticket_no AS "ticketNo",
         email,
         count,
         age,
         status,
         channel,
         TO_CHAR(created_at, 'YYYY/MM/DD HH24:MI') AS "createdAt"`,
      [status, numericId]
    );
    
    if (result.rows.length === 0) {
      console.log(`⚠️ [PUT] 更新後のレコードが見つかりません: id=${numericId}`);
      return res.status(404).json({ ok: false, error: 'Update failed' });
    }
    
    if (result.rows.length > 1) {
      console.error(`❌ [PUT] 致命的: 複数のレコードが更新されました: ${result.rows.length}件`);
      return res.status(500).json({ ok: false, error: 'Multiple records updated' });
    }
    
    console.log(`✅ [PUT] ステータス更新成功: id=${numericId}, #${result.rows[0].ticketNo} → ${status}`);
    return res.json({ ok: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("❌ [PUT /:id/status] DBエラー:", err);
    console.error("❌ [PUT] エラー詳細:", err.message);
    console.error("❌ [PUT] エラースタック:", err.stack);
    return res.status(500).json({ ok: false, error: "db_error", details: err.message });
  }
});

// 整理券削除API（管理者のみ）
router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  console.log(`🗑️ [DELETE /:id] id=${id}`);
  
  try {
    const result = await pool.query(
      `DELETE FROM reservations WHERE id = $1::bigint OR ticket_no = $1::bigint 
       RETURNING id, ticket_no AS "ticketNo", email`,
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log(`⚠️ [DELETE] 整理券が見つかりません: ${id}`);
      return res.status(404).json({ ok: false, error: 'Reservation not found' });
    }
    
    console.log(`✅ [DELETE] 削除成功: #${result.rows[0].ticketNo}`);
    return res.json({ ok: true, message: 'Deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error("❌ [DELETE /:id] DBエラー:", err);
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

// 管理画面用：整理券統計API（管理者のみ）
router.get("/stats", requireAdmin, async (_req, res) => {
  console.log('📊 [GET /stats] 統計リクエスト受信');
  
  try {
    // 総数取得
    const totalResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM reservations
      WHERE created_at::date = CURRENT_DATE
    `);
    
    // ステータス別統計
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM reservations
      WHERE created_at::date = CURRENT_DATE
      GROUP BY status
    `);
    
    // チャネル別統計
    const channelResult = await pool.query(`
      SELECT channel, COUNT(*) as count
      FROM reservations
      WHERE created_at::date = CURRENT_DATE
      GROUP BY channel
    `);
    
    // 年齢層別統計
    const ageResult = await pool.query(`
      SELECT age, COUNT(*) as count
      FROM reservations
      WHERE created_at::date = CURRENT_DATE
      GROUP BY age
    `);
    
    const stats = {
      total: parseInt(totalResult.rows[0]?.count || '0'),
      byStatus: {} as Record<string, number>,
      byChannel: {} as Record<string, number>,
      byAge: {} as Record<string, number>
    };
    
    statusResult.rows.forEach(row => {
      stats.byStatus[row.status] = parseInt(row.count);
    });
    
    channelResult.rows.forEach(row => {
      stats.byChannel[row.channel] = parseInt(row.count);
    });
    
    ageResult.rows.forEach(row => {
      stats.byAge[row.age] = parseInt(row.count);
    });
    
    console.log(`✅ [GET /stats] 統計取得成功: 合計${stats.total}件`);
    return res.json({ ok: true, data: stats });
  } catch (err) {
    console.error("❌ [GET /stats] DBエラー:", err);
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

// 呼び出し番号管理API（管理者のみ）
router.get("/current-number", requireAdmin, async (_req, res) => {
  // 日付変更チェック
  await checkAndResetIfNeeded();
  
  console.log(`🔢 [GET /current-number] 現在: ${currentNumber}`);
  return res.json({ ok: true, data: { currentNumber, systemPaused } });
});

// 公開：システム状態取得（認証不要）
router.get("/status", async (_req, res) => {
  // 日付変更チェック
  await checkAndResetIfNeeded();
  
  // キャッシュ無効化ヘッダー
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  console.log(`🔍 [GET /status] システム状態取得: 番号=${currentNumber}, 停止=${systemPaused}`);
  return res.json({ 
    ok: true, 
    data: { 
      currentNumber, 
      systemPaused,
      timestamp: new Date().toISOString()
    } 
  });
});

router.put("/current-number", requireAdmin, (req, res) => {
  const { currentNumber: newNumber, systemPaused: newPaused } = req.body;
  
  if (newNumber !== undefined) {
    currentNumber = newNumber;
    console.log(`🔢 [PUT /current-number] 呼び出し番号更新: ${currentNumber}`);
  }
  if (newPaused !== undefined) {
    systemPaused = newPaused;
    console.log(`⏸️ [PUT /current-number] システム状態: ${systemPaused ? '一時停止' : '稼働中'}`);
  }
  
  return res.json({ ok: true, data: { currentNumber, systemPaused } });
});

// 整理券カウンター取得API（公開 - 予約完了画面用）
router.get("/counter", async (_req, res) => {
  try {
    // event_dateカラムがある場合はそれを使用、ない場合はcreated_at::dateを使用
    const schemaCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'reservations' AND column_name IN ('event_date', 'ticket_no')
    `);
    const columns = schemaCheck.rows.map((r: any) => r.column_name);
    const hasEventDate = columns.includes('event_date');
    const hasTicketNo = columns.includes('ticket_no');
    
    let counter = 0;
    let totalCount = 0;
    
    if (hasTicketNo) {
      if (hasEventDate) {
        const result = await pool.query(`
          SELECT 
            COALESCE(MAX(ticket_no), 0) AS counter,
            COUNT(*) AS total_count
          FROM reservations
          WHERE event_date = CURRENT_DATE
        `);
        counter = parseInt(result.rows[0]?.counter || '0');
        totalCount = parseInt(result.rows[0]?.total_count || '0');
      } else {
        const result = await pool.query(`
          SELECT 
            COALESCE(MAX(ticket_no), 0) AS counter,
            COUNT(*) AS total_count
          FROM reservations
          WHERE created_at::date = CURRENT_DATE
        `);
        counter = parseInt(result.rows[0]?.counter || '0');
        totalCount = parseInt(result.rows[0]?.total_count || '0');
      }
    } else {
      // ticket_noがない場合はカウント
      const result = await pool.query(`
        SELECT COUNT(*) AS total_count
        FROM reservations
        WHERE ${hasEventDate ? 'event_date = CURRENT_DATE' : 'created_at::date = CURRENT_DATE'}
      `);
      totalCount = parseInt(result.rows[0]?.total_count || '0');
      counter = totalCount;
    }
    
    console.log(`🎫 [GET /counter] カウンター: ${counter}, 件数: ${totalCount}, 呼び出し番号: ${currentNumber}`);
    
    return res.json({ ok: true, data: { counter, totalCount, currentNumber } });
  } catch (err) {
    console.error("❌ [GET /counter] DBエラー:", err);
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

// 呼び出し番号・整理券番号のリセット（管理者のみ）
router.post("/reset-counter", requireAdmin, async (req, res) => {
  try {
    console.log("🔄 [POST /reset-counter] カウンターリセット開始");
    
    // メモリ内の呼び出し番号をリセット
    currentNumber = 1;
    systemPaused = false;

    // 手動の日付リセットでも、それ以前に発行した専用URLを無効化する
    await pool.query(`
      UPDATE reservations
      SET ticket_token_expires_at = NOW()
      WHERE ticket_token_expires_at > NOW()
    `);
    
    console.log("✅ [POST /reset-counter] カウンターをリセット: 1");
    
    return res.json({ 
      ok: true, 
      message: "カウンターをリセットしました",
      data: { currentNumber: 1, systemPaused: false } 
    });
  } catch (err) {
    console.error("❌ [POST /reset-counter] エラー:", err);
    return res.status(500).json({ ok: false, error: "reset_failed" });
  }
});

/** 予約全消去＆IDリセット（POST統一・安全なSQL） */
router.post("/clear-all", requireAdmin, async (req, res) => {
  console.log("[POST /clear-all] リクエスト受信");
  
  try {
    await pool.query('BEGIN');
    // TRUNCATE は速く安全。RESTART IDENTITY で id を 1 に戻す。CASCADE で外部参照があっても整合を保つ。
    await pool.query('TRUNCATE TABLE reservations RESTART IDENTITY CASCADE');
    await pool.query('COMMIT');
    
    console.log("[POST /clear-all] 削除成功");
    
    // メモリ内のカウンターもリセット
    currentNumber = 1;
    systemPaused = false;
    
    return res.json({ ok: true, deleted: 'ALL' });
  } catch (e: any) {
    await pool.query('ROLLBACK');
    console.error('[POST /clear-all] エラー:', e?.message);
    return res.status(500).json({ ok: false, error: 'db_error', detail: e?.message });
  }
});

/** 互換: 旧 DELETE を非推奨化 */
router.delete("/all", requireAdmin, async (_req, res) => {
  res.status(410).json({ ok: false, error: 'deprecated_use_POST_/api/reservations/clear-all' });
});

export default router;
