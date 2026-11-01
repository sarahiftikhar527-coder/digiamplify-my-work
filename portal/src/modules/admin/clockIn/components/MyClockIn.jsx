
import { useEffect, useState } from "react";

import ClockInHeader from "./ClockInHeader";
import ClockPanel from "./ClockPanel";
import PinPanel from "./PinPanel";

import useMyAttendance from "../../../../hooks/useMyAttendance";
import { clockInService } from "../../../../services/clockInService.js";

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
    loading,
    submitting,
    error,
    reload,
    hasPin,
  } = a;

  const mode = hasPin === false
    ? "setup"
    : !record?.clockInAt
      ? "in"
      : !record?.clockOutAt
        ? "out"
        : "done";

  const worked = record?.clockInAt
    ? Math.max(
        0,
        Math.floor(
          (
            (record.clockOutAt
              ? new Date(record.clockOutAt)
              : now).getTime() -
            new Date(record.clockInAt).getTime()
          ) / 60000
        )
      )
    : 0;

  const handleSubmit = async (pin) => {
    if (!/^\d{4}$/.test(String(pin ?? ""))) {
      return { ok: false, error: "Please enter your 4-digit PIN." };
    }

    if (mode === "in") return a.clockIn(pin);
    if (mode === "out") return a.clockOut(pin, description.trim());

    return {
      ok: false,
      error: "You have already completed attendance for today.",
    };
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

    const rows = [
      ["Date", "Clock In", "Clock Out", "Worked Minutes", "Status", "Description"],
      [
        record?.dateKey || date,
        record?.clockInAt ? new Date(record.clockInAt).toLocaleString() : "",
        record?.clockOutAt ? new Date(record.clockOutAt).toLocaleString() : "",
        worked,
        mode === "done"
          ? "Completed"
          : mode === "out"
            ? "Working"
            : "Not clocked in",
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

          <PinPanel
            mode={mode}
            worked={worked}
            disabled={loading || submitting || !!error}
            submitting={submitting}
            keyboard
            onSubmit={handleSubmit}
            description={description}
            onDescription={setDescription}
          />
        </div>
      )}
    </div>
  );
};

export default MyClockIn;
