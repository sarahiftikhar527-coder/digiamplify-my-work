import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const EmployeeLayout = () => {
  // The sidebar is closed by default. It opens when the mouse hovers over the
  // menu icon in the top bar and closes when the mouse leaves the sidebar.
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={toggleSidebar}
          onMenuHover={openSidebar}
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default EmployeeLayout