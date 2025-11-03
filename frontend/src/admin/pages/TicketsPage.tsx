import { useEffect, useState, useCallback, useMemo } from "react";
import { ArrowClockwise, Download, UserCircle, Ticket as TicketIcon, CheckCircle, Clock, XCircle } from "phosphor-react";
import { fetchReservations, updateReservationStatus, deleteReservation } from "../../lib/api";

type Ticket = { 
  id: string; // フロントエンド用の一意なid（React key・表示用）
  dbId: string; // データベースの実際のid（API呼び出し用）
  email: string; 
  count: number; 
  age: string; 
  status: string;
  createdAt: string;
  ticketNo?: string;
  eventDate?: string; // event_dateフィールド（あれば）
};

export default function TicketsPage(){
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("すべて");
  const [statusFilter, setStatusFilter] = useState("すべて");

  // APIから整理券データを取得（認証付き）
  const loadTickets = useCallback(async () => {
    try {
      console.log("🔄 [TicketsPage] 整理券データ取得開始...");
      const result = await fetchReservations();
      
      console.log("📥 [TicketsPage] APIレスポンス:", {
        ok: result.ok,
        dataLength: result.data?.length || 0,
        error: result.error
      });
      
      if (result.ok && result.data) {
        console.log("✅ 整理券データ取得成功:", result.data.length + "件");
        if (result.data.length > 0) {
          console.log("📄 サンプルデータ:", result.data[0]);
        }
        
        // データを正しい型に変換（idとticketNoを文字列に変換）
        const mappedTickets: Ticket[] = result.data.map((item: any, index: number) => {
          const ticketNo = item.ticketNo !== null && item.ticketNo !== undefined 
            ? String(item.ticketNo) 
            : (item.ticket_no !== null && item.ticket_no !== undefined 
                ? String(item.ticket_no) 
                : String(item.id || ''));
          
          // データベースの実際のidを保存
          const dbId = String(item.id || '');
          const eventDate = item.eventDate || item.event_date || '';
          
          // フロントエンド用の一意なidを生成（必ずticketNoベースで一意にする）
          // バックエンドのidが重複していても問題ないようにする
          let uniqueId: string;
          if (eventDate && ticketNo && ticketNo !== 'undefined' && ticketNo !== 'null' && ticketNo !== '') {
            // eventDate-ticketNoの組み合わせ（最も確実に一意）
            uniqueId = `${eventDate}-${ticketNo}`;
          } else if (ticketNo && ticketNo !== 'undefined' && ticketNo !== 'null' && ticketNo !== '') {
            // eventDateがない場合はticketNoのみ（日付が変われば問題ない）
            uniqueId = `ticket-${ticketNo}`;
          } else {
            // 最後の手段：dbId-indexの組み合わせ
            uniqueId = `item-${dbId || index}-${index}`;
          }
          
          return {
            id: uniqueId, // フロントエンド用の一意なid
            dbId: dbId, // データベースの実際のid（API呼び出し用）
            email: item.email || '',
            count: Number(item.count || 0),
            age: item.age || '',
            status: item.status || '未呼出',
            createdAt: item.createdAt || item.created_at || '',
            ticketNo: ticketNo,
            eventDate: eventDate
          };
        });
        
        // keyの衝突チェックと自動修正
        const idMap = new Map<string, number>();
        const fixedTickets = mappedTickets.map((t, index) => {
          if (idMap.has(t.id)) {
            // 重複が見つかった：ticketNoとindexで一意なidを生成
            const count = idMap.get(t.id)!;
            idMap.set(t.id, count + 1);
            
            const newId = t.eventDate && t.ticketNo 
              ? `${t.eventDate}-${t.ticketNo}-${count}`
              : t.ticketNo 
                ? `${t.ticketNo}-${count}`
                : `item-${index}`;
            
            console.warn(`⚠️ [id重複修正] index=${index}, ticketNo=${t.ticketNo}, 旧id=${t.id}, 新id=${newId}`);
            
            return {
              ...t,
              id: newId
            };
          } else {
            idMap.set(t.id, 1);
            return t;
          }
        });
        
        // 最終的なkeyの衝突チェック
        const finalKeySet = new Set(fixedTickets.map(t => t.id));
        if (finalKeySet.size !== fixedTickets.length) {
          console.error('❌ [致命的] idの重複が解消できませんでした:', fixedTickets.length - finalKeySet.size, '件');
          console.error('重複するid:', fixedTickets.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) !== i).map(t => ({ id: t.id, ticketNo: t.ticketNo, email: t.email })));
        } else {
          console.log('✅ [id検証] すべてのidが一意です:', finalKeySet.size, '件');
        }
        
        // #67と#71のidを特別にログ出力
        const ticket67 = fixedTickets.find(t => String(t.ticketNo) === '67');
        const ticket71 = fixedTickets.find(t => String(t.ticketNo) === '71');
        if (ticket67) {
          console.log('🔍 [#67] id:', ticket67.id, 'dbId:', ticket67.dbId, 'ticketNo:', ticket67.ticketNo, 'email:', ticket67.email, 'status:', ticket67.status);
        }
        if (ticket71) {
          console.log('🔍 [#71] id:', ticket71.id, 'dbId:', ticket71.dbId, 'ticketNo:', ticket71.ticketNo, 'email:', ticket71.email, 'status:', ticket71.status);
        }
        
        // マッピング後のticketsをfixedTicketsに置き換え
        const mappedTicketsFinal = fixedTickets;
        
        console.log("🔄 マッピング後:", mappedTicketsFinal.length + "件", mappedTicketsFinal[0]);
        console.log("🔍 [マッピング] ステータス分布:", {
          未呼出: mappedTicketsFinal.filter(t => t.status === "未呼出").length,
          来場済: mappedTicketsFinal.filter(t => t.status === "来場済").length,
          未確認: mappedTicketsFinal.filter(t => t.status === "未確認").length,
          キャンセル: mappedTicketsFinal.filter(t => t.status === "キャンセル").length
        });
        console.log("🔍 [マッピング] サンプル（最初の3件）:", mappedTicketsFinal.slice(0, 3).map(t => ({
          id: t.id,
          ticketNo: t.ticketNo,
          status: t.status,
          email: t.email
        })));
        console.log("🔍 [マッピング] 全idリスト:", mappedTicketsFinal.map(t => ({ id: t.id, ticketNo: t.ticketNo })));
        setTickets(mappedTicketsFinal);
      } else {
        console.error("⚠️ 整理券データの取得に失敗:", result);
        if (result.error) {
          console.error("エラー詳細:", result.error, result.details);
        }
        // エラー時も既存データを保持（空配列にしない）
        // setTickets([]);
      }
    } catch (err: any) {
      console.error("❌ 整理券データ取得エラー:", err);
      console.error("エラー詳細:", err.message, err.stack);
      // エラー時も既存データを保持
      // setTickets([]);
    }
  }, []);

  useEffect(() => {
    // 初回読み込み
    loadTickets();
    
    // 定期的に更新（2秒ごとに短縮して即座に反映）
    const interval = setInterval(() => {
      console.log('🔄 [TicketsPage] 定期更新実行');
      loadTickets();
    }, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // 表示用配列を安定化（useMemo + slice()で非破壊）
  const rows = useMemo(() => {
    return tickets
      .filter(ticket => {
        const matchesSearch = ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             ticket.count.toString().includes(searchTerm);
        const matchesAge = ageFilter === "すべて" || ticket.age === ageFilter;
        const matchesStatus = statusFilter === "すべて" || ticket.status === statusFilter;
        
        return matchesSearch && matchesAge && matchesStatus;
      })
      .slice() // 破壊防止（元配列を触らない）
      .sort((a, b) => {
        // ticketNoでソート（番号順）
        const numA = Number(a.ticketNo || a.id || 0);
        const numB = Number(b.ticketNo || b.id || 0);
        return numA - numB;
      });
  }, [tickets, searchTerm, ageFilter, statusFilter]);
  
  // keyの衝突チェック（レンダリング直前）
  if (rows.length > 0) {
    const keySet = new Set(rows.map(r => r.id));
    console.assert(keySet.size === rows.length, '⚠️ keyの衝突:', rows.length - keySet.size, '件');
  }
  
  // 後方互換性のためにfilteredTicketsも定義
  const filteredTickets = rows;

  const getStatusCount = (status: string) => {
    return tickets.filter(t => t.status === status).length;
  };

  // idのみを受け取る（index参照を完全排除）
  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    console.log('🔄 [updateStatus] 呼び出し:', { id, newStatus });
    console.log('📊 [updateStatus] 現在のtickets配列（最初の5件）:', tickets.slice(0, 5).map(t => ({ id: t.id, ticketNo: t.ticketNo, email: t.email, status: t.status })));
    
    // 同じidを持つチケットが複数ないかチェック
    const matches = tickets.filter(x => x.id === id);
    if (matches.length > 1) {
      console.error(`❌ [updateStatus] 致命的: id=${id} が${matches.length}件見つかりました！`);
      console.error('重複するチケット:', matches.map(t => ({ id: t.id, ticketNo: t.ticketNo, email: t.email, status: t.status })));
      alert(`エラー: チケットID ${id} が重複しています。ページをリロードしてください。`);
      return;
    }
    
    // find()で確実にデータを取得（tickets配列を基準にする）
    const target = tickets.find(x => x.id === id);
    if (!target) {
      console.error(`❌ [updateStatus] エラー: id=${id} のチケットが見つかりません`);
      console.error('📊 [updateStatus] 現在のtickets配列（全件）:', tickets.map(t => ({ id: t.id, ticketNo: t.ticketNo, email: t.email })));
      alert(`エラー: チケットID ${id} が見つかりません`);
      return;
    }
    
    console.log('✅ [updateStatus] 対象チケット（更新前）:', { 
      id: target.id, 
      ticket: target.ticketNo, 
      email: target.email,
      status: target.status 
    });
    
    // 同じticketNoを持つ他のチケットもチェック（重複検出用）
    const sameTicketNo = tickets.filter(t => t.ticketNo === target.ticketNo && t.id !== target.id);
    if (sameTicketNo.length > 0) {
      console.warn('⚠️ [updateStatus] 同じticketNoを持つ他のチケット:', sameTicketNo.map(t => ({ id: t.id, ticketNo: t.ticketNo, email: t.email })));
    }
    
    try {
      // APIでステータスを更新（必ずdbIdを使用、数値に変換）
      const apiId = target.dbId || target.id;
      
      // dbIdが有効な数値かチェック
      const numericId = parseInt(apiId, 10);
      if (isNaN(numericId) || numericId <= 0) {
        console.error(`❌ [updateStatus] 無効なdbId: ${apiId}, ticketNo: ${target.ticketNo}`);
        alert(`エラー: チケットIDが無効です。ページをリロードしてください。`);
        return;
      }
      
      console.log('🌐 [updateStatus] API呼び出し:', { 
        apiId: numericId, 
        dbId: target.dbId, 
        uniqueId: target.id, 
        ticketNo: target.ticketNo,
        email: target.email
      });
      
      const result = await updateReservationStatus(String(numericId), newStatus);
      
      console.log("📝 [updateStatus] APIレスポンス:", result);
      
      if (result.ok) {
        console.log("✅ [updateStatus] ステータス更新成功");
        // 成功時のみUIを更新
        await loadTickets();
      } else {
        console.error("⚠️ [updateStatus] ステータス更新失敗:", result);
        const errorMsg = result.error || result.details || "ステータス更新に失敗しました";
        alert(`エラー: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("❌ [updateStatus] ステータス更新エラー:", err);
      console.error("❌ [updateStatus] エラー詳細:", err.message);
      alert(`ステータス更新に失敗しました: ${err.message || "ネットワークを確認してください"}`);
    }
  }, [tickets, loadTickets]);

  const handleDelete = useCallback(async (id: string) => {
    // find()で確実にデータを取得
    const target = tickets.find(x => x.id === id);
    if (!target) {
      console.error(`❌ [handleDelete] エラー: id=${id} のチケットが見つかりません`);
      return;
    }
    
    const ticketNo = target.ticketNo || target.id;
    if (!confirm(`整理券${ticketNo}番を削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    console.debug('🗑️ [handleDelete] 削除開始:', { id: target.id, dbId: target.dbId, ticket: target.ticketNo, email: target.email });

    try {
      // APIで削除（dbIdを使用、なければidをそのまま使用）
      const apiId = target.dbId || target.id;
      console.log('🌐 [handleDelete] API呼び出し:', { apiId, dbId: target.dbId, uniqueId: target.id, ticketNo: target.ticketNo });
      
      const result = await deleteReservation(apiId);
      
      if (result.ok) {
        console.log("✅ [handleDelete] 削除成功");
        alert(`整理券${ticketNo}番を削除しました`);
        // 成功時のみUIを更新
        await loadTickets();
      } else {
        console.error("⚠️ [handleDelete] 削除失敗:", result);
        alert(`エラー: ${result.error || "削除に失敗しました"}`);
      }
    } catch (err) {
      console.error("❌ [handleDelete] 削除エラー:", err);
      alert("削除に失敗しました。ネットワークを確認してください。");
    }
  }, [tickets, loadTickets]);

  const exportToCSV = () => {
    // 整理券データ（メールアドレスなし）
    const dataRows = [
      ["整理券番号", "人数", "年齢層", "来場状況", "登録時間"],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.count.toString(),
        ticket.age,
        ticket.status,
        ticket.createdAt
      ])
    ];

    // 年齢層別の統計
    const ageStats = ["一般", "大学生", "高校生以下"].map(ageGroup => {
      const count = tickets.filter(t => t.age === ageGroup).length;
      return `${ageGroup}: ${count}名`;
    });

    // 来場状況別の統計
    const statusStats = ["未確認", "未呼出", "来場済", "キャンセル"].map(status => {
      const count = tickets.filter(t => t.status === status).length;
      return `${status}: ${count}件`;
    });

    // 登録時間別の統計（1時間ごと）
    const hourStats: { [key: string]: number } = {};
    tickets.forEach(ticket => {
      try {
        // APIから既に日本時間が返されているので、そのまま時間を抽出
        const match = ticket.createdAt.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          const hour = parseInt(match[1]);
          const hourKey = `${hour}:00-${hour}:59`;
          hourStats[hourKey] = (hourStats[hourKey] || 0) + 1;
        }
      } catch (e) {
        // エラーは無視
      }
    });

    const timeStats = Object.entries(hourStats)
      .sort((a, b) => {
        const hourA = parseInt(a[0].split(":")[0]);
        const hourB = parseInt(b[0].split(":")[0]);
        return hourA - hourB;
      })
      .map(([time, count]) => `${time}: ${count}件`);

    // CSV作成
    const csvLines = [
      ...dataRows.map(row => row.join(",")),
      "",
      "【年齢層別統計】",
      ...ageStats,
      "",
      "【来場状況別統計】",
      ...statusStats,
      "",
      "【登録時間別統計（1時間ごと）】",
      ...timeStats
    ];

    const csvContent = csvLines.join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `整理券データ_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">整理券管理</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="検索..."
            className="px-3 py-2 border rounded-lg w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
            title="ページを再読み込み"
          >
            <ArrowClockwise size={18} weight="bold" />
            リロード
          </button>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Download size={18} weight="bold" />
            エクスポート
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2">
            <UserCircle size={18} weight="bold" />
            管理者
          </button>
        </div>
      </div>

      {/* 統計カード - ステータス別 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">未呼出</div>
            <TicketIcon size={24} weight="fill" className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("未呼出")}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">来場済</div>
            <CheckCircle size={24} weight="fill" className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("来場済")}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">未確認</div>
            <Clock size={24} weight="fill" className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold">{getStatusCount("未確認")}</div>
        </div>
      </div>


      {/* フィルター */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <select 
            className="px-3 py-2 border rounded-lg"
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <option value="すべて">年齢層: すべて</option>
            <option value="高校生以下">高校生以下</option>
            <option value="大学生">大学生</option>
            <option value="一般">一般</option>
          </select>
          <select 
            className="px-3 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="すべて">状態: すべて</option>
            <option value="未呼出">未呼出</option>
            <option value="来場済">来場済</option>
            <option value="未確認">未確認</option>
            <option value="キャンセル">キャンセル</option>
          </select>
          <input
            type="text"
            placeholder="整理券番号・メール・人数"
            className="px-3 py-2 border rounded-lg flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
          >
            <Download size={18} weight="bold" />
            エクスポート (CSV)
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">整理券番号</th>
              <th className="px-3 py-2 text-left">メールアドレス</th>
              <th className="px-3 py-2 text-left">人数</th>
              <th className="px-3 py-2 text-left">年齢層</th>
              <th className="px-3 py-2 text-left">来場状況</th>
              <th className="px-3 py-2 text-left">登録時間</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              // keyは必ずidを使用（一意性保証済み）
              const rowKey = r.id || (r.eventDate && r.ticketNo ? `${r.eventDate}-${r.ticketNo}` : `ticket-${r.email}`);
              
              // デバッグ用：レンダリング時のステータスを確認
              if (rows.indexOf(r) < 3) {
                console.debug('🔍 [レンダリング] 行データ:', {
                  key: rowKey,
                  ticketNo: r.ticketNo,
                  status: r.status,
                  id: r.id
                });
              }
              
              return (
              <tr 
                key={rowKey} 
                className={`border-t ${r.status === "キャンセル" ? "opacity-40 bg-gray-50" : ""}`}
              >
                <td className="px-3 py-2 font-mono text-sm font-bold text-violet-600">
                  #{r.ticketNo || r.id}
                </td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.count}名</td>
                <td className="px-3 py-2">{r.age}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    r.status === "未確認" ? "bg-yellow-100 text-yellow-700" :
                    r.status === "未呼出" ? "bg-blue-100 text-blue-700" :
                    r.status === "キャンセル" ? "bg-red-100 text-red-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {r.status || "不明"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {new Date(r.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.debug('🔘 [来場済] clickedId:', r.id, 'ticket:', r.ticketNo, 'email:', r.email);
                        updateStatus(r.id, "来場済");
                      }}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                    >
                      来場済
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.debug('🔘 [未呼出] clickedId:', r.id, 'ticket:', r.ticketNo, 'email:', r.email);
                        updateStatus(r.id, "未呼出");
                      }}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      未呼出
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.debug('🔘 [未確認] clickedId:', r.id, 'ticket:', r.ticketNo, 'email:', r.email);
                        updateStatus(r.id, "未確認");
                      }}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                    >
                      未確認
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.debug('🔘 [キャンセル] clickedId:', r.id, 'ticket:', r.ticketNo, 'email:', r.email);
                        updateStatus(r.id, "キャンセル");
                      }}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 flex items-center gap-1"
                    >
                      <XCircle size={14} weight="bold" />
                      キャンセル
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.debug('🔘 [削除] clickedId:', r.id, 'ticket:', r.ticketNo, 'email:', r.email);
                        handleDelete(r.id);
                      }}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center gap-1"
                    >
                      <XCircle size={14} weight="bold" />
                      削除
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
            {!filteredTickets.length && (
              <tr>
                <td colSpan={7} className="text-center text-slate-500 py-8">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}