import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import NavGroup, { NavItem } from "../shared/NavGroup";
import { getNavigationByRole } from "@/constants/navigation";
import { getChangeRequestCount } from "@/services/api/profileService";
import { Avatar } from "@/shared/components/ui";
import { useAuth } from "@/context";
import { usersService } from "@/services/usersService";

const Logo = () => (
  <div className="flex items-end whitespace-nowrap text-[23px] font-semibold leading-none tracking-tight text-white">
    <span>DigiA</span>
    <span className="mx-[3px] mb-[3px] flex items-end gap-[2px]">
      <span className="h-[8px] w-[4px] rounded-[1px] bg-primary" />
      <span className="h-[14px] w-[4px] rounded-[1px] bg-primary" />
      <span className="h-[21px] w-[4px] rounded-[1px] bg-primary-light" />
    </span>
    <span>plify</span>
    <span className="text-primary-light">.</span>
  </div>
);

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navigation = getNavigationByRole(user?.role) || [];
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingProfileApprovals, setPendingProfileApprovals] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getChangeRequestCount()
      .then((res) => {
        if (!cancelled) setPendingProfileApprovals(Number(res?.data?.count || 0));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;

    usersService
      .pending()
      .then((items) => {
        if (!cancelled) setPendingApprovals(Array.isArray(items) ? items.length : 0);
      })
      .catch(() => {
        // Badge is optional: ignore errors silently.
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, pathname]);

  const counts = { pendingApprovals: pendingApprovals + pendingProfileApprovals };

  useEffect(() => {
    if (window.innerWidth < 1024 && open) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {open && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 cursor-pointer bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-screen shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out lg:sticky ${
          open ? "w-[225px]" : "w-0"
        }`}
      >
      <aside
        className="flex h-full w-[225px] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(90deg,#000_0%,#000_84%,#1c0307_93%,#4a0a10_100%)]"
        onMouseLeave={onClose}
      >
        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between gap-2 px-4 pb-9 pt-8">
            <Logo />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="relative z-[60] flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <nav
            aria-label="Admin navigation"
            className="flex flex-col gap-1 px-3"
          >
            {navigation.map((item) => {
              if (item.children?.length) {
                return (
                  <NavGroup
                    key={item.path}
                    item={item}
                    counts={counts}
                    onNavigate={onClose}
                  />
                );
              }

              return (
                <NavItem
                  key={item.path}
                  item={item}
                  counts={counts}
                  end={item.path === "/"}
                  onNavigate={onClose}
                />
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-2">
            <Avatar size={32} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {user?.name || user?.email || "User"}
              </p>
              <p className="truncate text-[10px] capitalize text-gray-400">
                {user?.role || "Member"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md p-2 text-gray-400 transition hover:bg-[#F0202F]/10 hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>
      </div>
    </>
  );
}