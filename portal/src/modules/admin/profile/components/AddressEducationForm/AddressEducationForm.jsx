import Icon from '../Icon';
import Field from '../Field';

export default function AddressEducationForm({ values, onChange, editable }) {
  return (
    <section>
      <h3 className="pf-card__title"><Icon name="pin" /> Address and Education</h3>
      <div className="pf-stack">
        <Field label="Current Address" name="currentAddress" value={values.currentAddress} onChange={onChange} editable={editable} />
        <Field label="Permanent Address" name="permanentAddress" value={values.permanentAddress} onChange={onChange} editable={editable} />
        <Field label="Country" name="country" value={values.country} onChange={onChange} editable={editable} />
        <Field label="City" name="city" value={values.city} onChange={onChange} editable={editable} />
        <Field label="Education" name="education" value={values.education} onChange={onChange} editable={editable} />
      </div>
    </section>
  );
}
