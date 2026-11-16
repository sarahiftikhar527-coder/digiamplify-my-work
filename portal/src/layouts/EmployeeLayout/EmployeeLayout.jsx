
import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useHideOnScroll from "@/hooks/useHideOnScroll";
import useTaskAlerts from "@/hooks/useTaskAlerts";

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { newTasks } = useTaskAlerts();

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
        counts={{ newTasks }}
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
  );
};

export default EmployeeLayout;
