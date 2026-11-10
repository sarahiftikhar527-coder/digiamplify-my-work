const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

export const RECURRENCE_RULES = ["none", "daily", "weekdays", "weekly", "biweekly", "monthly"];

const MAX_ITERATIONS = 1500;

/**
 * Expands a meeting (single or recurring) into occurrences that overlap
 * [rangeStart, rangeEnd]. All maths is done on the organizer's wall clock
 * (startAt shifted by tzOffset) so "every Monday 10:00" stays at 10:00 local.
 */
export function expandOccurrences(meeting, rangeStart, rangeEnd, { includeSkipped = false } = {}) {
  const startAt = new Date(meeting.startAt);
  const duration = new Date(meeting.endAt).getTime() - startAt.getTime();
  const skipped = new Set(Array.isArray(meeting.skippedDates) ? meeting.skippedDates : []);
  const out = [];

  const consider = (start) => {
    const end = new Date(start.getTime() + duration);
    if (end <= rangeStart || start >= rangeEnd) return;
    const key = start.toISOString();
    const isSkipped = skipped.has(key);
    if (isSkipped && !includeSkipped) return;
    out.push({ start, end, key, skipped: isSkipped });
  };

  const rule = meeting.recurrence || "none";

  if (rule === "none") {
    consider(startAt);
    return out;
  }

  const offset = (meeting.tzOffset || 0) * MIN;
  const base = new Date(startAt.getTime() + offset); // "local time as UTC"
  const until = meeting.recurrenceUntil ? new Date(meeting.recurrenceUntil) : null;
  const hardEnd = until && until < rangeEnd ? until : rangeEnd;

  const toReal = (local) => new Date(local.getTime() - offset);

  let cursor = new Date(base);

  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
    let local;

    switch (rule) {
      case "daily":
        local = new Date(base.getTime() + i * DAY);
        break;
      case "weekly":
        local = new Date(base.getTime() + i * 7 * DAY);
        break;
      case "biweekly":
        local = new Date(base.getTime() + i * 14 * DAY);
        break;
      case "weekdays": {
        if (i > 0) {
          do {
            cursor = new Date(cursor.getTime() + DAY);
          } while ([0, 6].includes(cursor.getUTCDay()));
        }
        local = new Date(cursor);
        break;
      }
      case "monthly": {
        const target = new Date(
          Date.UTC(
            base.getUTCFullYear(),
            base.getUTCMonth() + i,
            1,
            base.getUTCHours(),
            base.getUTCMinutes(),
            base.getUTCSeconds()
          )
        );
        const lastDay = new Date(
          Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
        ).getUTCDate();
        target.setUTCDate(Math.min(base.getUTCDate(), lastDay));
        local = target;
        break;
      }
      default:
        return out;
    }

    const start = toReal(local);

    if (start > hardEnd) break;

    consider(start);
  }

  return out;
}

/** Next non-skipped occurrence starting at/after `from`. */
export function nextOccurrence(meeting, from = new Date(), horizonDays = 400) {
  const horizon = new Date(from.getTime() + horizonDays * DAY);
  const list = expandOccurrences(meeting, new Date(from.getTime() - 1), horizon);
  return list.find((occ) => occ.start >= from) || null;
}