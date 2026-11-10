import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Badge = ({ count }) =>
  count > 0 ? (
    <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

const ACTIVE_CLS =
  "bg-gradient-to-r from-[#F0202F] to-[#9B0E18] font-medium text-white shadow-[0_6px_20px_rgba(193,18,31,0.22)]";

const parentCls = (state) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] transition-all duration-200",
    state === "active"
      ? ACTIVE_CLS
      : state === "soft"
        ? "bg-white/[0.07] font-medium text-white"
        : "text-white/90 hover:bg-white/5 hover:text-white",
  ].join(" ");

const childCls = (active) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all duration-200",
    active ? ACTIVE_CLS : "text-white/70 hover:bg-white/5 hover:text-white",
  ].join(" ");

// A child path can contain a query string (e.g. "/task?view=today").
// It is active when the pathname matches and every query param matches.
// A child marked isDefault is also active when the param is missing.
function isChildActive(child, pathname, search) {
  const [childPath, childQuery = ""] = child.path.split("?");
  if (pathname !== childPath) return false;
  if (!childQuery) return true;

  const wanted = new URLSearchParams(childQuery);
  const current = new URLSearchParams(search);

  for (const [key, value] of wanted.entries()) {
    const currentValue = current.get(key);
    if (currentValue === value) continue;
    if (currentValue == null && child.isDefault) continue;
    return false;
  }

  return true;
}

// Menu item with nested links. The children open while the mouse is over this
// item and close again as soon as the mouse leaves it.
export default function SidebarNavGroup({
  item,
  counts = {},
  onNavigate = () => {},
}) {
  const [hovered, setHovered] = useState(false);
  const { pathname, search } = useLocation();
  const { label, path, icon: Icon, children } = item;

  const childStates = children.map((child) =>
    isChildActive(child, pathname, search)
  );
  const anyChildActive = childStates.some(Boolean);
  const parentMatches = pathname === path;

  const parentState = anyChildActive
    ? "soft"
    : parentMatches
      ? "active"
      : "idle";

  const groupBadge = children.reduce(
    (sum, child) => sum + (counts[child.badgeKey] || 0),
    0
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink
        to={path}
        end
        onClick={onNavigate}
        className={parentCls(parentState)}
      >
        {Icon && <Icon size={19} strokeWidth={1.75} className="shrink-0" />}
        <span className="truncate">{label}</span>
        <Badge count={groupBadge} />
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${
            groupBadge > 0 ? "" : "ml-auto"
          } ${hovered ? "rotate-180" : ""}`}
        />
      </NavLink>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          hovered ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-1">
            {children.map((child, index) => {
              const ChildIcon = child.icon;

              return (
                <NavLink
                  key={child.path + child.label}
                  to={child.path}
                  onClick={onNavigate}
                  tabIndex={hovered ? 0 : -1}
                  className={childCls(childStates[index])}
                >
                  {ChildIcon && (
                    <ChildIcon
                      size={17}
                      strokeWidth={1.75}
                      className="shrink-0"
                    />
                  )}
                  <span className="truncate">{child.label}</span>
                  <Badge count={counts[child.badgeKey] || 0} />
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}