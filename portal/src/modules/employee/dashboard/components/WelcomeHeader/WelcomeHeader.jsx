
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TodayProgressRing from "../TodayProgressRing";

const getGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";

  return "Good Evening";
};

const getDateLabel = (date = new Date()) =>
  `It's ${date.toLocaleDateString("en-US", {
    weekday: "long",
  })}, ${date.getDate()} ${date.toLocaleDateString("en-US", {
    month: "long",
  })} ${date.getFullYear()}.`;

const getEmployeeName = (user) => {
  if (!user) return "Employee";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    user.name ||
    user.fullName ||
    fullName ||
    user.username ||
    user.email?.split("@")[0] ||
    "Employee"
  );
};

const WelcomeHeader = ({
  user = null,
  name = "",
  greeting,
  dateLabel,
  percent = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const employeeName = useMemo(
    () => name || getEmployeeName(user),
    [name, user]
  );

  const currentGreeting = useMemo(
    () => greeting || getGreeting(),
    [greeting]
  );

  const currentDateLabel = useMemo(
    () => dateLabel || getDateLabel(),
    [dateLabel]
  );

  const progress = Math.min(
    100,
    Math.max(0, Number(percent) || 0)
  );

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="flex items-start justify-between gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="pt-4">
        <motion.h1
          className="text-3xl font-medium text-white"
          variants={itemVariants}
        >
          {currentGreeting},{" "}
          <motion.span
            className="text-red-700"
            initial={{
              opacity: 0,
              x: shouldReduceMotion ? 0 : -6,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease: "easeOut",
            }}
          >
            {employeeName}
          </motion.span>
        </motion.h1>

        <motion.p
          className="mt-1 text-xs text-gray-300"
          variants={itemVariants}
        >
          {currentDateLabel}
        </motion.p>
      </div>

      <motion.div variants={itemVariants}>
        <TodayProgressRing percent={progress} />
      </motion.div>
    </motion.div>
  );
};

export default WelcomeHeader;
