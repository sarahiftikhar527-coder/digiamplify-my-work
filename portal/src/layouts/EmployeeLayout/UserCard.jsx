
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { AuthContext } from "@/context";
import { getPositionLabel } from "@/constants";

const getAvatarUrl = (user) =>
  user?.avatarUrl ||
  user?.profile?.avatarUrl ||
  user?.avatar ||
  user?.profileImage ||
  user?.image ||
  "";

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const UserCard = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();

  const [imgError, setImgError] = useState(false);

  const avatarUrl = getAvatarUrl(user);
  const name = user?.name || user?.email || "User";
  const initials = getInitials(name);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 pb-6 pt-4">
      <div className="flex min-w-0 items-center gap-3">
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={`${name} profile`}
            onError={() => setImgError(true)}
            className="h-10 w-10 shrink-0 rounded-full border border-white/15 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#C0111F] text-sm font-semibold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium text-white">
            {name}
          </p>

          <p className="truncate pt-1 text-xs text-gray-400">
            {user?.position
              ? getPositionLabel(user.position)
              : user?.role || "Employee"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Logout"
        title="Logout"
        className="shrink-0 rounded-md p-1 text-white/70 transition-colors hover:bg-[#F0202F]/10 hover:text-[#F0202F]"
      >
        <LogOut size={17} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default UserCard;
