
import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const START = 135;
const SWEEP = 270;

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const TodayProgressRing = ({
  percent = 0,
  size = 150,
  stroke = 9,
  animate = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const targetPercent = useMemo(() => {
    const value = Number(percent);

    return clamp(Number.isFinite(value) ? value : 0, 0, 100);
  }, [percent]);

  const progress = useSpring(
    animate && !shouldReduceMotion ? 0 : targetPercent,
    {
      stiffness: 65,
      damping: 18,
      mass: 0.7,
    }
  );

  const [displayPercent, setDisplayPercent] = useState(
    animate && !shouldReduceMotion ? 0 : targetPercent
  );

  const animatedPercent = useTransform(progress, (value) =>
    Math.round(clamp(value, 0, 100))
  );

  useEffect(() => {
    if (!animate || shouldReduceMotion) {
      progress.jump(targetPercent);
      setDisplayPercent(targetPercent);
      return;
    }

    progress.set(targetPercent);
  }, [targetPercent, animate, shouldReduceMotion, progress]);

  useEffect(() => {
    const unsubscribe = animatedPercent.on("change", (value) => {
      setDisplayPercent(value);
    });

    return unsubscribe;
  }, [animatedPercent]);

  const cx = size / 2;
  const cy = size / 2;
  const r = Math.max(1, (size - stroke) / 2 - 4);
  const circumference = 2 * Math.PI * r;
  const arc = circumference * (SWEEP / 360);

  const normalizedProgress = displayPercent / 100;
  const angle =
    ((START + SWEEP * normalizedProgress) * Math.PI) / 180;

  const dotX = cx + r * Math.cos(angle);
  const dotY = cy + r * Math.sin(angle);

  const progressOffset = arc * (1 - normalizedProgress);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label="Today's task completion progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={displayPercent}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-hidden="true"
      >
        <g transform={`rotate(${START} ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#262626"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
          />

          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#c1121f"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            initial={false}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{
              duration: shouldReduceMotion || !animate ? 0 : 0.15,
              ease: "linear",
            }}
            style={{
              filter:
                "drop-shadow(0 0 3px rgba(193, 18, 31, 0.2))",
            }}
          />
        </g>

        <motion.circle
          cx={dotX}
          cy={dotY}
          r={5}
          fill="#fff"
          initial={false}
          animate={{
            cx: dotX,
            cy: dotY,
            opacity: 1,
          }}
          transition={{
            cx: {
              duration: shouldReduceMotion || !animate ? 0 : 0.15,
              ease: "linear",
            },
            cy: {
              duration: shouldReduceMotion || !animate ? 0 : 0.15,
              ease: "linear",
            },
            opacity: {
              duration: shouldReduceMotion ? 0 : 0.3,
            },
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] text-gray-200">
          Today&apos;s Progress
        </span>

        <motion.span
          className="text-2xl font-medium leading-tight text-white"
          aria-hidden="true"
        >
          {displayPercent}%
        </motion.span>

        <span className="text-[10px] text-gray-200">
          Tasks completed
        </span>
      </div>
    </div>
  );
};

export default TodayProgressRing;
