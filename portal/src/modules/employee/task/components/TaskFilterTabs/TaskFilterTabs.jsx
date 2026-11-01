import { motion, useReducedMotion } from 'framer-motion';

const TaskFilterTabs = ({ tabs = [], active, onChange }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      className="inline-flex flex-wrap items-center gap-1 rounded-md bg-[#111111] p-1"
    >
      {tabs.map((tab) => {
        const selected = tab === active;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange?.(tab)}
            className={`relative rounded-md px-5 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f] ${
              selected ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            {selected && (
              <motion.span
                layoutId="task-tab-pill"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 420, damping: 34 }
                }
                className="absolute inset-0 rounded-md bg-[#c1121f]"
              />
            )}
            <span className="relative">{tab}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TaskFilterTabs;