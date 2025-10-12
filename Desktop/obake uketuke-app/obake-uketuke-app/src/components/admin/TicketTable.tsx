import { Ticket } from "../../store/tickets";
import Badge from "./Badge";

interface TicketTableProps {
  tickets: Ticket[];
  onStatusChange: (id: string, status: Ticket["status"]) => void;
}

export default function TicketTable({ tickets, onStatusChange }: TicketTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                整理券番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                メール
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                人数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                年齢層
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                来場状況
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                登録時間
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {tickets.map((ticket, index) => (
              <tr
                key={ticket.id}
                className={`hover:bg-slate-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-25"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">
                  {ticket.id.slice(0, 8)}…
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {ticket.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {ticket.people}名
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {ticket.ageGroup}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge status={ticket.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(ticket.createdAt).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onStatusChange(ticket.id, "arrived")}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      来場済
                    </button>
                    <button
                      onClick={() => onStatusChange(ticket.id, "queued")}
                      className="px-3 py-1 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      未呼出
                    </button>
                    <button
                      onClick={() => onStatusChange(ticket.id, "no-show")}
                      className="px-3 py-1 text-xs bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                    >
                      未確認
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
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
