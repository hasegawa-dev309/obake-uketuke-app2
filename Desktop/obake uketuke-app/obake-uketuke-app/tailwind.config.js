/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './admin.html',
    './reservation.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#2563eb', foreground: '#ffffff' },
        surface: { bg: '#f8fafc', card: '#ffffff', muted: '#e2e8f0', text: '#0f172a' }
      },
      borderRadius: { base: '0.5rem' },
      boxShadow: { card: '0 4px 16px rgba(2,6,23,.06)' },
      fontFamily: { sans: ['Inter','Noto Sans JP','system-ui','sans-serif'] }
    },
  },
  plugins: [],
  safelist: [
    // 入力・セレクト・テキストエリア
    'h-10','w-full','rounded-base','border','border-surface-muted','bg-white','px-3',
    'outline-none','focus:ring-2','focus:ring-brand',
    // ボタン
    'bg-brand','text-white','font-medium','hover:opacity-90','disabled:opacity-60',
    // レイアウト
    'mx-auto','max-w-3xl','px-4','pb-24',
    // 画面全体
    'font-sans','bg-surface-bg','text-surface-text',
    // カード/影
    'shadow-card',
    // 管理画面用クラス
    { pattern: /(bg|text|border)-(brand|surface|green|yellow|red|slate|indigo|amber|emerald|rose)(-|$)/ },
    { pattern: /(h|w)-\[(240|1200)px\]/ },
    { pattern: /(min|max)-h-screen/ },
    { pattern: /(flex|grid)-(col|row)/ },
    { pattern: /(gap|space)-(x|y)-[0-9]/ },
    { pattern: /(p|m|px|py|mx|my)-[0-9]/ },
    { pattern: /(rounded|shadow)-[a-z]+/ },
    { pattern: /(hover|focus|active):[a-z-]+/ },
    { pattern: /(transition|transform)-[a-z]+/ },
  ],
}
