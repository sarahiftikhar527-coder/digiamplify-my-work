
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const DOT = {
  High: 'bg-red-500',
  Medium: 'bg-amber-400',
  Low: 'bg-green-500',
};

const TaskTable = ({
  tasks = [],
  onToggleComplete,
  loading = false,
  disabled = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: 'easeOut' };

  const handleToggle = (task) => {
    if (disabled || loading || typeof onToggleComplete !== 'function') return;
    onToggleComplete(task.id);
  };

  return (
    <ul className="mt-3" aria-busy={loading}>
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <li
            key={`task-skeleton-${index}`}
            className="border-b border-dashed border-white/15 py-3 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-white/10" />
              <span className="h-3 flex-1 animate-pulse rounded bg-white/10" />
              <span className="h-3 w-10 animate-pulse rounded bg-white/10" />
            </div>
            <div className="mt-2 ml-5 h-2 w-20 animate-pulse rounded bg-white/10" />
          </li>
        ))
      ) : tasks.length === 0 ? (
        <motion.li
          initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="py-8 text-center text-xs text-gray-500"
        >
          No tasks.
        </motion.li>
      ) : (
        <AnimatePresence initial={false}>
          {tasks.map((t, index) => {
            const done = String(t.status || '').toLowerCase() === 'completed';
            const priority = ['High', 'Medium', 'Low'].includes(t.priority)
              ? t.priority
              : 'Low';

            return (
              <motion.li
                key={t.id ?? t._id ?? `${t.title}-${index}`}
                layout={!shouldReduceMotion}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: -8 }
                }
                transition={transition}
                className="border-b border-dashed border-white/15 py-3 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    aria-label={
                      done
                        ? `Mark ${t.title} as incomplete`
                        : `Mark ${t.title} as complete`
                    }
                    aria-pressed={done}
                    disabled={disabled || loading || !onToggleComplete}
                    onClick={() => handleToggle(t)}
                    whileHover={
                      shouldReduceMotion || disabled || loading
                        ? undefined
                        : { scale: 1.12 }
                    }
                    whileTap={
                      shouldReduceMotion || disabled || loading
                        ? undefined
                        : { scale: 0.88 }
                    }
                    transition={transition}
                    className={`h-3 w-3 shrink-0 rounded-full border-2 transition-colors duration-200 ${
                      done
                        ? 'border-green-500 bg-green-500'
                        : 'border-red-600'
                    } ${
                      disabled || loading
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer'
                    }`}
                  />

                  <motion.span
                    animate={{
                      opacity: done ? 0.65 : 1,
                    }}
                    transition={transition}
                    className={`flex-1 truncate text-xs ${
                      done
                        ? 'text-gray-500 line-through'
                        : 'text-white'
                    }`}
                    title={t.title || ''}
                  >
                    {t.title}
                  </motion.span>

                  <span className="text-[10px] text-gray-400">
                    {t.time || ''}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 pl-5 text-[10px] text-gray-400">
                  <motion.span
                    animate={{
                      scale: shouldReduceMotion ? 1 : [1, 1.12, 1],
                    }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.3 }
                    }
                    className={`h-1.5 w-1.5 rounded-full ${DOT[priority]}`}
                  />
                  {priority} Priority
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      )}
    </ul>
  );
};

export default TaskTable;
