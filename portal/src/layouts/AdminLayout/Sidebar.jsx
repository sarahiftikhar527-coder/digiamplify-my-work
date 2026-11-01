import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { getNavigationByRole } from "@/constants/navigation";
import { Avatar } from "@/shared/components/ui";
import { useAuth } from "@/context";

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

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[225px] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(90deg,#000_0%,#000_84%,#1c0307_93%,#4a0a10_100%)] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between gap-2 px-4 pb-9 pt-8">
            <Logo />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="relative z-[60] flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav
            aria-label="Admin navigation"
            className="flex flex-col gap-3 px-3"
          >
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-[#F0202F] to-[#9B0E18] font-medium text-white shadow-[0_6px_20px_rgba(193,18,31,0.22)]"
                      : "text-white/90 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                {Icon && (
                  <Icon
                    size={19}
                    strokeWidth={1.75}
                    className="shrink-0"
                  />
                )}
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
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
              className="rounded-md p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
