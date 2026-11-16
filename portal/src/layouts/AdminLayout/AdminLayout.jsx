import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getNavigationByRole } from "@/constants/navigation";
import { useAuth } from "@/context";
import useHideOnScroll from "@/hooks/useHideOnScroll";
import useSyncProfileAvatar from "@/hooks/useSyncProfileAvatar";
import useSidebarCounts, { getBadgeTotal } from "@/hooks/useSidebarCounts";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  const { user } = useAuth();

  const navigation = useMemo(
    () => getNavigationByRole(user?.role) || [],
    [user?.role]
  );

  const isAdmin = ["admin", "superadmin"].includes(
    String(user?.role || "").trim().toLowerCase()
  );

  // One place for every sidebar count (chat, calendar, approvals).
  // The sidebar and the top bar both read from it, so nothing loads twice.
  const counts = useSidebarCounts({
    isAdmin,
    showApprovals: true,
  });

  // Total of every number in the menu, shown on the menu button
  // while the sidebar is closed.
  const menuBadge = getBadgeTotal(navigation, counts);

  const topbarHidden = useHideOnScroll();

  // Keeps the topbar + sidebar profile photo up to date.
  useSyncProfileAvatar();

  return (
    <div className="flex min-h-screen bg-surface font-sans text-white">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        counts={counts}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenu={() => setOpen(true)}
          menuBadge={menuBadge}
          hidden={topbarHidden}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}