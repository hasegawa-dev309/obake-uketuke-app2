import { UserIcon } from "@heroicons/react/24/outline";

export default function Topbar() {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-end px-4">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>管理者</span>
        <div className="size-8 rounded-full bg-slate-200 grid place-items-center">
          <UserIcon className="w-4 h-4"/>
        </div>
      </div>
    </header>
  );
}