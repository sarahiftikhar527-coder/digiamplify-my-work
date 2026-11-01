
import Icon from '../Icon';
import Field from '../Field';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function normalizeWorkingDays(value) {
  if (Array.isArray(value)) {
    return value.filter((day) => DAYS.includes(day));
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) return [];

    try {
      const parsedValue = JSON.parse(trimmedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue.filter((day) => DAYS.includes(day));
      }
    } catch {
      return trimmedValue
        .split(',')
        .map((day) => day.trim())
        .filter((day) => DAYS.includes(day));
    }

    return [];
  }

  return [];
}

function WorkingDays({ value, editable, onChange }) {
  const workingDays = normalizeWorkingDays(value);

  const toggle = (day) => {
    const updatedDays = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : DAYS.filter((d) => d === day || workingDays.includes(d));

    onChange('workingDays', updatedDays);
  };

  return (
    <div
      className="pf-field"
      role="group"
      aria-labelledby="pf-workingDays-label"
    >
      <span id="pf-workingDays-label" className="pf-field__label">
        Working Days
      </span>

      <div className="pf-days">
        {(editable ? DAYS : workingDays).map((day) =>
          editable ? (
            <button
              key={day}
              type="button"
              aria-pressed={workingDays.includes(day)}
              className={`pf-day${workingDays.includes(day) ? ' is-on' : ''}`}
              onClick={() => toggle(day)}
            >
              {day}
            </button>
          ) : (
            <span key={day} className="pf-day is-on">
              {day}
            </span>
          )
        )}

        {!editable && workingDays.length === 0 && (
          <span className="pf-day">Not specified</span>
        )}
      </div>
    </div>
  );
}

export default function JobDetailsTab({ values, onChange, editable }) {
  const f = (label, name, extra = {}) => (
    <Field
      label={label}
      name={name}
      value={values[name]}
      onChange={onChange}
      editable={editable}
      {...extra}
    />
  );

  return (
    <div className="pf-layout">
      <div className="pf-card">
        <h3 className="pf-card__title">
          <Icon name="briefcase" /> Job Details
        </h3>

        <div className="pf-grid-2">
          {f('Job Title', 'jobTitle')}
          {f('Department', 'department')}
          {f('Team', 'team')}
          {f('Manager', 'manager')}
          {f('Job Level', 'jobLevel', {
            type: 'select',
            options: ['Junior', 'Mid', 'Senior', 'Lead'],
          })}
          {f('Probation Period', 'probationPeriod')}
          {f('Date Of Joining', 'dateOfJoining', { type: 'date' })}
          {f('Confirmation Date', 'confirmationDate', { type: 'date' })}
          {f('Annual Leave', 'annualLeave', { type: 'number' })}
          {f('Job Type', 'jobType', {
            type: 'select',
            options: ['Full Time', 'Part Time', 'Contract', 'Intern'],
          })}
        </div>
      </div>

      <div className="pf-card">
        <h3 className="pf-card__title">
          <Icon name="briefcase" /> Work Status
        </h3>

        <div className="pf-stack">
          {f('Work Type', 'workType', {
            type: 'select',
            options: ['Remote', 'On-site', 'Hybrid'],
          })}

          {f('Shift', 'shift', {
            type: 'select',
            options: ['Day Shift', 'Night Shift', 'Evening Shift'],
          })}

          <WorkingDays
            value={values.workingDays}
            editable={editable}
            onChange={onChange}
          />

          {f('Weekly Off', 'weeklyOff', {
            type: 'select',
            options: ['Sunday', 'Saturday', 'Friday'],
          })}

          {f('Notice Period', 'noticePeriod')}
        </div>
      </div>
    </div>
  );
}