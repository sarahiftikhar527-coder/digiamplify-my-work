import { useId, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CalendarClock,
  Calendar,
  Clock,
  X,
  CheckCircle2,
  Sunrise,
  Sun,
  Moon,
} from 'lucide-react';

/* ------------------------------ constants ------------------------------ */

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

const SHIFTS = [
  {
    id: 'morning',
    label: 'Morning Shift',
    start: '09:00',
    end: '14:00',
    icon: Sunrise,
  },
  {
    id: 'afternoon',
    label: 'Afternoon Shift',
    start: '14:00',
    end: '19:00',
    icon: Sun,
  },
  {
    id: 'night',
    label: 'Night Shift',
    start: '19:00',
    end: '00:00',
    icon: Moon,
  },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/* ------------------------------- helpers ------------------------------- */

// '2026-07-12' -> '12 July, 2026'
const formatDate = (value) => {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1]}, ${y}`;
};

// '14:00' -> '02:00 PM'
const formatTime = (value) => {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(
    2,
    '0'
  )} ${period}`;
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

/* ---------------------------- small components ---------------------------- */

const SectionLabel = ({ children }) => (
  <h3 className="text-lg font-medium text-white">
    {children} <span className="text-[#c1121f]">*</span>
  </h3>
);

const FieldError = ({ message }) =>
  message ? (
    <p role="alert" className="mt-2 text-sm text-red-500">
      {message}
    </p>
  ) : null;

// Looks like a text field, but opens the native picker on click.
const PickerField = ({
  id,
  label,
  type,
  icon: Icon,
  value,
  display,
  placeholder,
  onChange,
  min,
}) => {
  const inputRef = useRef(null);

  const openPicker = () => {
    try {
      inputRef.current?.showPicker?.();
    } catch {
      /* showPicker can throw if not user-activated; ignore */
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base text-gray-300">
        {label}
      </label>

      <div className="relative flex h-14 items-center gap-3 rounded-md border border-[#1e1e1e] bg-[#0b0b0b] px-4 transition-colors focus-within:border-[#c1121f] hover:border-[#3a1519]">
        <Icon size={18} className="shrink-0 text-gray-400" aria-hidden="true" />

        <span
          className={cn(
            'text-base',
            display ? 'text-gray-100' : 'text-gray-500'
          )}
        >
          {display || placeholder}
        </span>

        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          onClick={openPicker}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
        />
      </div>
    </div>
  );
};

/* -------------------------------- component -------------------------------- */

const Availability = ({
  defaultValues = {},
  onClose,
  onSave,
  saving = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const uid = useId();

  const [days, setDays] = useState(defaultValues.days ?? []);
  const [fromDate, setFromDate] = useState(defaultValues.fromDate ?? '');
  const [toDate, setToDate] = useState(defaultValues.toDate ?? '');
  const [startTime, setStartTime] = useState(defaultValues.startTime ?? '');
  const [endTime, setEndTime] = useState(defaultValues.endTime ?? '');
  const [errors, setErrors] = useState({});

  // The shift highlights automatically when the times match one of the presets.
  const activeShift = useMemo(
    () =>
      SHIFTS.find((s) => s.start === startTime && s.end === endTime)?.id ??
      null,
    [startTime, endTime]
  );

  const toggleDay = (id) => {
    setDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
    setErrors((prev) => ({ ...prev, days: undefined }));
  };

  const selectShift = (shift) => {
    setStartTime(shift.start);
    setEndTime(shift.end);
    setErrors((prev) => ({ ...prev, time: undefined, shift: undefined }));
  };

  const validate = () => {
    const next = {};

    if (days.length === 0) next.days = 'Select at least one day.';

    if (!fromDate || !toDate) {
      next.date = 'Choose a start and end date.';
    } else if (toDate < fromDate) {
      next.date = 'End date must be on or after the start date.';
    }

    if (!startTime || !endTime) {
      next.time = 'Choose a start and end time.';
    } else if (!activeShift && endTime <= startTime) {
      next.time = 'End time must be later than the start time.';
    }

    return next;
  };

  const handleSubmit = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave?.({
      days,
      fromDate,
      toDate,
      startTime,
      endTime,
      shift: activeShift,
    });
  };

  return (
    <motion.section
      role="dialog"
      aria-labelledby={`${uid}-title`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-3xl rounded-lg border border-[#1e1e1e] bg-[#09090a] p-6 text-white sm:p-10"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-md border border-[#2a2a2a] text-gray-200 transition-colors hover:border-[#c1121f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f] sm:right-10 sm:top-10"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <header className="pr-16">
        <div className="flex items-center gap-3">
          <CalendarClock
            size={26}
            className="shrink-0 text-[#c1121f]"
            aria-hidden="true"
          />
          <h2 id={`${uid}-title`} className="text-2xl font-semibold">
            Set Availability
          </h2>
        </div>

        <p className="mt-2 text-base text-gray-300">
          Select the days, date range, time and shift for your availability.
        </p>
      </header>

      {/* Days */}
      <div className="mt-10">
        <SectionLabel>Select Days</SectionLabel>

        <div
          role="group"
          aria-label="Days of the week"
          className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7"
        >
          {DAYS.map(({ id, label }) => {
            const selected = days.includes(id);

            return (
              <motion.button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleDay(id)}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                className={cn(
                  'flex h-[72px] flex-col items-center justify-center gap-2 rounded-md border text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f]',
                  selected
                    ? 'border-[#7a121b] bg-[#5a0f16] text-white'
                    : 'border-[#1e1e1e] bg-[#0b0b0b] text-gray-300 hover:border-[#3a1519]'
                )}
              >
                <span>{label}</span>
                <CheckCircle2
                  size={16}
                  className={selected ? 'text-white' : 'text-gray-500'}
                  aria-hidden="true"
                />
              </motion.button>
            );
          })}
        </div>

        <p className="mt-3 text-sm text-gray-400">
          You can select multiple days
        </p>
        <FieldError message={errors.days} />
      </div>

      <hr className="my-8 border-[#1e1e1e]" />

      {/* Date */}
      <div>
        <SectionLabel>Select Date</SectionLabel>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PickerField
            id={`${uid}-from`}
            label="From"
            type="date"
            icon={Calendar}
            value={fromDate}
            display={formatDate(fromDate)}
            placeholder="Select date"
            onChange={(v) => {
              setFromDate(v);
              setErrors((prev) => ({ ...prev, date: undefined }));
            }}
          />

          <PickerField
            id={`${uid}-to`}
            label="To"
            type="date"
            icon={Calendar}
            value={toDate}
            display={formatDate(toDate)}
            placeholder="Select date"
            min={fromDate || undefined}
            onChange={(v) => {
              setToDate(v);
              setErrors((prev) => ({ ...prev, date: undefined }));
            }}
          />
        </div>
        <FieldError message={errors.date} />
      </div>

      {/* Time */}
      <div className="mt-8">
        <SectionLabel>Select Time</SectionLabel>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PickerField
            id={`${uid}-start`}
            label="Start Time"
            type="time"
            icon={Clock}
            value={startTime}
            display={formatTime(startTime)}
            placeholder="Select time"
            onChange={(v) => {
              setStartTime(v);
              setErrors((prev) => ({ ...prev, time: undefined }));
            }}
          />

          <PickerField
            id={`${uid}-end`}
            label="End Time"
            type="time"
            icon={Clock}
            value={endTime}
            display={formatTime(endTime)}
            placeholder="Select time"
            onChange={(v) => {
              setEndTime(v);
              setErrors((prev) => ({ ...prev, time: undefined }));
            }}
          />
        </div>
        <FieldError message={errors.time} />
      </div>

      {/* Shift */}
      <div className="mt-8">
        <SectionLabel>Select Shift</SectionLabel>

        <div
          role="radiogroup"
          aria-label="Shift"
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {SHIFTS.map((shift) => {
            const selected = activeShift === shift.id;
            const Icon = shift.icon;

            return (
              <motion.button
                key={shift.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => selectShift(shift)}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className={cn(
                  'relative flex h-[120px] flex-col items-center justify-center gap-2 rounded-md border bg-[#0b0b0b] px-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f]',
                  selected
                    ? 'border-[#c1121f]'
                    : 'border-[#2a2a2a] hover:border-[#3a1519]'
                )}
              >
                {selected && (
                  <CheckCircle2
                    size={20}
                    className="absolute right-3 top-3 text-[#c1121f]"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  size={26}
                  className={selected ? 'text-[#c1121f]' : 'text-gray-200'}
                  aria-hidden="true"
                />

                <span className="text-base text-gray-100">{shift.label}</span>

                <span className="text-sm text-gray-300">
                  {formatTime(shift.start)} - {formatTime(shift.end)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="mt-10 flex justify-end">
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          whileHover={shouldReduceMotion || saving ? undefined : { y: -2 }}
          whileTap={shouldReduceMotion || saving ? undefined : { scale: 0.97 }}
          className="h-12 rounded-md bg-[#c1121f] px-8 text-base font-medium text-white transition-colors hover:bg-[#a30f1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </motion.button>
      </div>
    </motion.section>
  );
};

export default Availability;
