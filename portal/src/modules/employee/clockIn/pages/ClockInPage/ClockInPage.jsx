
import { useMemo, useState } from "react";

import useClockIn from "../../../../../hooks/useClockIn";
import useNow from "../../../../../hooks/useNow";

import {
  AssignedShiftCard,
  BreakCard,
  ClockOutReport,
  ForgotPinModal,
  HoursCard,
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

const getBreakSeconds = (item, now) => {
  if (!item?.startAt) {
    return Math.max(0, Number(item?.minutes || 0) * 60);
  }

  const start = new Date(item.startAt).getTime();
  const end = item.endAt
    ? new Date(item.endAt).getTime()
    : new Date(now).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return Math.max(0, Number(item.minutes || 0) * 60);
  }

  return Math.max(0, Math.floor((end - start) / 1000));
};

const ClockInPage = () => {
  const c = useClockIn();
  const now = useNow(c.offset);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [doneIds, setDoneIds] = useState([]);

  const {
    record,
    shifts,
    tasks,
    sessions,
    state,
    loading,
    error,
  } = c;

  const mode = state === "out" ? "in" : "out";
  const onBreak = state === "break";

  const status = getStatus(now, c.shift, record);
  const totals = getDayTotals(sessions, now);
  const openBreak = getOpenBreak(sessions);

  const todayHours = c.hours?.today || {};
  const schedule = c.hours?.schedule || {};

  const breakAllowanceMinutes =
    todayHours.breakAllowanceMinutes ??
    schedule.breakDurationMinutes ??
    null;

  const breaks = (sessions || []).flatMap((session) =>
    Array.isArray(session.breaks) ? session.breaks : []
  );

  const breakUsedSeconds = breaks.length
    ? breaks.reduce(
        (total, item) => total + getBreakSeconds(item, now),
        0
      )
    : Math.max(0, Number(totals.breakMinutes || 0) * 60);

  const breakUsedMinutes = Math.floor(breakUsedSeconds / 60);

  const breakRemainingMinutes =
    breakAllowanceMinutes !== null
      ? Math.max(
          0,
          Number(breakAllowanceMinutes) - breakUsedSeconds / 60
        )
      : null;

  const breakOverMinutes =
    breakAllowanceMinutes !== null
      ? Math.ceil(
          Math.max(
            0,
            breakUsedSeconds -
              Number(breakAllowanceMinutes) * 60
          ) / 60
        )
      : todayHours.breakOverMinutes ??
        totals.breakOverMinutes ??
        0;

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

    const result = await c.clockOut(
      pin,
      description.trim(),
      tickedIds
    );

    if (result?.ok) {
      setDescription("");
      setDoneIds([]);
    }

    return result;
  };

  const breakCard = state !== "out" && (
    <BreakCard
      state={state}
      openBreak={openBreak}
      now={now}
      busy={c.breakBusy}
      error={c.breakError}
      breakAllowanceMinutes={breakAllowanceMinutes}
      breakUsedMinutes={breakUsedMinutes}
      breakUsedSeconds={breakUsedSeconds}
      breakRemainingMinutes={breakRemainingMinutes}
      breakOverMinutes={breakOverMinutes}
      breaks={breaks}
      onStart={c.startBreak}
      onEnd={c.endBreak}
    />
  );

  return (
    <div className="w-full">
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

      {!error && !loading && c.backendOutdated && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-300">
          Backend update missing: breaks and multiple clock-ins need the
          updated backend. Run the database migration, then restart the backend.
        </div>
      )}

      {!error && !loading && state !== "in" && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[12px] text-white/70">
          {onBreak
            ? "You are on a break. End your break before you join a meeting."
            : "You must be clocked in to join meetings. Meeting time counts toward your working hours."}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <PinPad
            key={`${mode}-${onBreak}`}
            mode={mode}
            disabled={!ready || onBreak}
            keyboard={!forgotOpen && !onBreak}
            description={
              onBreak
                ? "End your break first, then clock out."
                : undefined
            }
            onSubmit={handleSubmit}
            onForgot={() => setForgotOpen(true)}
          />
        </div>

        <div className="mt-5 flex min-w-0 flex-col gap-4 lg:mt-0">
          {onBreak && breakCard}

          <AssignedShiftCard
            shift={shifts}
            loading={loading}
          />

          <HoursCard
            hours={c.hours}
            state={state}
            now={now}
            loading={loading}
          />

          <WorkTimerCard
            sessions={sessions}
            state={state}
            now={now}
          />

          {!onBreak && breakCard}

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

          <SessionsCard
            sessions={sessions}
            now={now}
            loading={loading}
          />

          <TaskAssignToday
            tasks={tasks}
            loading={loading}
          />

          <TeamAttendanceCard />
        </div>
      </div>

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
