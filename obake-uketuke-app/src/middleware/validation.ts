import { Request, Response, NextFunction } from 'express';

// メールアドレスのバリデーション
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 予約データのバリデーションミドルウェア
export function validateReservation(req: Request, res: Response, next: NextFunction) {
  const { email, count, age } = req.body;
  
  // 必須項目チェック
  if (!email || !count || !age) {
    return res.status(400).json({ 
      error: '必須項目が不足しています',
      details: {
        email: !email ? '必須' : undefined,
        count: !count ? '必須' : undefined,
        age: !age ? '必須' : undefined
      }
    });
  }
  
  // メールアドレス形式チェック
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'メールアドレスの形式が正しくありません' });
  }
  
  // 人数チェック（1〜10名）
  const countNum = parseInt(count);
  if (isNaN(countNum) || countNum < 1 || countNum > 10) {
    return res.status(400).json({ error: '人数は1〜10名の範囲で指定してください' });
  }
  
  // 年齢層チェック
  const validAges = ['一般', '大学生', '高校生以下'];
  if (!validAges.includes(age)) {
    return res.status(400).json({ error: '年齢層の値が正しくありません' });
  }
  
  next();
}

// ステータス更新のバリデーション
export function validateStatus(req: Request, res: Response, next: NextFunction) {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'ステータスが指定されていません' });
  }
  
  const validStatuses = ['未呼出', '来場済', '未確認', 'キャンセル'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'ステータスの値が正しくありません' });
  }
  
  next();
}

