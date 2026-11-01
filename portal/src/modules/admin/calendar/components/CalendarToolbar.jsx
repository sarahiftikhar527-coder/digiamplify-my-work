
import { useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EVENT_TYPES, MONTHS, pad } from '../calendarData';

export default function CalendarToolbar({
  cursor,
  view,
  filters = {},
  onPrev = () => {},
  onNext = () => {},
  onPickMonth = () => {},
  onViewChange = () => {},
  onToggleFilter = () => {},
  onAssign = () => {},
}) {
  const pickerRef = useRef(null);

  const value = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`;

  const openMonthPicker = () => {
    const picker = pickerRef.current;

    if (!picker) return;

    if (typeof picker.showPicker === 'function') {
      try {
        picker.showPicker();
        return;
      } catch {
        picker.focus();
        picker.click();
      }
    } else {
      picker.focus();
      picker.click();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous period"
            title="Previous period"
            className="grid h-8 w-8 place-items-center rounded border border-[#2a2a2a] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next period"
            title="Next period"
            className="grid h-8 w-8 place-items-center rounded border border-[#2a2a2a] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={openMonthPicker}
            aria-label={`Select month. Current month: ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}
            className="flex items-center gap-1.5 rounded py-1 text-sm font-semibold transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            <ChevronDown size={14} />
          </button>

          <input
            ref={pickerRef}
            type="month"
            value={value}
            aria-label="Choose calendar month"
            tabIndex={-1}
            onChange={(event) => {
              const selectedMonth = event.target.value;

              if (selectedMonth) {
                onPickMonth(selectedMonth);
              }
            }}
            className="pointer-events-none absolute left-0 top-full h-px w-px overflow-hidden opacity-0"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onAssign}
            className="rounded bg-[#c1121f] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#a30f1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Assign Shift
          </button>

          <select
            value={view}
            onChange={(event) => onViewChange(event.target.value)}
            aria-label="Calendar view"
            className="rounded border border-[#2a2a2a] bg-black px-2 py-2 text-xs text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-x-4 gap-y-2 rounded border border-[#1f1f1f] bg-[#070707] px-3 py-2"
        aria-label="Calendar filters"
      >
        {EVENT_TYPES.map((type) => {
          const enabled = Boolean(filters[type.id]);

          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={enabled}
              onClick={() => onToggleFilter(type.id)}
              className={`flex items-center gap-1.5 text-[11px] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 ${
                enabled ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${type.dot}`}
              />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
