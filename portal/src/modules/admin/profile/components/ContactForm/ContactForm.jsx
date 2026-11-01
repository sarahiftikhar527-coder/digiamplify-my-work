import { useCallback } from 'react';
import Icon from '../Icon';
import Field from '../Field';

const CONTACT_FIELDS = [
  {
    label: 'Email',
    name: 'email',
    type: 'email',
  },
  {
    label: 'Work Email',
    name: 'workEmail',
    type: 'email',
  },
  {
    label: 'Phone Number',
    name: 'phone',
    type: 'tel',
  },
  {
    label: 'Emergency Number',
    name: 'emergencyNumber',
    type: 'tel',
  },
];

export default function ContactForm({
  values = {},
  onChange,
  editable = false,
}) {
  const handleChange = useCallback(
    (name, value) => {
      if (typeof onChange !== 'function') return;

      onChange(name, value);
    },
    [onChange]
  );

  return (
    <section aria-labelledby="pf-contact-title">
      <h3
        id="pf-contact-title"
        className="pf-card__title"
      >
        <Icon name="phone" />
        Contact
      </h3>

      <div className="pf-grid-2">
        {CONTACT_FIELDS.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type}
            value={values[field.name] ?? ''}
            onChange={handleChange}
            editable={editable}
          />
        ))}
      </div>
    </section>
  );
}
