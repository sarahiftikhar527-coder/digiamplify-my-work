import Icon from '../Icon';
import Field from '../Field';

export default function PaymentDetailsTab({ values, onChange, editable }) {
  const f = (label, name, extra = {}) => (
    <Field label={label} name={name} value={values[name]} onChange={onChange} editable={editable} {...extra} />
  );

  return (
    <div className="pf-card">
      <h3 className="pf-card__title"><Icon name="card" /> Payment Details</h3>
      <div className="pf-grid-2 pf-grid-2--wide">
        {f('Bank Name', 'bankName')}
        {f('Annual Salary', 'annualSalary')}
        {f('Account Holder Name', 'accountHolder')}
        {f('Salary Type', 'salaryType', { type: 'select', options: ['Monthly', 'Hourly', 'Project Based'] })}
        {f('Account Number', 'accountNumber')}
        {f('Salary', 'salary')}
        {f('Currency', 'currency', { type: 'select', options: ['Rupees', 'Dollar', 'Euro'] })}
        {f('Deduction per Absence', 'deductionPerAbsence')}
        {f('Bonus', 'bonus')}
        {f('Salary Payment Date', 'salaryPaymentDate', { type: 'date' })}
      </div>
    </div>
  );
}