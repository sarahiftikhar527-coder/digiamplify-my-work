
import { AlertTriangle } from 'lucide-react';

const formatAlertDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export default function PayrollAlerts({ alerts }) {
  const alertList = Array.isArray(alerts) ? alerts : [];

  return (
    <section
      className="rounded-lg border border-[#232323] bg-[#0a0a0a] p-4 sm:p-5"
      aria-labelledby="alerts-title"
    >
      <h2
        id="alerts-title"
        className="mb-3 text-xs font-semibold"
      >
        Performance Alert
      </h2>

      {alertList.length > 0 ? (
        <ul>
          {alertList.map((alert, index) => {
            const last = index === alertList.length - 1;

            return (
              <li
                key={alert.id ?? `${alert.text ?? 'alert'}-${index}`}
                className="flex gap-3"
              >
                <div className="flex flex-col items-center pt-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-red-700 bg-red-950/70 text-red-500">
                    <AlertTriangle size={13} />
                  </span>

                  {!last && (
                    <span className="mt-1 w-px flex-1 bg-red-900/70" />
                  )}
                </div>

                <div
                  className={`flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-0.5 py-3.5 ${
                    last ? '' : 'border-b border-[#232323]'
                  }`}
                >
                  <p className="text-[11px]">
                    {alert.text || 'Payroll alert'}
                  </p>

                  <p className="text-[10px] text-neutral-300">
                    {formatAlertDate(alert.date)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex min-h-16 items-center justify-center">
          <p className="text-center text-xs text-neutral-500">
            No payroll alerts available.
          </p>
        </div>
      )}
    </section>
  );
}
