export default function RequestLeaveButton({ onClick }) {
  return (
    <button type="button" className="cal-btn cal-btn--block" onClick={onClick}>
      Request Leave
    </button>
  );
}