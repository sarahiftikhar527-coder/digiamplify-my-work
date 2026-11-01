const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

export default function Field({ label, name, value, onChange, editable, type = 'text', options }) {
  const id = `pf-${name}`;
  const isSelect = type === 'select';
  const showFormattedDate = type === 'date' && !editable;

  return (
    <div className="pf-field">
      <label htmlFor={id}>{label}</label>
      {isSelect && editable ? (
        <select id={id} value={value} onChange={(e) => onChange(name, e.target.value)}>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={showFormattedDate || isSelect ? 'text' : type}
          value={showFormattedDate ? formatDate(value) : value}
          readOnly={!editable}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
    </div>
  );
}
