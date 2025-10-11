import express from "express";
import { pool } from "../db";

const router = express.Router();

// 整理券一覧取得API
router.get("/", async (_req, res) => {
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
        updated_at
      FROM reservations 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error (GET /reservations):", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 整理券発行API
router.post("/", async (req, res) => {
  const { email, count, age } = req.body;
  
  // バリデーション
  if (!email || !count || !age) {
    return res.status(400).json({ error: 'Missing required fields: email, count, age' });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO reservations (ticket_no, email, count, age, status, created_at, updated_at)
       VALUES (
         (SELECT COALESCE(MAX(ticket_no), 0) + 1 FROM reservations),
         $1, $2, $3, '未呼出', NOW(), NOW()
       )
       RETURNING *`,
      [email, count, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB Error (POST /reservations):", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 整理券ステータス更新API
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Missing required field: status' });
  }
  
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error (PUT /reservations/:id/status):", err);
    res.status(500).json({ error: "Database error" });
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

export default router;
