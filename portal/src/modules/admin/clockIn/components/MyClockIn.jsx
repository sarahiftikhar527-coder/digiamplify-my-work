import { useEffect, useState } from "react";

import ClockInHeader from "./ClockInHeader";
import ClockPanel from "./ClockPanel";
import PinPanel from "./PinPanel";
import BreakCard from "../../../employee/clockIn/components/BreakCard/BreakCard";
import SessionsCard from "../../../employee/clockIn/components/SessionsCard/SessionsCard";
import WorkTimerCard from "../../../employee/clockIn/components/WorkTimerCard/WorkTimerCard";

import useMyAttendance from "../../../../hooks/useMyAttendance";
import { clockInService } from "../../../../services/clockInService.js";
import {
  getDayTotals,
  getOpenBreak,
} from "../../../../utils/attendanceSessions";

const useTicker = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
};

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const MyClockIn = ({ onViewAttendance }) => {
  const now = useTicker();
  const a = useMyAttendance();

  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getLocalDate());
  const [pinSetupSubmitting, setPinSetupSubmitting] = useState(false);
  const [pinSetupError, setPinSetupError] = useState("");

  const {
    record,
    shift,
    recent,
    sessions,
    state,
    loading,
    submitting,
    error,
    reload,
    hasPin,
  } = a;

  // out = clock in, in/break = clock out
  const mode = hasPin === false ? "setup" : state === "out" ? "in" : "out";
  const onBreak = state === "break";

  const totals = getDayTotals(sessions, now);
  const worked = totals.workedMinutes;
  const openBreak = getOpenBreak(sessions);

  const handleSubmit = async (pin) => {
    if (!/^\d{4}$/.test(String(pin ?? ""))) {
      return { ok: false, error: "Please enter your 4-digit PIN." };
    }

    if (mode === "in") return a.clockIn(pin);

    const result = await a.clockOut(pin, description.trim());

    if (result?.ok) setDescription("");

    return result;
  };

  const handleSetPin = async (password, newPin) => {
    setPinSetupError("");
    setPinSetupSubmitting(true);

    try {
      await clockInService.setPin({ password, newPin });

      if (typeof reload === "function") {
        await reload();
      }

      return { ok: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save attendance PIN.";

      setPinSetupError(message);
      return { ok: false, error: message };
    } finally {
      setPinSetupSubmitting(false);
    }
  };

  const handleExport = () => {
    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const statusText =
      state === "break"
        ? "On break"
        : state === "in"
          ? "Working"
          : record?.clockInAt
            ? "Completed"
            : "Not clocked in";

    const rows = [
      [
        "Date",
        "First Clock In",
        "Last Clock Out",
        "Clock Ins",
        "Breaks",
        "Break Minutes",
        "Worked Minutes",
        "Status",
        "Description",
      ],
      [
        record?.dateKey || date,
        record?.clockInAt ? new Date(record.clockInAt).toLocaleString() : "",
        record?.clockOutAt ? new Date(record.clockOutAt).toLocaleString() : "",
        totals.clockIns,
        totals.breakCount,
        totals.breakMinutes,
        worked,
        statusText,
        record?.description || description,
      ],
    ];

    const csv = rows
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${date}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <ClockInHeader
        date={date}
        onDateChange={setDate}
        onExport={handleExport}
        onBack={onViewAttendance}
      />

      {(error || pinSetupError) && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-3 text-[12px] text-red-300">
          <span>{pinSetupError || error}</span>

          <button
            type="button"
            onClick={() => {
              setPinSetupError("");
              reload?.();
            }}
            className="shrink-0 font-semibold hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!error && !loading && a.backendOutdated && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-300">
          Backend update missing: breaks and multiple clock-ins need the
          updated backend. Run the database migration, then restart the backend.
        </div>
      )}

      {mode === "setup" ? (
        <div className="mx-auto max-w-md">
          <PinPanel
            mode="setup"
            disabled={loading}
            submitting={pinSetupSubmitting}
            onSetPin={handleSetPin}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
          <ClockPanel
            now={now}
            mode={mode}
            shift={shift}
            record={record}
            worked={worked}
            recent={recent}
            loading={loading}
          />

          <div className="flex min-w-0 flex-col gap-4">
            <PinPanel
              key={`${mode}-${onBreak}`}
              mode={mode}
              worked={worked}
              disabled={loading || submitting || !!error || onBreak}
              submitting={submitting}
              keyboard={!onBreak}
              onSubmit={handleSubmit}
              description={description}
              onDescription={setDescription}
            />

            <WorkTimerCard sessions={sessions} state={state} now={now} />

            {state !== "out" && (
              <BreakCard
                state={state}
                openBreak={openBreak}
                now={now}
                busy={submitting}
                error=""
                onStart={a.startBreak}
                onEnd={a.endBreak}
              />
            )}

            <SessionsCard sessions={sessions} now={now} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClockIn;