import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { AuthContext } from "@/context";
import { getPositionLabel } from "@/constants";
import ProtectedAvatar from "@/components/ProtectedAvatar";

const getAvatarUrl = (user) =>
  user?.avatarUrl ||
  user?.profile?.avatarUrl ||
  user?.avatar ||
  user?.profileImage ||
  user?.image ||
  "";

const UserCard = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();

  const avatarUrl = getAvatarUrl(user);
  const name = user?.name || user?.email || "User";

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 pb-6 pt-4">
      <div className="flex min-w-0 items-center gap-3">
        <ProtectedAvatar
          src={avatarUrl}
          name={name}
          className="h-10 w-10"
          textClassName="text-sm"
        />

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