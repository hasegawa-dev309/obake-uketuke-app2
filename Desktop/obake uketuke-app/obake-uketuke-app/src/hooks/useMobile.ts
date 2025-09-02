import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 初期チェック
    checkMobile();

    // リサイズ時のチェック
    window.addEventListener('resize', checkMobile);

    // クリーンアップ
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}; 