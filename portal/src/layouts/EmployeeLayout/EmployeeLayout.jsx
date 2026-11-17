import { useContext, useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MeetingJoinGuard from "@/components/MeetingJoinGuard/MeetingJoinGuard.jsx";
import { getEmployeeNavigation } from "@/constants";
import { AuthContext } from "@/context";
import useHideOnScroll from "@/hooks/useHideOnScroll";
import useTaskAlerts from "@/hooks/useTaskAlerts";
import useSyncProfileAvatar from "@/hooks/useSyncProfileAvatar";
import useSidebarCounts, { getBadgeTotal } from "@/hooks/useSidebarCounts";

const hasBadge = (item, key) =>
  item.badgeKey === key ||
  item.children?.some((child) => child.badgeKey === key);

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const auth = useContext(AuthContext);
  const user = auth?.user;

  const navigation = useMemo(() => getEmployeeNavigation(user), [user]);

  // Only people who can approve signups need the approvals count.
  const showApprovals = navigation.some((item) =>
    hasBadge(item, "pendingApprovals")
  );

  // New (unread) task notifications for the "Task" badge.
  const { newTasks } = useTaskAlerts();

  // One place for every sidebar count (chat, calendar, finance, approvals).
  // The sidebar and the top bar both read from it, so nothing loads twice.
  const liveCounts = useSidebarCounts({
    isAdmin: false,
    showApprovals,
  });

  const counts = { ...liveCounts, newTasks };

  // Total of every number in the menu, shown on the menu button
  // while the sidebar is closed.
  const menuBadge = getBadgeTotal(navigation, counts);

  // Keeps the topbar + sidebar profile photo up to date.
  useSyncProfileAvatar();

  const scrollRef = useRef(null);
  const topbarHidden = useHideOnScroll(scrollRef);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        counts={counts}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={toggleSidebar}
          onMenuHover={openSidebar}
          menuBadge={menuBadge}
          hidden={topbarHidden}
        />

        <main
          ref={scrollRef}
          className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-[72px] sm:px-6 lg:px-9"
        >
          <Outlet />
        </main>
      </div>

      {/* Meetings can only be joined while clocked in. */}
      <MeetingJoinGuard clockInPath="/clock-in" />
    </div>
  );
};

export default EmployeeLayout;