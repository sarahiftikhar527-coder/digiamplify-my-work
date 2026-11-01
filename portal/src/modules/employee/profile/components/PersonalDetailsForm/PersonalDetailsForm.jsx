
import { useCallback } from 'react';
import Icon from '../Icon';
import Field from '../Field';

const PERSONAL_FIELDS = [
  {
    label: 'Full Name',
    name: 'fullName',
    type: 'text',
  },
  {
    label: 'User Name',
    name: 'userName',
    type: 'text',
  },
  {
    label: 'Date Of Birth',
    name: 'dob',
    type: 'date',
  },
  {
    label: 'Gender',
    name: 'gender',
    type: 'select',
    options: ['Female', 'Male', 'Other'],
  },
  {
    label: 'Nationality',
    name: 'nationality',
    type: 'text',
  },
  {
    label: 'Language',
    name: 'language',
    type: 'text',
  },
];

export default function PersonalDetailsForm({
  values = {},
  onChange,
  editable = false,
}) {
  const handleChange = useCallback(
    (name, value) => {
      if (typeof onChange !== 'function') return;

      // Supports a parent handler that accepts (name, value).
      onChange(name, value);
    },
    [onChange]
  );

  return (
    <section aria-labelledby="pf-personal-details-title">
      <h3
        id="pf-personal-details-title"
        className="pf-card__title"
      >
        <Icon name="user" />
        Personal Details
      </h3>

      <div className="pf-grid-2">
        {PERSONAL_FIELDS.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type}
            options={field.options}
            value={values[field.name] ?? ''}
            onChange={handleChange}
            editable={editable}
          />
        ))}
      </div>
    </section>
  );
}