import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ClipboardList,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

const TaskStatsCards = ({
  assigned = 0,
  completed = 0,
  inProgress = 0,
  overdue = 0,
  loading = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const normalizeValue = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  };

  const items = [
    {
      label: 'Task Assign',
      value: normalizeValue(assigned),
      icon: ClipboardList,
    },
    {
      label: 'Tasks Completed',
      value: normalizeValue(completed),
      icon: ClipboardCheck,
    },
    {
      label: 'In Progress',
      value: normalizeValue(inProgress),
      icon: TrendingUp,
    },
    {
      label: 'Overdue Tasks',
      value: normalizeValue(overdue),
      icon: AlertCircle,
    },
  ];

  const [displayValues, setDisplayValues] = useState(
    items.map(() => 0)
  );

  useEffect(() => {
    if (loading) return;

    if (shouldReduceMotion) {
      setDisplayValues(items.map((item) => item.value));
      return;
    }

    const duration = 700;
    const startTime = performance.now();
    const startValues = displayValues;
    let animationFrame;

    const animateValues = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);

      setDisplayValues(
        items.map((item, index) =>
          Math.round(
            startValues[index] +
              (item.value - startValues[index]) * easedProgress
          )
        )
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateValues);
      }
    };

    animationFrame = requestAnimationFrame(animateValues);

    return () => cancelAnimationFrame(animationFrame);
  }, [
    assigned,
    completed,
    inProgress,
    overdue,
    loading,
    shouldReduceMotion,
  ]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map(({ label, value, icon: Icon }, index) => (
        <motion.div
          key={label}
          variants={cardVariants}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  y: -3,
                  transition: { duration: 0.2 },
                }
          }
          className="flex items-center gap-3 rounded-md border border-[#1e1e1e] bg-[#0b0b0b] px-4 py-4"
        >
          <motion.span
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    scale: 1.06,
                    transition: { duration: 0.2 },
                  }
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-900/70 bg-red-950/50 text-red-600"
          >
            <Icon size={15} />
          </motion.span>

          <div className="min-w-0">
            <p
              className="text-xl font-medium leading-tight text-white"
              aria-label={`${label}: ${value}`}
              aria-live="off"
            >
              {loading ? (
                <span className="inline-block h-6 w-8 animate-pulse rounded bg-[#1e1e1e]" />
              ) : (
                displayValues[index]
              )}
            </p>

            <p className="truncate text-xs text-gray-400">{label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TaskStatsCards;
