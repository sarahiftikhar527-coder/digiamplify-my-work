import { AlertCircleIcon, CardIcon, ClockIcon, WalletIcon } from "../Icons/Icons";
import { YESTERDAY } from "../../Constants";

const TONES = {
  red: { box: "bg-red-950/60 text-red-500", delta: "text-red-500" },
  green: { box: "bg-emerald-950/60 text-emerald-500", delta: "text-emerald-500" },
  amber: { box: "bg-amber-950/50 text-amber-400", delta: "text-amber-400" },
};

const CARDS = [
  { key: "open", label: "Open Escalation", Icon: WalletIcon, tone: "red" },
  { key: "inProgress", label: "In Progress", Icon: CardIcon, tone: "green" },
  { key: "resolved", label: "Resolved Today", Icon: ClockIcon, tone: "amber" },
  { key: "critical", label: "Critical Issues", Icon: AlertCircleIcon, tone: "red" },
];

export default function StatCards({ stats, yesterday = YESTERDAY }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, label, Icon, tone }) => {
        const delta = stats[key] - yesterday[key];
        const t = TONES[tone];
        return (
          <div key={key} className="flex items-center gap-4 rounded-md border border-[#222] bg-[#0b0b0b] p-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${t.box}`}>
              <Icon width={18} height={18} />
            </span>
            <div>
              <p className="text-xs text-neutral-400">{label}</p>
              <p className="my-0.5 text-lg font-semibold text-white">{stats[key]}</p>
              <p className="text-[11px] text-neutral-400">
                <span className={t.delta}>{delta > 0 ? `+${delta}` : delta}</span> from yesterday
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
