import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LifeBuoy, LogOut, User } from "lucide-react";
import { useAuth } from "@/context";

const getInitials = (name) =>
  String(name || "User")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const itemCls =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-white/75 transition-colors hover:bg-[#F0202F]/10 hover:text-white";

/*
  Avatar button for the top bar. Click it to open a small menu with the
  profile, notifications, help and logout. Used by both the employee and the
  admin top bar, so only the paths are passed in.
*/
export default function UserMenu({
  profilePath = "/profile",
  notificationsPath = "/notifications",
  supportPath = "/help-support",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Close when the user clicks outside the menu or presses Escape.
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout?.();
    navigate("/login", { replace: true });
  };

  const name = user?.name || user?.email || "User";
  const role = user?.role || "Member";
  const showImage = user?.avatar && !imgError;

  const avatar = (size) =>
    showImage ? (
      <img
        src={user.avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    ) : (
      <span
        className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#C0111F] text-xs font-semibold text-white`}
      >
        {getInitials(name)}
      </span>
    );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="User menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-[#F0202F]/10 ${
          open ? "bg-[#F0202F]/10" : ""
        }`}
      >
        {avatar("h-9 w-9")}
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`text-white transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[100] mt-3 w-60 overflow-hidden rounded-2xl border border-[#292929] bg-[#0d0d0d] p-2 text-white shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-[#252525] px-3 pb-3 pt-2">
            {avatar("h-10 w-10")}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{name}</p>
              <p className="truncate text-xs capitalize text-gray-400">{role}</p>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 py-2">
            <Link
              to={profilePath}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemCls}
            >
              <User size={17} strokeWidth={1.5} />
              My Profile
            </Link>

            <Link
              to={notificationsPath}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemCls}
            >
              <Bell size={17} strokeWidth={1.5} />
              Notifications
            </Link>

            <Link
              to={supportPath}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemCls}
            >
              <LifeBuoy size={17} strokeWidth={1.5} />
              Help &amp; Support
            </Link>
          </div>

          <div className="border-t border-[#252525] pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className={itemCls}
            >
              <LogOut size={17} strokeWidth={1.5} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}