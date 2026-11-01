import PanelState from '../PanelState';
import { formatShort } from '../../../../../utils/calendar';

export default function UpcomingTaskList({ tasks, loading, error, onRetry }) {
  const list = tasks || [];
  const newCount = list.filter((t) => t.isNew).length;

  return (
    <section className="cal-card">
      <div className="cal-card__head">
        <h2 className="cal-card__title">Upcoming Task</h2>
        {newCount > 0 && <span className="cal-new">{newCount} New</span>}
      </div>
      <PanelState loading={loading} error={error} onRetry={onRetry} empty={list.length === 0} emptyText="No upcoming tasks.">
        <ul className="cal-tasks">
          {list.map((t) => (
            <li key={t.id}>
              <span className="cal-tasks__dot" />
              <span className="cal-tasks__title">{t.title}</span>
              <span className="cal-tasks__date">{formatShort(t.date)}</span>
            </li>
          ))}
        </ul>
      </PanelState>
    </section>
  );
}