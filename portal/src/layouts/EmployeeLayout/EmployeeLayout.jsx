import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <div
        className={`relative z-50 h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          sidebarOpen ? 'w-[225px]' : 'w-0'
        }`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={toggleSidebar}
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default EmployeeLayout