import { useState, useEffect } from "react";

function App() {
  const [ticker, setTicker] = useState("");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("myPortfolio");
    if (saved) {
      setPortfolio(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/exchange-rate");
        const data = await response.json();
        if (data.rate) {
          setExchangeRate(data.rate);
        } else {
          alert("為替レートの取得に失敗しました");
        }
      } catch (err) {
        console.error("為替取得エラー:", err);
        alert("為替レートの取得にエラーが発生しました");
      }
    };
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("myPortfolio", JSON.stringify(portfolio));
    }
  }, [portfolio, isInitialized]);

  const totalProfit = portfolio.reduce((acc, item) => {
    const profit = (item.currentPrice - item.buyPrice) * item.amount;
    return acc + profit;
  }, 0);

  const totalProfitYen = totalProfit * exchangeRate;

  const handleAdd = async () => {
    if (!ticker.trim() || !amount || !price) {
      alert("ティッカー、株数、取得株価をすべて入力してください");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/price/${ticker}`);
      const data = await response.json();
      if (data && data.price != null) {
        const newItem = {
          ticker: ticker.toUpperCase(),
          currentPrice: parseFloat(data.price),
          buyPrice: parseFloat(price),
          amount: parseInt(amount),
        };
        setPortfolio([...portfolio, newItem]);
        setTicker("");
        setAmount("");
        setPrice("");
      } else {
        alert("株価が取得できませんでした");
      }
    } catch (err) {
      console.error("株価取得エラー:", err);
      alert("株価取得中にエラーが発生しました");
    }
  };

  const handleDelete = (indexToDelete) => {
    const newPortfolio = portfolio.filter((_, index) => index !== indexToDelete);
    setPortfolio(newPortfolio);
  };

  const handleClearAll = () => {
    setPortfolio([]);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="App min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white px-4 py-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="mb-4 px-4 py-2 rounded border dark:border-white border-black"
        >
          {isDarkMode ? "☀️ ライトモード" : "🌙 ダークモード"}
        </button>

        <h1 className="text-2xl font-bold mb-4">ポートフォリオ管理アプリ</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="ティッカー (例: AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="株数 (例:10)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="取得価格 (例:150)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            追加（株価自動取得）
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-2">保有銘柄</h2>
        <table className="w-full text-left border border-collapse mb-4">
          <thead>
            <tr>
              <th className="border px-2">ティッカー</th>
              <th className="border px-2">取得価格</th>
              <th className="border px-2">株数</th>
              <th className="border px-2">現在価格</th>
              <th className="border px-2">評価損益(ドル)</th>
              <th className="border px-2">評価損益(円)</th>
              <th className="border px-2">売り時</th>
              <th className="border px-2">削除</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item, index) => {
              const profit = (item.currentPrice - item.buyPrice) * item.amount;
              const profitYen = profit * exchangeRate;
              return (
                <tr key={index}>
                  <td className="border px-2">{item.ticker}</td>
                  <td className="border px-2">{item.buyPrice}</td>
                  <td className="border px-2">{item.amount}</td>
                  <td className="border px-2">{item.currentPrice}</td>
                  <td
                    className={`border px-2 ${
                      profit >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {profit.toFixed(2)}
                  </td>
                  <td
                    className={`border px-2 ${
                      profit >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {profitYen.toFixed(0)}
                  </td>
                  <td className="border px-2">{profit > 0 ? "◯" : "✖︎"}</td>
                  <td className="border px-2">
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          onClick={handleClearAll}
          className="text-red-500 mb-4 underline"
        >
          保有銘柄をすべて削除
        </button>

        <h3 className="text-lg font-semibold">ポートフォリオ全体の合計損益</h3>
        <p>
          💰 {totalProfit.toFixed(2)} ドル（約 {totalProfitYen.toFixed(0)} 円）<br />
          {totalProfit > 0 ? "👍 利益が出ています！" : "📉 損失が出ています…"}
        </p>
      </div>
    </div>
  );
}

export default App;
