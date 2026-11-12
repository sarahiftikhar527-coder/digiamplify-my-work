import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useHideOnScroll from "@/hooks/useHideOnScroll";
import useTaskAlerts from "@/hooks/useTaskAlerts";
import useSidebarCounts from "@/hooks/useSidebarCounts";

const EmployeeLayout = () => {
  // The sidebar is closed by default. It opens when the mouse hovers over the
  // menu icon in the top bar and closes when the mouse leaves the sidebar.
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Number of new tasks the admin assigned (shown as a badge on "Task").
  // This also plays the alert sound when a new task arrives.
  const { newTasks } = useTaskAlerts()

  // Number of unread chat messages (shown as a badge on "Chat").
  const { chatUnread } = useSidebarCounts({ isAdmin: false })

  // The page scrolls inside <main>. The top bar hides while scrolling down
  // and comes back as soon as the user scrolls up a little.
  const scrollRef = useRef(null)
  const topbarHidden = useHideOnScroll(scrollRef)

  const openSidebar = () => {
    setSidebarOpen(true)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        counts={{ newTasks, chatUnread }}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={toggleSidebar}
          onMenuHover={openSidebar}
          hidden={topbarHidden}
        />

        <main
          ref={scrollRef}
          className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-[72px] sm:px-6 lg:px-9"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default EmployeeLayout