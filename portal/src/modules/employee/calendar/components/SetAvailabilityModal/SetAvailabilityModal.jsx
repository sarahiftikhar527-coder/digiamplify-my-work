import { useId, useState } from 'react';
import Modal from '../Modal';
import Icon from '../Icons';
import {
  WEEKDAYS,
  addDays,
  endMinutes,
  format12,
  toISO,
  toMinutes,
} from '../../../../../utils/calendar.js';

const SHIFTS = [
  { id: 'morning', label: 'Morning Shift', icon: 'sunrise', start: '09:00', end: '14:00' },
  { id: 'afternoon', label: 'Afternoon Shift', icon: 'sun', start: '14:00', end: '19:00' },
  { id: 'night', label: 'Night Shift', icon: 'moon', start: '19:00', end: '00:00' },
];

function validate(f) {
  const e = {};
  if (!f.days.length) e.days = 'Select at least one day.';
  if (!f.from || !f.to) e.date = 'Select both dates.';
  else if (f.to < f.from) e.date = '"To" date must be on or after the "From" date.';
  if (!f.start || !f.end) e.time = 'Select both times.';
  else if (f.shift !== 'night' && endMinutes(f.end) <= toMinutes(f.start)) e.time = 'End time must be after the start time.';
  if (!f.shift) e.shift = 'Select a shift.';
  return e;
}

export default function SetAvailabilityModal({ initialDate, onClose, onSubmit }) {
  const uid = useId();
  const [form, setForm] = useState({
    days: [0, 1, 2, 3, 4],
    from: toISO(initialDate),
    to: toISO(addDays(initialDate, 6)),
    start: '09:00',
    end: '14:00',
    shift: 'morning',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const patch = (changes, ...keys) => {
    setForm((f) => ({ ...f, ...changes }));
    setErrors((e) => {
      const next = { ...e };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const toggleDay = (i) =>
    patch({ days: form.days.includes(i) ? form.days.filter((d) => d !== i) : [...form.days, i] }, 'days');

  const chooseShift = (s) => patch({ shift: s.id, start: s.start, end: s.end }, 'shift', 'time');

  const submit = async (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit({
        days: [...form.days].sort((a, b) => a - b),
        from: form.from,
        to: form.to,
        start: form.start,
        end: form.end,
        shift: form.shift,
      });
    } catch (err) {
      setSubmitError(err.message || 'Could not save availability. Try again.');
      setSaving(false);
    }
  };

  const err = (key) => errors[key] && <p className="cal-error" role="alert">{errors[key]}</p>;

  return (
    <Modal
      title="Set Availability"
      subtitle="Select the days, date range, time and shift for your availability."
      icon="calendarClock"
      onClose={onClose}
      width={600}
    >
      <form className="cal-form" onSubmit={submit} noValidate>
        <div role="group" aria-labelledby={`${uid}-days`}>
          <span id={`${uid}-days`} className="cal-flabel">Select Days<span className="cal-req">*</span></span>
          <div className="cal-days">
            {WEEKDAYS.map((d, i) => {
              const on = form.days.includes(i);
              return (
                <button key={d} type="button" aria-pressed={on} className={`cal-dayopt${on ? ' is-on' : ''}`} onClick={() => toggleDay(i)}>
                  {d}
                  <span className="cal-tick"><Icon name="check" size={8} /></span>
                </button>
              );
            })}
          </div>
          <p className="cal-hint">You can select multiple days</p>
          {err('days')}
        </div>

        <hr className="cal-hr" />

        <div role="group" aria-labelledby={`${uid}-date`}>
          <span id={`${uid}-date`} className="cal-flabel">Select Date<span className="cal-req">*</span></span>
          <div className="cal-fgrid">
            <div>
              <label className="cal-sublabel" htmlFor={`${uid}-from`}>From</label>
              <div className="cal-iwrap">
                <Icon name="calendar" size={13} />
                <input id={`${uid}-from`} type="date" className="cal-input" aria-invalid={!!errors.date}
                  value={form.from} onChange={(e) => patch({ from: e.target.value }, 'date')} />
              </div>
            </div>
            <div>
              <label className="cal-sublabel" htmlFor={`${uid}-to`}>To</label>
              <div className="cal-iwrap">
                <Icon name="calendar" size={13} />
                <input id={`${uid}-to`} type="date" className="cal-input" aria-invalid={!!errors.date}
                  min={form.from || undefined} value={form.to} onChange={(e) => patch({ to: e.target.value }, 'date')} />
              </div>
            </div>
          </div>
          {err('date')}
        </div>

        <div role="group" aria-labelledby={`${uid}-time`}>
          <span id={`${uid}-time`} className="cal-flabel">Select Time<span className="cal-req">*</span></span>
          <div className="cal-fgrid">
            <div>
              <label className="cal-sublabel" htmlFor={`${uid}-start`}>Start Time</label>
              <div className="cal-iwrap">
                <Icon name="clock" size={13} />
                <input id={`${uid}-start`} type="time" className="cal-input" aria-invalid={!!errors.time}
                  value={form.start} onChange={(e) => patch({ start: e.target.value }, 'time')} />
              </div>
            </div>
            <div>
              <label className="cal-sublabel" htmlFor={`${uid}-end`}>End Time</label>
              <div className="cal-iwrap">
                <Icon name="clock" size={13} />
                <input id={`${uid}-end`} type="time" className="cal-input" aria-invalid={!!errors.time}
                  value={form.end} onChange={(e) => patch({ end: e.target.value }, 'time')} />
              </div>
            </div>
          </div>
          {err('time')}
        </div>

        <div>
          <span id={`${uid}-shift`} className="cal-flabel">Select Shift<span className="cal-req">*</span></span>
          <div className="cal-shifts" role="radiogroup" aria-labelledby={`${uid}-shift`}>
            {SHIFTS.map((s) => {
              const on = form.shift === s.id;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={on} className={`cal-shift${on ? ' is-on' : ''}`} onClick={() => chooseShift(s)}>
                  {on && <span className="cal-shift__check"><Icon name="check" size={9} /></span>}
                  <Icon name={s.icon} size={20} />
                  <strong>{s.label}</strong>
                  <small>{format12(s.start)} - {format12(s.end)}</small>
                </button>
              );
            })}
          </div>
          {err('shift')}
        </div>

        {submitError && <p className="cal-error" role="alert">{submitError}</p>}
        <div className="cal-form__actions">
          <button type="submit" className="cal-btn cal-btn--lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save Availability'}
          </button>
        </div>
      </form>
    </Modal>
  );
}