import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "../shared/UserMenu";
import NotificationBell from "@/modules/notifications/components/NotificationBell/NotificationBell";

export default function Topbar({ onMenu, hidden = false }) {
  const { pathname } = useLocation();
  const page = pathname === "/" ? "Dashboard" : pathname.slice(1).replace(/-/g, " ");
  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur transition-transform duration-300 ease-in-out sm:px-6 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Hovering over this icon opens the sidebar. Click also works (touch screens). */}
        <button
          type="button"
          onMouseEnter={onMenu}
          onClick={onMenu}
          aria-label="Open sidebar"
          title="Open sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-[#F0202F]/10 hover:text-[#F0202F]"
        >
          <Menu size={21} strokeWidth={1.5} />
        </button>
        <p className="text-xs capitalize text-gray-300">
          <Link to="/admin/dashboard" className="text-brand">Home</Link> / {page}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell userId="a1" viewAllPath="/admin/notifications" />
        <UserMenu
          profilePath="/admin/profile"
          notificationsPath="/admin/notifications"
          supportPath="/admin/escalation"
        />
      </div>
    </header>
  );
}