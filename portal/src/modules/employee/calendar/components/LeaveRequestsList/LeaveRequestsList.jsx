import Icon from '../Icons';
import PanelState from '../PanelState';
import { formatRange } from '../../../../../utils/calendar';

const STATUS_LABEL = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  unapproved: 'Pending',
};

export default function LeaveRequestsList({
  requests,
  loading,
  error,
  onRetry,
  footer,
}) {
  const list = requests || [];

  return (
    <section className="cal-card">
      <h2 className="cal-card__title">Leave Requests</h2>

      <PanelState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={list.length === 0}
        emptyText="No leave requests yet."
      >
        <ul className="cal-leaves">
          {list.map((request) => {
            const status = String(request.status || 'pending').toLowerCase();

            return (
              <li key={request.id}>
                <span
                  className={`cal-leaves__icon cal-leaves__icon--${status}`}
                >
                  <Icon name="calendar" size={11} />
                </span>

                <div className="cal-leaves__text">
                  <p>{request.subject || request.type || 'Leave'} Leave</p>
                  <small>
                    {formatRange(request.startDate, request.endDate)}
                  </small>
                </div>

                <span className={`cal-status cal-status--${status}`}>
                  {STATUS_LABEL[status] || status}
                </span>
              </li>
            );
          })}
        </ul>
      </PanelState>

      {footer}
    </section>
  );
}