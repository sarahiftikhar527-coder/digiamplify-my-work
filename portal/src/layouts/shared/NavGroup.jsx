import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const DEFAULT_VIEW = "overview";

export function isChildActive(childPath, location) {
  const [childPathname, childQuery = ""] = String(childPath).split("?");

  if (childPathname !== location.pathname) return false;

  const wanted = new URLSearchParams(childQuery);
  const current = new URLSearchParams(location.search);

  const wantedView = wanted.get("view") || DEFAULT_VIEW;
  const currentView = current.get("view") || DEFAULT_VIEW;

  const childUsesViews =
    childPathname.endsWith("/dashboard") || wanted.has("view");

  return childUsesViews ? wantedView === currentView : true;
}

export const linkCls = (isActive) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] transition-all duration-200",
    isActive
      ? "bg-gradient-to-r from-[#F0202F] to-[#9B0E18] font-medium text-white shadow-[0_6px_20px_rgba(193,18,31,0.22)]"
      : "text-white/90 hover:bg-white/5 hover:text-white",
  ].join(" ");

const subLinkCls = (active) =>
  [
    "group/sub relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors duration-200",
    active
      ? "bg-white/10 font-medium text-white"
      : "text-white/65 hover:bg-white/5 hover:text-white",
  ].join(" ");

export function CountBadge({ count }) {
  return count > 0 ? (
    <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-white">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;
}

export default function NavGroup({ item, counts = {}, onNavigate }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);

  const { label, path, icon: Icon, children = [] } = item;

  const parentActive = location.pathname === path.split("?")[0];
  const expanded = hovered || focused || pinned;

  const groupBadge = children.reduce(
    (sum, child) => sum + (counts[child.badgeKey] || 0),
    0
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      <div className="relative">
        <NavLink
          to={path}
          end
          onClick={onNavigate}
          className={() => `${linkCls(parentActive)} pr-10`}
        >
          {Icon && <Icon size={19} strokeWidth={1.75} className="shrink-0" />}
          <span className="truncate">{label}</span>
          <CountBadge count={groupBadge} />
        </NavLink>

        <button
          type="button"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${label} menu`}
          aria-expanded={expanded}
          onClick={() => setPinned((value) => !value)}
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-2">
            {children.map((child) => {
              const ChildIcon = child.icon;
              const active = isChildActive(child.path, location);

              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onNavigate}
                  tabIndex={expanded ? 0 : -1}
                  className={() => subLinkCls(active)}
                >
                  {active && (
                    <span className="absolute -left-[9px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary-light" />
                  )}
                  {ChildIcon && (
                    <ChildIcon
                      size={16}
                      strokeWidth={1.75}
                      className="shrink-0"
                    />
                  )}
                  <span className="truncate">{child.label}</span>
                  <CountBadge count={counts[child.badgeKey] || 0} />
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}