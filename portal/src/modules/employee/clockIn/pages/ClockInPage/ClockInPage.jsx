import { useState } from "react";

import useClockIn from "../../../../../hooks/useClockIn";
import useNow from "../../../../../hooks/useNow";

import {
  AssignedShiftCard,
  BreakCard,
  ClockOutDescription,
  ForgotPinModal,
  PinPad,
  SessionsCard,
  TaskAssignToday,
  TeamAttendanceCard,
  TodayStatusCard,
  WorkTimerCard,
} from "../../components";

import { getStatus } from "../../../../../utils/time";
import {
  getDayTotals,
  getOpenBreak,
} from "../../../../../utils/attendanceSessions";

const ClockInPage = () => {
  const c = useClockIn();
  const now = useNow(c.offset);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [description, setDescription] = useState("");

  const { record, shift, shifts, tasks, sessions, state, loading, error } = c;

  // "out" means the person can clock in; "in" or "break" shows the clock out pad.
  const mode = state === "out" ? "in" : "out";
  const onBreak = state === "break";

  const status = getStatus(now, shift, record);
  const totals = getDayTotals(sessions, now);
  const openBreak = getOpenBreak(sessions);

  const ready = !loading && !error;

  // The result must be returned: PinPad uses it to show errors and invalid PIN.
  const handleSubmit = async (pin) => {
    if (mode === "in") {
      return c.clockIn(pin);
    }

    const result = await c.clockOut(pin, description.trim());
    if (result?.ok) setDescription("");
    return result;
  };

  return (
    <div className="w-full">

      {/* ERROR */}
      {error && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-2.5 text-[12px] text-red-300">

          <span>{error}</span>

          <button
            type="button"
            onClick={() => c.reload()}
            className="font-semibold hover:text-white"
          >
            Retry
          </button>

        </div>
      )}

      {/* OUTDATED BACKEND WARNING */}
      {!error && !loading && c.backendOutdated && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-300">
          Backend update missing: breaks and multiple clock-ins need the
          updated backend. Run the database migration, then restart the backend.
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">

        {/* LEFT SIDE */}
        <div className="min-w-0 lg:sticky lg:top-4">

          <PinPad
            key={`${mode}-${onBreak}`}
            mode={mode}
            disabled={!ready || onBreak}
            keyboard={!forgotOpen && !onBreak}
            description={
              onBreak ? "End your break first, then clock out." : undefined
            }
            onSubmit={handleSubmit}
            onForgot={() => setForgotOpen(true)}
          />

        </div>

        {/* RIGHT SIDE */}
        <div className="mt-5 flex min-w-0 flex-col gap-4">

          <AssignedShiftCard
            shift={shifts}
            loading={loading}
          />

          <WorkTimerCard
            sessions={sessions}
            state={state}
            now={now}
          />

          {/* BREAK (only while clocked in) */}
          {state !== "out" && (
            <BreakCard
              state={state}
              openBreak={openBreak}
              now={now}
              busy={c.breakBusy}
              error={c.breakError}
              onStart={c.startBreak}
              onEnd={c.endBreak}
            />
          )}

          <TodayStatusCard
            status={status}
            record={record}
            totals={totals}
            state={state}
            loading={loading}
          />

          {/* CLOCK OUT DESCRIPTION */}
          {state === "in" && (
            <ClockOutDescription
              value={description}
              onChange={setDescription}
            />
          )}

          <SessionsCard
            sessions={sessions}
            now={now}
            loading={loading}
          />

          <TaskAssignToday
            tasks={tasks}
            loading={loading}
          />

          {/* TEAM STATUS: everyone's clock in / clock out, live */}
          <TeamAttendanceCard />

        </div>

      </div>

      {/* FORGOT PIN */}
      {forgotOpen && (
        <ForgotPinModal
          defaultEmail={c.me?.email || ""}
          onClose={() => setForgotOpen(false)}
        />
      )}

    </div>
  );
};

export default ClockInPage;