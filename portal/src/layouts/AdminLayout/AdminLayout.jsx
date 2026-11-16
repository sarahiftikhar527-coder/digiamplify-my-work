import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useHideOnScroll from "@/hooks/useHideOnScroll";
import useSyncProfileAvatar from "@/hooks/useSyncProfileAvatar";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  const topbarHidden = useHideOnScroll();

  // Keeps the topbar + sidebar profile photo up to date.
  useSyncProfileAvatar();

  return (
    <div className="flex min-h-screen bg-surface font-sans text-white">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenu={() => setOpen(true)}
          hidden={topbarHidden}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}