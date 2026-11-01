
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  CalendarPlus,
  User,
  Wallet,
  LifeBuoy,
  Users,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

/* =========================================
   QUICK ACTIONS CONFIG
========================================= */

const DEFAULT_ACTIONS = [
  {
    id: "leave",
    label: "Request Leave",
    description: "Apply for time off",
    icon: CalendarPlus,
    type: "modal",
  },
  {
    id: "profile",
    label: "View Profile",
    description: "Access your files",
    icon: User,
    path: "/profile",
  },
  {
    id: "payslip",
    label: "View Payslip",
    description: "Check your salary",
    icon: Wallet,
    path: "/finance",
  },
  {
    id: "help",
    label: "Help Center",
    description: "Get support",
    icon: LifeBuoy,
    path: "/help",
  },
  {
    id: "team",
    label: "Team",
    description: "Find Colleagues",
    icon: Users,
    path: "/team",
  },
];

/* =========================================
   LEAVE CONFIG
========================================= */

const LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Casual Leave",
  "Unpaid Leave",
];

/* =========================================
   DATE HELPERS
========================================= */

const today = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const daysBetween = (from, to) => {
  if (!from || !to || to < from) return 0;

  const [fromYear, fromMonth, fromDay] = from
    .split("-")
    .map(Number);

  const [toYear, toMonth, toDay] = to
    .split("-")
    .map(Number);

  const start = Date.UTC(
    fromYear,
    fromMonth - 1,
    fromDay
  );

  const end = Date.UTC(
    toYear,
    toMonth - 1,
    toDay
  );

  return Math.floor((end - start) / 86400000) + 1;
};

/* =========================================
   INPUT STYLING
========================================= */

const inputCls =
  "w-full rounded border border-[#1e1e1e] bg-[#0b0b0b] px-2.5 py-2 text-[11px] text-white outline-none transition placeholder:text-gray-600 focus:border-red-700";

/* =========================================
   LEAVE MODAL
========================================= */

const LeaveModal = ({ onClose, onSubmitLeave }) => {
  const shouldReduceMotion = useReducedMotion();

  const [form, setForm] = useState(() => ({
    leaveType: LEAVE_TYPES[0],
    fromDate: today(),
    toDate: today(),
    reason: "",
  }));

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const firstFieldRef = useRef(null);
  const submittingRef = useRef(false);
  const closeTimerRef = useRef(null);
  const previousFocusRef = useRef(null);

  const totalDays = useMemo(
    () => daysBetween(form.fromDate, form.toDate),
    [form.fromDate, form.toDate]
  );

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      };

  /* =========================================
     MODAL ACCESSIBILITY
  ========================================= */

  useEffect(() => {
    previousFocusRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      firstFieldRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !submittingRef.current
      ) {
        onClose();
      }

      if (event.key === "Tab") {
        const modal = document.getElementById(
          "leave-modal-dialog"
        );

        if (!modal) return;

        const focusable = modal.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocusRef.current?.focus?.();
    };
  }, [onClose]);

  /* =========================================
     FORM FIELD HANDLER
  ========================================= */

  const setField = (key) => (event) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
      ...(key === "fromDate"
        ? { toDate: undefined }
        : {}),
    }));

    setServerError("");

    setStatus((previous) =>
      previous === "error" ? "idle" : previous
    );
  };

  /* =========================================
     FORM VALIDATION
  ========================================= */

  const validate = () => {
    const nextErrors = {};
    const currentDate = today();

    if (!form.fromDate) {
      nextErrors.fromDate = "Start date required";
    } else if (form.fromDate < currentDate) {
      nextErrors.fromDate =
        "Start date cannot be in the past";
    }

    if (!form.toDate) {
      nextErrors.toDate = "End date required";
    } else if (form.toDate < currentDate) {
      nextErrors.toDate =
        "End date cannot be in the past";
    }

    if (
      form.fromDate &&
      form.toDate &&
      form.toDate < form.fromDate
    ) {
      nextErrors.toDate =
        "End date must be after start date";
    }

    if (form.reason.trim().length < 5) {
      nextErrors.reason =
        "Please enter a reason (min 5 characters)";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =========================================
     SUBMIT LEAVE REQUEST
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      submittingRef.current ||
      status === "success"
    ) {
      return;
    }

    setServerError("");

    if (!validate()) return;

    if (typeof onSubmitLeave !== "function") {
      setStatus("error");

      setServerError(
        "Leave request submission is not configured yet."
      );

      return;
    }

    submittingRef.current = true;
    setStatus("loading");

    const payload = {
      leaveType: form.leaveType,
      fromDate: form.fromDate,
      toDate: form.toDate,
      reason: form.reason.trim(),
      totalDays,
    };

    try {
      await onSubmitLeave(payload);

      setStatus("success");

      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      setStatus("error");

      setServerError(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      submittingRef.current = false;
    }
  };

  /* =========================================
     MODAL UI
  ========================================= */

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0 }
      }
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submittingRef.current
        ) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-modal-title"
    >
      <motion.div
        id="leave-modal-dialog"
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 14,
                scale: 0.98,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : {
                opacity: 0,
                y: 10,
                scale: 0.98,
              }
        }
        transition={transition}
        className="w-full max-w-md rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2
            id="leave-modal-title"
            className="text-sm font-medium text-white"
          >
            Request Leave
          </h2>

          <motion.button
            type="button"
            onClick={onClose}
            disabled={status === "loading"}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    rotate: 90,
                    scale: 1.05,
                  }
            }
            whileTap={
              shouldReduceMotion
                ? undefined
                : { scale: 0.9 }
            }
            transition={transition}
            className="text-gray-400 transition hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            <X size={16} />
          </motion.button>
        </div>

        <AnimatePresence
          mode="wait"
          initial={false}
        >
          {status === "success" ? (
            <motion.div
              key="success"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 8,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{ opacity: 0 }}
              transition={transition}
              className="flex flex-col items-center gap-2 py-10 text-center"
              role="status"
            >
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        scale: 0.7,
                        opacity: 0,
                      }
                }
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={transition}
              >
                <CheckCircle2
                  size={36}
                  className="text-green-500"
                />
              </motion.div>

              <p className="text-xs text-white">
                Leave request submitted
              </p>

              <p className="text-[10px] text-gray-400">
                {totalDays} day(s) • {form.leaveType}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 5,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
              transition={transition}
              onSubmit={handleSubmit}
              className="mt-4 space-y-3"
              noValidate
            >
              {/* LEAVE TYPE */}

              <div>
                <label
                  htmlFor="leave-type"
                  className="mb-1 block text-[10px] text-gray-400"
                >
                  Leave Type
                </label>

                <select
                  id="leave-type"
                  ref={firstFieldRef}
                  value={form.leaveType}
                  onChange={setField("leaveType")}
                  className={inputCls}
                  disabled={status === "loading"}
                >
                  {LEAVE_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="bg-[#0b0b0b]"
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE FIELDS */}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="leave-from-date"
                    className="mb-1 block text-[10px] text-gray-400"
                  >
                    From
                  </label>

                  <input
                    id="leave-from-date"
                    type="date"
                    min={today()}
                    value={form.fromDate}
                    onChange={setField("fromDate")}
                    className={inputCls}
                    disabled={status === "loading"}
                    aria-invalid={Boolean(errors.fromDate)}
                  />

                  <AnimatePresence>
                    {errors.fromDate && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -3,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{ opacity: 0 }}
                        className="mt-1 text-[10px] text-red-500"
                      >
                        {errors.fromDate}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label
                    htmlFor="leave-to-date"
                    className="mb-1 block text-[10px] text-gray-400"
                  >
                    To
                  </label>

                  <input
                    id="leave-to-date"
                    type="date"
                    min={form.fromDate || today()}
                    value={form.toDate}
                    onChange={setField("toDate")}
                    className={inputCls}
                    disabled={status === "loading"}
                    aria-invalid={Boolean(errors.toDate)}
                  />

                  <AnimatePresence>
                    {errors.toDate && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -3,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{ opacity: 0 }}
                        className="mt-1 text-[10px] text-red-500"
                      >
                        {errors.toDate}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* TOTAL DAYS */}

              <motion.p
                key={totalDays}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0.5 }
                }
                animate={{ opacity: 1 }}
                transition={transition}
                className="text-[10px] text-gray-400"
              >
                Total days:{" "}
                <span className="text-white">
                  {totalDays}
                </span>
              </motion.p>

              {/* REASON */}

              <div>
                <label
                  htmlFor="leave-reason"
                  className="mb-1 block text-[10px] text-gray-400"
                >
                  Reason
                </label>

                <textarea
                  id="leave-reason"
                  rows={3}
                  value={form.reason}
                  onChange={setField("reason")}
                  placeholder="Why do you need this leave?"
                  className={`${inputCls} resize-none`}
                  disabled={status === "loading"}
                  aria-invalid={Boolean(errors.reason)}
                />

                <AnimatePresence>
                  {errors.reason && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -3,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-[10px] text-red-500"
                    >
                      {errors.reason}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* SERVER ERROR */}

              <AnimatePresence>
                {status === "error" && (
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                    }}
                    role="alert"
                    className="rounded border border-red-900/70 bg-red-950/40 px-2.5 py-2 text-[10px] text-red-400"
                  >
                    {serverError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 pt-1">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={status === "loading"}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { y: -1 }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : { scale: 0.97 }
                  }
                  transition={transition}
                  className="rounded border border-[#1e1e1e] px-3 py-1.5 text-[11px] text-gray-300 transition hover:border-gray-500 disabled:opacity-40"
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileHover={
                    shouldReduceMotion ||
                    status === "loading"
                      ? undefined
                      : { y: -1 }
                  }
                  whileTap={
                    shouldReduceMotion ||
                    status === "loading"
                      ? undefined
                      : { scale: 0.97 }
                  }
                  transition={transition}
                  className="flex items-center gap-1.5 rounded bg-red-700 px-3 py-1.5 text-[11px] text-white transition hover:bg-red-600 disabled:opacity-60"
                >
                  {status === "loading" && (
                    <Loader2
                      size={12}
                      className="animate-spin"
                    />
                  )}

                  {status === "loading"
                    ? "Submitting..."
                    : "Submit Request"}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* =========================================
   QUICK ACTIONS COMPONENT
========================================= */

const QuickActions = ({
  actions = DEFAULT_ACTIONS,
  onAction,
  onNavigate,
  onSubmitLeave,
  disabled = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // React Router navigation
  const navigate = useNavigate();

  const [leaveOpen, setLeaveOpen] = useState(false);

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 0.22,
        ease: "easeOut",
      };

  /* =========================================
     ACTION HANDLER
  ========================================= */

  const handleClick = (action) => {
    if (disabled) return;

    // Parent callback
    onAction?.(action.id, action);

    // LEAVE MODAL
    if (
      action.type === "modal" &&
      action.id === "leave"
    ) {
      setLeaveOpen(true);
      return;
    }

    // PAGE NAVIGATION
    if (action.path) {
      if (typeof onNavigate === "function") {
        onNavigate(action.path, action);
      } else {
        navigate(action.path);
      }
    }
  };

  /* =========================================
     QUICK ACTIONS UI
  ========================================= */

  return (
    <>
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 8,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={transition}
        className="rounded-md border border-[#1e1e1e] bg-[#0b0b0b] p-4"
      >
        <h3 className="text-xs font-medium text-white">
          Quick Actions
        </h3>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

          {actions.map((action, index) => {
            const {
              id,
              label,
              description,
              icon: Icon = User,
            } = action;

            return (
              <motion.button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => handleClick(action)}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 8,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  ...transition,
                  delay: shouldReduceMotion
                    ? 0
                    : index * 0.045,
                }}
                whileHover={
                  shouldReduceMotion || disabled
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  shouldReduceMotion || disabled
                    ? undefined
                    : { scale: 0.98 }
                }
                className="group flex items-center gap-2.5 rounded border border-red-950 bg-[#120808] px-3 py-2.5 text-left transition hover:border-red-700 focus:outline-none focus-visible:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {/* ICON */}

                <motion.span
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { scale: 1.08 }
                  }
                  transition={transition}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-red-900/70 bg-red-950/50 text-red-600"
                >
                  <Icon size={12} />
                </motion.span>

                {/* TEXT */}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] text-white">
                    {label}
                  </span>

                  <span className="block truncate text-[9px] text-gray-400">
                    {description}
                  </span>
                </span>

                {/* ARROW */}

                <ArrowRight
                  size={14}
                  className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5"
                />
              </motion.button>
            );
          })}

        </div>
      </motion.div>

      {/* LEAVE MODAL */}

      <AnimatePresence>
        {leaveOpen && (
          <LeaveModal
            key="leave-modal"
            onClose={() => setLeaveOpen(false)}
            onSubmitLeave={onSubmitLeave}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickActions;