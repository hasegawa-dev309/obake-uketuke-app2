import { useMemo, useState } from "react";
import { Ticket } from "../store/tickets";
import { ticketsStore } from "../store/tickets";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import StatCard from "../components/admin/StatCard";
import Filters from "../components/admin/Filters";
import TicketTable from "../components/admin/TicketTable";
import { Ticket as TicketIcon, Users, Clock } from "lucide-react";

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // チケットデータを取得（既存のstoreから）
  const allTickets = ticketsStore.getAll?.() ?? [];

  // 統計計算
  const stats = useMemo(() => {
    const queued = allTickets.filter(t => t.status === "queued").length;
    const arrived = allTickets.filter(t => t.status === "arrived").length;
    const noShow = allTickets.filter(t => t.status === "no-show").length;
    return { queued, arrived, noShow };
  }, [allTickets]);

  // フィルタリング
  const filteredTickets = useMemo(() => {
    return allTickets.filter(ticket => {
      const matchesSearch = searchQuery === "" || 
        ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.people.toString().includes(searchQuery);
      
      const matchesAgeGroup = ageGroupFilter === "" || ticket.ageGroup === ageGroupFilter;
      const matchesStatus = statusFilter === "" || ticket.status === statusFilter;
      
      return matchesSearch && matchesAgeGroup && matchesStatus;
    });
  }, [allTickets, searchQuery, ageGroupFilter, statusFilter]);

  const handleStatusChange = (id: string, status: Ticket["status"]) => {
    ticketsStore.update?.(id, { status });
  };

  const handleExport = () => {
    // CSVエクスポート機能（簡易実装）
    const csvContent = [
      ["整理券番号", "メール", "人数", "年齢層", "状態", "登録時間"],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.email,
        ticket.people.toString(),
        ticket.ageGroup,
        ticket.status,
        new Date(ticket.createdAt).toLocaleString("ja-JP")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tickets_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8ff,#ffffff)]">
      <Sidebar activeMenu="tickets" />
      
      <div className="pl-[240px]">
        <Topbar 
          title="整理券管理" 
          onSearch={setSearchQuery}
          onExport={handleExport}
        />
        
        <main className="pt-16">
          <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="未呼出"
                value={stats.queued}
                icon={TicketIcon}
                intent="warning"
              />
              <StatCard
                label="来場済"
                value={stats.arrived}
                icon={Users}
                intent="success"
              />
              <StatCard
                label="未確認"
                value={stats.noShow}
                icon={Clock}
                intent="primary"
              />
            </div>

            {/* フィルタ */}
            <Filters
              ageGroup={ageGroupFilter}
              status={statusFilter}
              searchQuery={searchQuery}
              onAgeGroupChange={setAgeGroupFilter}
              onStatusChange={setStatusFilter}
              onSearchChange={setSearchQuery}
              onExport={handleExport}
            />

            {/* テーブル */}
            <TicketTable
              tickets={filteredTickets}
              onStatusChange={handleStatusChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
