import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export function UserLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ・タイトル */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">👻</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">お化け屋敷 整理券システム</h1>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/reservation"
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                予約フォーム
              </Link>
              <Link
                to="/mypage"
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                現在状況
              </Link>
              <Link
                to="/admin"
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors bg-purple-100 px-3 py-1 rounded-full"
              >
                管理者ページ
              </Link>
              <Link
                to="/debug"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors bg-blue-100 px-3 py-1 rounded-full"
              >
                デバッグ
              </Link>
            </nav>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>

          {/* モバイルナビゲーション */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-orange-200 py-4">
              <nav className="flex flex-col space-y-3">
                <Link
                  to="/reservation"
                  className="text-gray-600 hover:text-orange-600 font-medium transition-colors px-2 py-1 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  予約フォーム
                </Link>
                <Link
                  to="/mypage"
                  className="text-gray-600 hover:text-orange-600 font-medium transition-colors px-2 py-1 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  現在状況
                </Link>
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-purple-600 font-medium transition-colors bg-purple-100 px-3 py-1 rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  管理者ページ
                </Link>
                <Link
                  to="/debug"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors bg-blue-100 px-3 py-1 rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  デバッグ
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-orange-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-500 text-sm">
            © 2024 お化け屋敷整理券システム
          </div>
        </div>
      </footer>
    </div>
  )
} 