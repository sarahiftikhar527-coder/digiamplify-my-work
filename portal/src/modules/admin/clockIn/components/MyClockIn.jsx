import { useMemo, useState } from "react";

import PinPanel from "./PinPanel";
import TeamTodayPanel from "./TeamTodayPanel";

import {
  AssignedShiftCard,
  BreakCard,
  ClockOutReport,
  ForgotPinModal,
  PinPad,
  SessionsCard,
  TaskAssignToday,
  TodayStatusCard,
  WorkTimerCard,
} from "../../../employee/clockIn/components";

import useClockIn from "../../../../hooks/useClockIn";
import useNow from "../../../../hooks/useNow";
import { clockInService } from "../../../../services/clockInService.js";
import { getStatus } from "../../../../utils/time";
import {
  getDayTotals,
  getOpenBreak,
} from "../../../../utils/attendanceSessions";

// The admin's own clock in: same screen as the employee Clock In page,
// followed by the live attendance of the whole team.
const MyClockIn = () => {
  const c = useClockIn();
  const now = useNow(c.offset);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [doneIds, setDoneIds] = useState([]);
  const [pinSetupSubmitting, setPinSetupSubmitting] = useState(false);

  const { record, shift, shifts, tasks, sessions, state, loading, error } = c;

  // hasPin === false means the PIN was never created: show the setup card.
  const needsPin = c.hasPin === false;

  // "out" means the admin can clock in; "in" or "break" shows clock out.
  const mode = state === "out" ? "in" : "out";
  const onBreak = state === "break";

  const status = getStatus(now, shift, record);
  const totals = getDayTotals(sessions, now);
  const openBreak = getOpenBreak(sessions);

  const ready = !loading && !error;

  const tickedIds = useMemo(() => {
    const open = new Set(
      (tasks || [])
        .filter((task) => !task.completed && !task.inReview)
        .map((task) => task.id)
    );

    return doneIds.filter((id) => open.has(id));
  }, [doneIds, tasks]);

  const handleSubmit = async (pin) => {
    if (mode === "in") {
      return c.clockIn(pin);
    }

    const result = await c.clockOut(pin, description.trim(), tickedIds);

    if (result?.ok) {
      setDescription("");
      setDoneIds([]);
    }

    return result;
  };

  const handleSetPin = async (password, newPin) => {
    setPinSetupSubmitting(true);

    try {
      await clockInService.setPin({ password, newPin });
      await c.reload();

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to save attendance PIN.",
      };
    } finally {
      setPinSetupSubmitting(false);
    }
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
          updated backend. Run the database migration, then restart the
          backend.
        </div>
      )}

      {needsPin ? (
        <div className="mx-auto max-w-md">
          <PinPanel
            disabled={loading}
            submitting={pinSetupSubmitting}
            onSetPin={handleSetPin}
          />
        </div>
      ) : (
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
          <div className="mt-5 flex min-w-0 flex-col gap-4 lg:mt-0">
            <AssignedShiftCard shift={shifts} loading={loading} />

            <WorkTimerCard sessions={sessions} state={state} now={now} />

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

            {state === "in" && (
              <ClockOutReport
                tasks={tasks}
                selected={tickedIds}
                onChange={setDoneIds}
                description={description}
                onDescription={setDescription}
              />
            )}

            <SessionsCard sessions={sessions} now={now} loading={loading} />

            {Array.isArray(tasks) && tasks.length > 0 && (
              <TaskAssignToday tasks={tasks} loading={loading} />
            )}
          </div>
        </div>
      )}

      {/* EVERYBODY'S CLOCK IN / CLOCK OUT, LIVE */}
      <TeamTodayPanel />

      {forgotOpen && (
        <ForgotPinModal
          defaultEmail={c.me?.email || ""}
          onClose={() => setForgotOpen(false)}
        />
      )}
    </div>
  );
};

export default MyClockIn;