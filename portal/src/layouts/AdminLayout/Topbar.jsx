import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "../shared/UserMenu";
import { MenuButtonBadge } from "../shared/NavGroup";
import NotificationBell from "@/modules/notifications/components/NotificationBell/NotificationBell";
import { useAuth } from "@/context";

export default function Topbar({
  onMenu,
  menuBadge = 0,
  hidden = false,
}) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const page =
    pathname === "/"
      ? "Dashboard"
      : pathname.slice(1).replace(/-/g, " ");

  const avatarUrl =
    user?.avatarUrl ||
    user?.profile?.avatarUrl ||
    user?.profileImage ||
    user?.image ||
    "";

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur transition-transform duration-300 ease-in-out sm:px-6 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onMouseEnter={onMenu}
          onClick={onMenu}
          aria-label="Open sidebar"
          title="Open sidebar"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-[#F0202F]/10 hover:text-[#F0202F]"
        >
          <Menu size={21} strokeWidth={1.5} />
          <MenuButtonBadge count={menuBadge} />
        </button>

        <p className="text-xs capitalize text-gray-300">
          <Link to="/admin/dashboard" className="text-brand">
            Home
          </Link>{" "}
          / {page}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell
          userId={user?.id || user?._id}
          viewAllPath="/admin/notifications"
        />

        <UserMenu
          profilePath="/admin/profile"
          notificationsPath="/admin/notifications"
          supportPath="/admin/escalation"
          avatarUrl={avatarUrl}
          user={user}
        />
      </div>
    </header>
  );
}