import express from 'express';
import { generateAdminToken, verifyAdminPassword } from '../middleware/auth';

const router = express.Router();

// 管理者ログインAPI
router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'パスワードが指定されていません' });
  }
  
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: 'パスワードが正しくありません' });
  }
  
  // JWTトークンを生成
  const token = generateAdminToken();
  
  res.json({
    success: true,
    token,
    expiresIn: '12h'
  });
});

// トークン検証API
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  
  try {
    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const secret = process.env.ADMIN_JWT_SECRET || 'default-secret-change-in-production';
    
    jwt.verify(token, secret);
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

export default router;

