import express from "express";
import { pool } from "../db";
import { requireAdmin } from "../middleware/auth";
import { validateReservation, validateStatus } from "../middleware/validation";

const router = express.Router();

// メモリベースのストレージ（データベースがない場合のフォールバック）
let memoryTickets: any[] = [];
let ticketCounter = 0;
let currentNumber = 1;
let systemPaused = false;
let lastResetDate = new Date().toISOString().split('T')[0];

// 日付が変わったらリセット
function checkAndResetIfNeeded() {
  const today = new Date().toISOString().split('T')[0];
  if (lastResetDate !== today) {
    lastResetDate = today;
    memoryTickets = [];
    ticketCounter = 0;
    currentNumber = 1;
    console.log('📅 新しい日が開始されました。データをリセットしました。');
  }
}

// 整理券一覧取得API（管理者のみ）
router.get("/", requireAdmin, async (_req, res) => {
  console.log('📋 整理券一覧取得リクエスト受信');
  console.log(`🔍 DATABASE_URL存在: ${!!process.env.DATABASE_URL}`);
  
  checkAndResetIfNeeded();
  
  // データベースがない場合はメモリから返す
  if (!process.env.DATABASE_URL) {
    console.log(`📊 メモリから返す: ${memoryTickets.length}件`);
    return res.json(memoryTickets);
  }
  
  try {
    console.log('💾 DB SELECT開始...');
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
        TO_CHAR(created_at, 'YYYY/MM/DD HH24:MI') AS "createdAt",
        called_at AS "calledAt"
      FROM reservations 
      WHERE DATE(created_at) = CURRENT_DATE
      ORDER BY created_at DESC
    `);
    console.log(`✅ DB取得成功: ${result.rows.length}件`);
    console.log(`📄 取得データ:`, JSON.stringify(result.rows.slice(0, 3)));
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB Error (GET /reservations):", err);
    console.log(`📊 フォールバック: メモリから返す (${memoryTickets.length}件)`);
    // データベースエラーの場合はメモリから返す
    res.json(memoryTickets);
  }
});

// 整理券発行API（公開 - 認証不要、レート制限あり）
router.post("/", validateReservation, async (req, res) => {
  const { email, count, age, channel = 'web' } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  
  console.log(`📥 整理券発行リクエスト: email=${email}, count=${count}, age=${age}, channel=${channel}`);
  console.log(`🔍 DATABASE_URL存在: ${!!process.env.DATABASE_URL}`);
  
  checkAndResetIfNeeded();
  
  // データベースがない場合はメモリに保存
  if (!process.env.DATABASE_URL) {
    ticketCounter++;
    const newTicket = {
      id: ticketCounter.toString(),
      ticketNo: ticketCounter.toString(),
      email,
      count: parseInt(count),
      age,
      status: '未呼出',
      channel,
      userAgent,
      createdAt: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    memoryTickets.push(newTicket);
    console.log(`✅ 整理券発行 (メモリ): #${ticketCounter} - ${email} (${channel})`);
    console.log(`📊 メモリ内整理券数: ${memoryTickets.length}`);
    return res.status(201).json(newTicket);
  }
  
  try {
    console.log('💾 DB INSERT開始...');
    const result = await pool.query(
      `INSERT INTO reservations (ticket_no, email, count, age, status, channel, user_agent, created_at)
       VALUES (
         (SELECT COALESCE(MAX(ticket_no), 0) + 1 FROM reservations WHERE DATE(created_at) = CURRENT_DATE),
         $1, $2, $3, '未呼出', $4, $5, NOW()
       )
       RETURNING 
         id,
         ticket_no AS "ticketNo",
         email,
         count,
         age,
         status,
         channel,
         user_agent AS "userAgent",
         TO_CHAR(created_at, 'YYYY/MM/DD HH24:MI') AS "createdAt"`,
      [email, count, age, channel, userAgent]
    );
    
    console.log(`✅ 整理券発行 (DB成功): #${result.rows[0].ticketNo} - ${email} (${channel})`);
    console.log(`📄 DB保存結果:`, JSON.stringify(result.rows[0]));
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Error (POST /reservations):", err);
    console.error("エラー詳細:", err);
    // エラー時はメモリに保存
    ticketCounter++;
    const newTicket = {
      id: ticketCounter.toString(),
      ticketNo: ticketCounter.toString(),
      email,
      count: parseInt(count),
      age,
      status: '未呼出',
      channel,
      userAgent,
      createdAt: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    memoryTickets.push(newTicket);
    console.log(`⚠️ 整理券発行 (メモリ/フォールバック): #${ticketCounter}`);
    console.log(`📊 メモリ内整理券数: ${memoryTickets.length}`);
    res.status(201).json(newTicket);
  }
});

// 整理券ステータス更新API（管理者のみ）
router.put("/:id/status", requireAdmin, validateStatus, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // データベースがない場合はメモリで更新
  if (!process.env.DATABASE_URL) {
    const ticket = memoryTickets.find(t => t.id === id || t.ticketNo === id);
    if (!ticket) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    ticket.status = status;
    console.log(`📝 ステータス更新 (メモリ): #${ticket.ticketNo} → ${status}`);
    return res.json(ticket);
  }
  
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = $1, called_at = NOW(), updated_at = NOW()
       WHERE id = $2 OR ticket_no::text = $2
       RETURNING 
         id,
         ticket_no AS "ticketNo",
         email,
         count,
         age,
         status,
         channel,
         TO_CHAR(created_at, 'YYYY/MM/DD HH24:MI') AS "createdAt"`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    console.log(`📝 ステータス更新 (DB): #${result.rows[0].ticketNo} → ${status}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error (PUT /reservations/:id/status):", err);
    // エラー時はメモリで更新
    const ticket = memoryTickets.find(t => t.id === id || t.ticketNo === id);
    if (!ticket) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    ticket.status = status;
    res.json(ticket);
  }
});

// 整理券削除API（管理者のみ）
router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  // データベースがない場合はメモリから削除
  if (!process.env.DATABASE_URL) {
    const index = memoryTickets.findIndex(t => t.id === id || t.ticketNo === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    const deleted = memoryTickets.splice(index, 1)[0];
    console.log(`🗑️ 整理券削除 (メモリ): #${deleted.ticketNo}`);
    return res.json({ message: 'Deleted successfully', data: deleted });
  }
  
  try {
    const result = await pool.query(
      `DELETE FROM reservations WHERE id = $1 OR ticket_no::text = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    console.log(`🗑️ 整理券削除 (DB): #${result.rows[0].ticket_no}`);
    res.json({ message: 'Deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error("DB Error (DELETE /reservations/:id):", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 管理画面用：整理券統計API（管理者のみ）
router.get("/stats", requireAdmin, async (_req, res) => {
  checkAndResetIfNeeded();
  
  // データベースがない場合はメモリから統計を取得
  if (!process.env.DATABASE_URL) {
    const stats = {
      total: memoryTickets.length,
      byStatus: {} as Record<string, number>,
      byChannel: {} as Record<string, number>,
      byAge: {} as Record<string, number>
    };
    
    memoryTickets.forEach(t => {
      stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
      stats.byChannel[t.channel || 'web'] = (stats.byChannel[t.channel || 'web'] || 0) + 1;
      stats.byAge[t.age] = (stats.byAge[t.age] || 0) + 1;
    });
    
    return res.json(stats);
  }
  
  try {
    // ステータス別統計
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM reservations
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY status
    `);
    
    // チャネル別統計
    const channelResult = await pool.query(`
      SELECT channel, COUNT(*) as count
      FROM reservations
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY channel
    `);
    
    // 年齢層別統計
    const ageResult = await pool.query(`
      SELECT age, COUNT(*) as count
      FROM reservations
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY age
    `);
    
    // 総数
    const totalResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM reservations
      WHERE DATE(created_at) = CURRENT_DATE
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
    
    res.json(stats);
  } catch (err) {
    console.error("DB Error (GET /reservations/stats):", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 呼び出し番号管理API（管理者のみ）
router.get("/current-number", requireAdmin, (_req, res) => {
  res.json({ currentNumber, systemPaused });
});

router.put("/current-number", requireAdmin, (req, res) => {
  const { currentNumber: newNumber, systemPaused: newPaused } = req.body;
  if (newNumber !== undefined) {
    currentNumber = newNumber;
    console.log(`🔢 呼び出し番号更新: ${currentNumber}`);
  }
  if (newPaused !== undefined) {
    systemPaused = newPaused;
    console.log(`⏸️ システム状態: ${systemPaused ? '一時停止' : '稼働中'}`);
  }
  res.json({ currentNumber, systemPaused });
});

// 整理券カウンター取得API（公開 - 予約完了画面用）
router.get("/counter", (_req, res) => {
  checkAndResetIfNeeded();
  res.json({ counter: ticketCounter, currentNumber });
});

export default router;