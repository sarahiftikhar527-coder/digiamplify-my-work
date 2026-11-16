
import { useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import { getEmployeeNavigation } from "@/constants";
import { AuthContext } from "@/context";
import useSidebarCounts from "@/hooks/useSidebarCounts";
import NavGroup, { NavItem } from "../shared/NavGroup";
import UserCard from "./UserCard";

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

const Sidebar = ({
  isOpen = false,
  onClose = () => {},
  counts = {},
}) => {
  const { pathname } = useLocation();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const navigation = useMemo(
    () => getEmployeeNavigation(user),
    [user]
  );

  const showApprovals = navigation.some(
    (item) =>
      item.badgeKey === "pendingApprovals" ||
      item.children?.some(
        (child) => child.badgeKey === "pendingApprovals"
      )
  );

  const liveCounts = useSidebarCounts({
    isAdmin: false,
    showApprovals,
  });

  const sidebarCounts = {
    ...liveCounts,
    ...counts,
    meetingInvitations: liveCounts.meetingInvitations,
    pendingApprovals: liveCounts.pendingApprovals,
  };

  const avatarUrl =
    user?.avatarUrl ||
    user?.profile?.avatarUrl ||
    user?.avatar ||
    user?.profileImage ||
    user?.image ||
    "";

  useEffect(() => {
    if (window.innerWidth < 1024 && isOpen) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 cursor-pointer bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out lg:relative ${
          isOpen ? "w-[225px]" : "w-0"
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
              aria-label="Main navigation"
              className="flex flex-col gap-1 px-3"
            >
              {navigation.map((item) => {
                if (item.children?.length) {
                  return (
                    <NavGroup
                      key={item.path}
                      item={item}
                      counts={sidebarCounts}
                      onNavigate={onClose}
                    />
                  );
                }

                return (
                  <NavItem
                    key={item.path}
                    item={item}
                    counts={sidebarCounts}
                    onNavigate={onClose}
                  />
                );
              })}
            </nav>
          </div>

          <div className="shrink-0">
            <UserCard
              user={user}
              avatarUrl={avatarUrl}
            />
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
