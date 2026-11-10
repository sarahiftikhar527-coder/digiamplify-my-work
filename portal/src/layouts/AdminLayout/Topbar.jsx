import { Menu, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar } from "@/shared/components/ui";
import NotificationBell from "@/modules/notifications/components/NotificationBell/NotificationBell";

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const page = pathname === "/" ? "Dashboard" : pathname.slice(1).replace(/-/g, " ");
  return (
    <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hovering over this icon opens the sidebar. Click also works (touch screens). */}
        <button
          type="button"
          onMouseEnter={onMenu}
          onClick={onMenu}
          aria-label="Open sidebar"
          title="Open sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 hover:text-[#F0202F]"
        >
          <Menu size={22} />
        </button>
        <p className="text-xs capitalize text-gray-300">
          <Link to="/admin/dashboard" className="text-brand">Home</Link> / {page}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell userId="a1" viewAllPath="/admin/notifications" />
        <div className="flex items-center gap-1"><Avatar size={30} /><ChevronDown size={14} /></div>
      </div>
    </header>
  );
}