import { motion, useReducedMotion } from 'framer-motion';

const DEFAULT_TABS = ['Today', 'Upcoming', 'Completed'];

const TaskFilterTabs = ({
  tabs = DEFAULT_TABS,
  active = 'Today',
  onChange,
  disabled = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const validTabs = Array.isArray(tabs)
    ? tabs.filter((tab) => typeof tab === 'string' && tab.trim())
    : DEFAULT_TABS;

  const handleTabChange = (tab) => {
    if (disabled || tab === active) return;
    onChange?.(tab);
  };

  return (
    <div
      className="flex w-full max-w-full overflow-hidden rounded-md bg-[#1a1a1a] p-0.5"
      role="tablist"
      aria-label="Filter tasks"
    >
      {validTabs.map((tab) => {
        const isActive = active === tab;

        return (
          <motion.button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="task-list-panel"
            disabled={disabled}
            onClick={() => handleTabChange(tab)}
            whileTap={
              shouldReduceMotion || disabled
                ? undefined
                : { scale: 0.97 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.18,
              ease: 'easeOut',
            }}
            className={`min-w-0 flex-1 truncate rounded px-1.5 py-1.5 text-[11px] transition ${
              isActive
                ? 'bg-red-700 text-white'
                : 'text-gray-300 hover:text-white'
            } ${
              disabled
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer'
            }`}
          >
            {tab}
          </motion.button>
        );
      })}
    </div>
  );
};

export default TaskFilterTabs;