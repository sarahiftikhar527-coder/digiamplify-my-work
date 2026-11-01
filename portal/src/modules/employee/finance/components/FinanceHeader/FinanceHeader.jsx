
export default function FinanceHeader({
  title = 'Finances',
  subtitle = 'Track your earnings, deductions and requests.',
  className = '',
}) {
  return (
    <header className={`fn-header ${className}`.trim()}>
      <div className="fn-header__content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}
