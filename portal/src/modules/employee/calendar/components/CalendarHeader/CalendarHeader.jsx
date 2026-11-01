export default function CalendarHeader({
  title = 'Calendar',
  subtitle = 'View your schedule, tasks and important dates.',
}) {
  return (
    <header className="cal-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}