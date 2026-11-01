
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TaskPagination = ({
  page = 1,
  totalPages = 1,
  onChange,
  disabled = false,
  loading = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const safeTotalPages = Math.max(
    1,
    Math.floor(Number(totalPages) || 1)
  );

  const safePage = Math.min(
    safeTotalPages,
    Math.max(1, Math.floor(Number(page) || 1))
  );

  const isDisabled = disabled || loading;

  const btn =
    'flex h-6 min-w-6 items-center justify-center rounded border px-1 text-[10px] transition';

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' };

  const handleChange = (nextPage) => {
    if (isDisabled || nextPage === safePage) return;
    if (nextPage < 1 || nextPage > safeTotalPages) return;

    onChange?.(nextPage);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handleChange(safePage - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleChange(safePage + 1);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      handleChange(1);
    }

    if (event.key === 'End') {
      event.preventDefault();
      handleChange(safeTotalPages);
    }
  };

  if (safeTotalPages <= 1) return null;

  const renderButton = ({
    label,
    targetPage,
    children,
    active = false,
    buttonDisabled = false,
  }) => (
    <motion.button
      key={label}
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={isDisabled || buttonDisabled}
      onClick={() => handleChange(targetPage)}
      whileHover={
        shouldReduceMotion || isDisabled || buttonDisabled
          ? undefined
          : { y: -1, scale: 1.04 }
      }
      whileTap={
        shouldReduceMotion || isDisabled || buttonDisabled
          ? undefined
          : { scale: 0.92 }
      }
      transition={transition}
      className={`${btn} ${
        active
          ? 'border-red-700 bg-red-700 text-white'
          : 'border-white/10 text-gray-300 hover:border-red-700'
      } ${
        isDisabled || buttonDisabled
          ? 'cursor-not-allowed opacity-30'
          : 'cursor-pointer'
      }`}
    >
      {children}
    </motion.button>
  );

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      onKeyDown={handleKeyDown}
      aria-label="Task pagination"
      aria-busy={loading}
      className="mt-3 flex items-center justify-center gap-1.5"
    >
      {renderButton({
        label: 'Previous page',
        targetPage: safePage - 1,
        buttonDisabled: safePage === 1,
        children: <ChevronLeft size={12} />,
      })}

      {Array.from({ length: safeTotalPages }, (_, index) => index + 1).map(
        (number) =>
          renderButton({
            label: `Page ${number}`,
            targetPage: number,
            active: number === safePage,
            children: number,
          })
      )}

      {renderButton({
        label: 'Next page',
        targetPage: safePage + 1,
        buttonDisabled: safePage === safeTotalPages,
        children: <ChevronRight size={12} />,
      })}
    </motion.div>
  );
};

export default TaskPagination;
