import { motion } from "framer-motion";

export default function DashboardViewTabs({
  views,
  active,
  onChange,
  layoutId = "dashboard-view-tab",
  right = null,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
      <div
        role="tablist"
        aria-label="Dashboard views"
        className="-mb-px flex min-w-0 gap-1 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {views.map(({ id, label, icon: Icon }) => {
          const selected = id === active;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(id)}
              className={`relative flex shrink-0 items-center gap-2 px-3.5 pb-3 pt-2 text-[13px] transition-colors ${
                selected
                  ? "font-medium text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {Icon && <Icon size={15} strokeWidth={1.8} />}
              {label}
              {selected && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-primary-light"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {right}
    </div>
  );
}