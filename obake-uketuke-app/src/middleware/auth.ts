import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'default-secret-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    role: string;
  };
}

// JWT認証ミドルウェア
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT認証エラー:', err);
    return res.status(401).json({ error: '無効なトークンです' });
  }
}

// ログインAPI用のトークン生成
export function generateAdminToken(): string {
  return jwt.sign(
    { role: 'admin' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// パスワード検証
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return password === adminPassword;
}

