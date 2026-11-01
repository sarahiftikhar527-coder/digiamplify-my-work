import { CalendarDays } from "lucide-react";
import LiveClock from "../LiveClock";
import { formatDateLong } from "../../../../../utils/time";

const WelcomeCard = ({ mode, firstName, now, status, children }) => {
  const title =
    mode === "in" ? `Welcome ${firstName}` : mode === "out" ? `Good Bye ${firstName}` : `See you tomorrow, ${firstName}`;
  const sub = mode === "done" ? "Your attendance for today is complete" : "Let's make today productive";

  return (
    <section className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-6">
      <div className="text-center">
        <h2 className="text-[17px] font-semibold text-white sm:text-lg">{title}</h2>
        <p className="mt-1 text-[12px] text-white/60">{sub}</p>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#141414] px-4 py-2 text-[12px] text-white/70">
          <CalendarDays size={14} />
          <span className="whitespace-nowrap">{formatDateLong(now)}</span>
        </div>
      </div>

      <div className="my-6">
        <LiveClock now={now} status={status} />
      </div>

      {children}
    </section>
  );
};

export default WelcomeCard;