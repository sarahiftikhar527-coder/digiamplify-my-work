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

/*
  Main menu item.
  - Thin, light icon in a muted colour (the icon turns red only when active).
  - Hover: a light red shade, so you can see where the mouse is.
  - Active: a soft red tint with a thin red bar on the left. No heavy gradient.
*/
export const linkCls = (isActive) =>
  [
    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors duration-150",
    isActive
      ? "bg-[#F0202F]/[0.14] font-medium text-white"
      : "text-white/70 hover:bg-[#F0202F]/10 hover:text-white",
  ].join(" ");

export const iconCls = (isActive) =>
  `shrink-0 transition-colors duration-150 ${
    isActive ? "text-[#F0202F]" : "text-white/50 group-hover:text-[#F0202F]"
  }`;

/*
  Red count badge (1, 2, 3 ... 99+).
  - pulse: adds a soft red ring that keeps fading out, so something that needs
    attention (like an approval) is easy to notice.
*/
export function CountBadge({ count, pulse = false, label = "pending" }) {
  if (!(count > 0)) return null;

  return (
    <span
      className="relative ml-auto flex shrink-0 items-center justify-center"
      aria-label={`${count} ${label}`}
    >
      {pulse && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-[#F0202F]/60"
        />
      )}

      <span className="relative flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F0202F] px-1.5 text-[10px] font-semibold tabular-nums leading-none text-white shadow-[0_0_10px_rgba(240,32,47,0.45)]">
        {count > 99 ? "99+" : count}
      </span>
    </span>
  );
}

/*
  Small number shown on the corner of the menu button in the top bar.
  It is the sum of every count in the sidebar, so people can see that
  something is waiting even while the sidebar is closed.
*/
export function MenuButtonBadge({ count }) {
  if (!(count > 0)) return null;

  return (
    <span
      aria-label={`${count} new`}
      className="pointer-events-none absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F0202F] px-1 text-[10px] font-semibold tabular-nums leading-none text-white ring-2 ring-black"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* A single menu link (no children). Supports a count badge. */
export function NavItem({ item, counts = {}, onNavigate, end = false }) {
  const { label, path, icon: Icon, badgeKey, pulse } = item;

  return (
    <NavLink
      to={path}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => linkCls(isActive)}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#F0202F]" />
          )}
          {Icon && <Icon size={18} strokeWidth={1.5} className={iconCls(isActive)} />}
          <span className="truncate">{label}</span>
          <CountBadge count={counts[badgeKey] || 0} pulse={pulse} />
        </>
      )}
    </NavLink>
  );
}

/*
  Nested items: text only, no icons, so the list stays calm.
  A thin guide line runs on the left; the active item gets a red section of it.
*/
const subLinkCls = (active) =>
  [
    "relative flex items-center gap-2 rounded-md py-1.5 pl-4 pr-3 text-[13px] transition-colors duration-150",
    active
      ? "font-medium text-white"
      : "text-white/55 hover:bg-[#F0202F]/10 hover:text-white",
  ].join(" ");

export default function NavGroup({ item, counts = {}, onNavigate }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);

  const { label, path, icon: Icon, children = [] } = item;

  const parentActive = location.pathname === path.split("?")[0];

  // The nested list opens when the mouse is over the group (no click needed).
  // It also opens with keyboard focus, or when pinned with the small arrow.
  const open = hovered || focused || pinned;

  // The group shows the total of its children while it is closed.
  // Once it opens, each child shows its own number instead.
  const groupBadge = children.reduce(
    (sum, child) => sum + (counts[child.badgeKey] || 0),
    0
  );

  const groupPulse = children.some(
    (child) => child.pulse && (counts[child.badgeKey] || 0) > 0
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
          {parentActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#F0202F]" />
          )}
          {Icon && <Icon size={18} strokeWidth={1.5} className={iconCls(parentActive)} />}
          <span className="truncate">{label}</span>
          {!open && <CountBadge count={groupBadge} pulse={groupPulse} />}
        </NavLink>

        <button
          type="button"
          aria-label={`${open ? "Collapse" : "Expand"} ${label} menu`}
          aria-expanded={open}
          onClick={() => setPinned((value) => !value)}
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-[#F0202F]/15 hover:text-white"
        >
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-[21px] mt-1 flex flex-col border-l border-white/10 pb-1">
            {children.map((child) => {
              const active = isChildActive(child.path, location);

              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onNavigate}
                  tabIndex={open ? 0 : -1}
                  className={() => subLinkCls(active)}
                >
                  {active && (
                    <span className="absolute -left-px top-1/2 h-4 w-px -translate-y-1/2 bg-[#F0202F]" />
                  )}
                  <span className="truncate">{child.label}</span>
                  <CountBadge
                    count={counts[child.badgeKey] || 0}
                    pulse={child.pulse}
                  />
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}