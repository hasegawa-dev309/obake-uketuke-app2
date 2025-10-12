import express from "express";
import { pool } from "../db";

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

// 整理券一覧取得API
router.get("/", async (_req, res) => {
  checkAndResetIfNeeded();
  
  // データベースがない場合はメモリから返す
  if (!process.env.DATABASE_URL) {
    return res.json(memoryTickets);
  }
  
  try {
    const result = await pool.query(`
      SELECT 
        id,
        ticket_no,
        email,
        count,
        age,
        status,
        created_at,
        called_at
      FROM reservations 
      WHERE DATE(created_at) = CURRENT_DATE
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error (GET /reservations):", err);
    // データベースエラーの場合はメモリから返す
    res.json(memoryTickets);
  }
});

// 整理券発行API
router.post("/", async (req, res) => {
  const { email, count, age } = req.body;
  
  checkAndResetIfNeeded();
  
  // バリデーション
  if (!email || !count || !age) {
    return res.status(400).json({ error: 'Missing required fields: email, count, age' });
  }
  
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
      createdAt: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    memoryTickets.push(newTicket);
    return res.status(201).json(newTicket);
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO reservations (ticket_no, email, count, age, status, created_at)
       VALUES (
         (SELECT COALESCE(MAX(ticket_no), 0) + 1 FROM reservations WHERE DATE(created_at) = CURRENT_DATE),
         $1, $2, $3, '未呼出', NOW()
       )
       RETURNING *`,
      [email, count, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB Error (POST /reservations):", err);
    // エラー時はメモリに保存
    ticketCounter++;
    const newTicket = {
      id: ticketCounter.toString(),
      ticketNo: ticketCounter.toString(),
      email,
      count: parseInt(count),
      age,
      status: '未呼出',
      createdAt: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    memoryTickets.push(newTicket);
    res.status(201).json(newTicket);
  }
});

// 整理券ステータス更新API
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Missing required field: status' });
  }
  
  // データベースがない場合はメモリで更新
  if (!process.env.DATABASE_URL) {
    const ticket = memoryTickets.find(t => t.id === id || t.ticketNo === id);
    if (!ticket) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    ticket.status = status;
    return res.json(ticket);
  }
  
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = $1, called_at = NOW() 
       WHERE id = $2 OR ticket_no::text = $2
       RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
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

// 整理券削除API
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `DELETE FROM reservations WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json({ message: 'Deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error("DB Error (DELETE /reservations/:id):", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 管理画面用：整理券統計API
router.get("/stats", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM reservations
      GROUP BY status
    `);
    
    const stats = {
      total: 0,
      byStatus: {} as Record<string, number>
    };
    
    result.rows.forEach(row => {
      stats.byStatus[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });
    
    res.json(stats);
  } catch (err) {
    console.error("DB Error (GET /reservations/stats):", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 呼び出し番号管理API
router.get("/current-number", (_req, res) => {
  res.json({ currentNumber, systemPaused });
});

router.put("/current-number", (req, res) => {
  const { currentNumber: newNumber, systemPaused: newPaused } = req.body;
  if (newNumber !== undefined) currentNumber = newNumber;
  if (newPaused !== undefined) systemPaused = newPaused;
  res.json({ currentNumber, systemPaused });
});

// 整理券カウンター取得API
router.get("/counter", (_req, res) => {
  checkAndResetIfNeeded();
  res.json({ counter: ticketCounter });
});

export default router;