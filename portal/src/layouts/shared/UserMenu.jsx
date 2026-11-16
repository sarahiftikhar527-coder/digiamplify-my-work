import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LifeBuoy,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context";
import ProtectedAvatar from "@/components/ProtectedAvatar";

const itemCls =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-white/75 transition-colors hover:bg-[#F0202F]/10 hover:text-white";

const getAvatarUrl = (user, avatarUrl) =>
  avatarUrl ||
  user?.avatarUrl ||
  user?.profile?.avatarUrl ||
  user?.avatar ||
  user?.profileImage ||
  user?.image ||
  "";

export default function UserMenu({
  profilePath = "/profile",
  notificationsPath = "/notifications",
  supportPath = "/help-support",
  avatarUrl: avatarUrlProp = "",
  user: userProp,
}) {
  const auth = useAuth();
  const user = userProp || auth?.user;
  const logout = auth?.logout;

  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  const name = user?.name || user?.email || "User";
  const role = user?.role || "Member";

  const avatarUrl = getAvatarUrl(user, avatarUrlProp);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
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
        <ProtectedAvatar
          src={avatarUrl}
          name={name}
          className="h-9 w-9"
          textClassName="text-xs"
        />

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
            <ProtectedAvatar
              src={avatarUrl}
              name={name}
              className="h-10 w-10"
              textClassName="text-xs"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {name}
              </p>

              <p className="truncate text-xs capitalize text-gray-400">
                {role}
              </p>
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