
import { AlertCircle, Clock, CreditCard, Wallet } from 'lucide-react';

const TONES = {
  red: {
    icon: Wallet,
    box: 'bg-red-950/70 text-red-500',
    sub: 'text-neutral-300',
  },
  green: {
    icon: CreditCard,
    box: 'bg-emerald-950/70 text-emerald-500',
    sub: 'text-emerald-400',
  },
  amber: {
    icon: Clock,
    box: 'bg-amber-950/70 text-amber-500',
    sub: 'text-amber-400',
  },
  danger: {
    icon: AlertCircle,
    box: 'bg-red-950/70 text-red-500',
    sub: 'text-red-500',
  },
};

export default function PayrollStatCards({ stats }) {
  const statList = Array.isArray(stats) ? stats : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statList.length > 0 ? (
        statList.map((stat, index) => {
          const tone = TONES[stat.tone] || TONES.red;
          const Icon = tone.icon;

          return (
            <article
              key={stat.id ?? `${stat.label ?? 'payroll-stat'}-${index}`}
              className="flex items-center gap-4 rounded-lg border border-[#232323] bg-[#0a0a0a] p-4"
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded ${tone.box}`}
              >
                <Icon size={18} />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] text-neutral-400">
                  {stat.label || 'Payroll Statistic'}
                </p>

                <p className="truncate text-sm font-semibold">
                  {stat.value ?? '—'}
                </p>

                <p className={`text-[11px] ${tone.sub}`}>
                  {stat.sub ?? ''}
                </p>
              </div>
            </article>
          );
        })
      ) : (
        <div className="col-span-full rounded-lg border border-[#232323] bg-[#0a0a0a] p-5 text-center text-xs text-neutral-500">
          No payroll statistics available.
        </div>
      )}
    </div>
  );
}
