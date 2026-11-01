export default function PanelState({ loading, error, onRetry, empty, emptyText = 'Nothing to show.', children }) {
  if (error) {
    return (
      <p className="cal-msg cal-msg--error" role="alert">
        {error}{' '}
        <button type="button" onClick={onRetry}>Retry</button>
      </p>
    );
  }
  if (empty && loading) return <p className="cal-msg">Loading…</p>;
  if (empty) return <p className="cal-msg">{emptyText}</p>;
  return children;
}