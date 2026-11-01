import { useEffect, useRef, useState } from 'react';
import Icon from '../Icons';
import {
  MONTHS,
  periodLabel,
} from '../../../../../utils/calendar';

function MonthPicker({ cursor, onPick, onClose }) {
  const [year, setYear] = useState(cursor.getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="cal-picker"
      role="dialog"
      aria-label="Choose month"
    >
      <div className="cal-picker__head">
        <button
          type="button"
          className="cal-sq cal-sq--sm"
          aria-label="Previous year"
          onClick={() => setYear((current) => current - 1)}
        >
          <Icon name="chevronLeft" size={11} />
        </button>

        <strong>{year}</strong>

        <button
          type="button"
          className="cal-sq cal-sq--sm"
          aria-label="Next year"
          onClick={() => setYear((current) => current + 1)}
        >
          <Icon name="chevronRight" size={11} />
        </button>
      </div>

      <div className="cal-picker__grid">
        {MONTHS.map((month, index) => (
          <button
            key={month}
            type="button"
            className={
              year === cursor.getFullYear() &&
              index === cursor.getMonth()
                ? 'is-active'
                : ''
            }
            onClick={() => onPick(new Date(year, index, 1))}
          >
            {month.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CalendarToolbar({
  view,
  cursor,
  onPrev,
  onNext,
  onPickMonth,
  onViewChange,
  onSetAvailability,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const label = periodLabel(view, cursor);
  const unit = view === 'week' ? 'week' : 'month';

  const closePicker = () => setPickerOpen(false);

  const pickMonth = (date) => {
    onPickMonth(date);
    closePicker();
  };

  return (
    <div className="cal-toolbar">
      <div className="cal-toolbar__nav">
        <button
          type="button"
          className="cal-sq"
          aria-label={`Previous ${unit}`}
          onClick={onPrev}
        >
          <Icon name="chevronLeft" size={12} />
        </button>

        <button
          type="button"
          className="cal-sq"
          aria-label={`Next ${unit}`}
          onClick={onNext}
        >
          <Icon name="chevronRight" size={12} />
        </button>

        <div className="cal-month">
          {view === 'month' ? (
            <>
              <button
                type="button"
                className="cal-month__btn"
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((current) => !current)}
              >
                {label}
                <Icon name="chevronDown" size={12} />
              </button>

              {pickerOpen && (
                <MonthPicker
                  cursor={cursor}
                  onPick={pickMonth}
                  onClose={closePicker}
                />
              )}
            </>
          ) : (
            <span className="cal-month__btn">
              {label}
            </span>
          )}
        </div>
      </div>

      <div className="cal-toolbar__actions">
        

        <label className="cal-select">
          <span className="sr-only">
            Calendar view
          </span>

          <select
            value={view}
            onChange={(event) => onViewChange(event.target.value)}
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>

          <Icon name="chevronDown" size={12} />
        </label>
      </div>
    </div>
  );
}