import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, LockKey } from 'phosphor-react';
import { API_CONFIG } from '../../config/api.config';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/login`, {
        method: 'POST',
        headers: API_CONFIG.headers,
        mode: 'cors',
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'ログインに失敗しました');
      }

      const data = await response.json();
      
      // トークンを保存
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_token_expires', String(Date.now() + 12 * 60 * 60 * 1000));
      
      console.log('✅ ログイン成功');
      
      // 管理画面にリダイレクト
      navigate('/');
    } catch (err: any) {
      console.error('ログインエラー:', err);
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ロゴ */}
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Ghost size={32} weight="fill" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">管理画面ログイン</h1>
          <p className="text-center text-slate-600 mb-8">お化け屋敷 整理券システム</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                管理者パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockKey size={20} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="パスワードを入力"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '認証中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            第61回 東洋大学 白山祭
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

