import {
  EVENT_TYPES,
  LEGEND_ORDER,
} from '../../../../../utils/calendar';

export default function CalendarLegend({
  visible = {},
  onToggle = () => {},
}) {
  return (
    <div
      className="cal-legend"
      role="group"
      aria-label="Show or hide calendar items"
    >
      {LEGEND_ORDER.map((key) => {
        const item = EVENT_TYPES[key];

        if (!item) return null;

        const isVisible = visible[key] !== false;

        return (
          <button
            key={key}
            type="button"
            className={`cal-legend__item${isVisible ? '' : ' is-off'}`}
            aria-pressed={isVisible}
            onClick={() => onToggle(key)}
          >
            <span className={`cal-dot cal-dot--${key}`} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}