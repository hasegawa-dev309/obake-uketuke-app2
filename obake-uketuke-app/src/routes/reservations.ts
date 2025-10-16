import express from "express";
import { pool } from "../db";
import { requireAdmin } from "../middleware/auth";
import { validateReservation, validateStatus } from "../middleware/validation";

const router = express.Router();

// 呼び出し番号管理用（メモリ）
let currentNumber = 1;
let systemPaused = false;

// 整理券一覧取得API（管理者のみ）
router.get("/", requireAdmin, async (_req, res) => {
  console.log('📋 [GET /api/reservations] リクエスト受信');
  
  try {
    const result = await pool.query(`
      SELECT 
        id,
        ticket_no AS "ticketNo",
        email,
        count,
        age,
        status,
        channel,
        user_agent AS "userAgent",
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY/MM/DD HH24:MI') AS "createdAt",
        called_at AS "calledAt"
      FROM reservations 
      WHERE created_at::date = CURRENT_DATE
      ORDER BY created_at ASC
    `);
    
    console.log(`✅ [GET /api/reservations] DB取得成功: ${result.rows.length}件`);
    if (result.rows.length > 0) {
      console.log(`📄 サンプルデータ:`, JSON.stringify(result.rows[0]));
    }
    
    return res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error("❌ [GET /api/reservations] DBエラー:", err);
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

// 整理券発行API（公開 - 認証不要、レート制限あり）
router.post("/", validateReservation, async (req, res) => {
  const { email, count, age, channel = 'web' } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  
  console.log(`📥 [POST /api/reservations] email=${email}, count=${count}, age=${age}, channel=${channel}`);
  
  // トランザクションで確実にDB保存
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('💾 [POST] トランザクション開始');
    
    // 当日の最大整理券番号を取得
    const nextResult = await client.query<{ ticket_no: number }>(`
      WITH last_today AS (
        SELECT COALESCE(MAX(ticket_no), 0) AS last_no
        FROM reservations
        WHERE created_at::date = CURRENT_DATE
      )
      SELECT last_no + 1 AS ticket_no FROM last_today
    `);
    
    const ticketNo = nextResult.rows[0].ticket_no;
    console.log(`🎫 [POST] 次の整理券番号: ${ticketNo}`);
    
    // INSERT実行
    const inserted = await client.query(`
      INSERT INTO reservations
        (ticket_no, email, count, age, status, channel, user_agent, created_at)
      VALUES ($1, $2, $3, $4, '未呼出', $5, $6, NOW())
      RETURNING 
        id,
        ticket_no AS "ticketNo",
        email,
        count,
        age,
        status,
        channel,
        user_agent AS "userAgent",
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY/MM/DD HH24:MI') AS "createdAt"
    `, [ticketNo, email, count, age, channel, userAgent]);
    
    await client.query('COMMIT');
    console.log(`✅ [POST] DB保存成功: #${ticketNo} - ${email} (${channel})`);
    console.log(`📄 [POST] 保存結果:`, JSON.stringify(inserted.rows[0]));
    
    return res.status(201).json({ ok: true, data: inserted.rows[0] });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ [POST /api/reservations] ROLLBACK:", err);
    console.error("エラー詳細:", err);
    return res.status(500).json({ ok: false, error: "db_error", details: String(err) });
  } finally {
    client.release();
  }
});

// 整理券ステータス更新API（管理者のみ）
router.put("/:id/status", requireAdmin, validateStatus, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`📝 [PUT /:id/status] id=${id}, status=${status}`);
  console.log(`📝 [PUT] Request body:`, req.body);
  console.log(`📝 [PUT] Request headers:`, req.headers);
  
  try {
    // まず対象のレコードが存在するかチェック
    const checkResult = await pool.query(
      `SELECT id, ticket_no FROM reservations 
       WHERE id = $1::bigint OR ticket_no = $1::bigint 
       AND created_at::date = CURRENT_DATE`,
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      console.log(`⚠️ [PUT] 整理券が見つかりません: ${id}`);
      return res.status(404).json({ ok: false, error: 'Reservation not found' });
    }
    
    console.log(`📝 [PUT] 対象レコード発見: id=${checkResult.rows[0].id}, ticket_no=${checkResult.rows[0].ticket_no}`);
    
    const result = await pool.query(
      `UPDATE reservations 
       SET status = $1, called_at = NOW()
       WHERE id = $2::bigint OR ticket_no = $2::bigint
       RETURNING 
         id,
         ticket_no AS "ticketNo",
         email,
         count,
         age,
         status,
         channel,
         TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY/MM/DD HH24:MI') AS "createdAt"`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`⚠️ [PUT] 更新後のレコードが見つかりません: ${id}`);
      return res.status(404).json({ ok: false, error: 'Update failed' });
    }
    
    console.log(`✅ [PUT] ステータス更新成功: #${result.rows[0].ticketNo} → ${status}`);
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
router.get("/current-number", requireAdmin, (_req, res) => {
  console.log(`🔢 [GET /current-number] 現在: ${currentNumber}`);
  return res.json({ ok: true, data: { currentNumber, systemPaused } });
});

// 公開：システム状態取得（認証不要）
router.get("/status", (_req, res) => {
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
    const result = await pool.query(`
      SELECT COALESCE(MAX(ticket_no), 0) AS counter
      FROM reservations
      WHERE created_at::date = CURRENT_DATE
    `);
    
    const counter = result.rows[0]?.counter || 0;
    console.log(`🎫 [GET /counter] カウンター: ${counter}, 呼び出し番号: ${currentNumber}`);
    
    return res.json({ ok: true, data: { counter, currentNumber } });
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