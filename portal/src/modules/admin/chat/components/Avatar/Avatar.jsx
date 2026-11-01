import { Users } from "lucide-react";
import { initials } from "../../../../../utils/format";

const Avatar = ({ src, name, group = false, size = 36, online }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    {src ? (
      <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
    ) : group ? (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#ff9a9a] text-red-600">
        <Users size={size * 0.5} />
      </div>
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#2a2a2a] text-[11px] font-semibold text-white">
        {initials(name)}
      </div>
    )}
    {online && (
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#111] bg-green-500" />
    )}
  </div>
);

export default Avatar;