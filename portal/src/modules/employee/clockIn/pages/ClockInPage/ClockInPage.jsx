import { useState } from "react";

import useClockIn from "../../../../../hooks/useClockIn";
import useNow from "../../../../../hooks/useNow";

import {
  AssignedShiftCard,
  ClockOutDescription,
  ForgotPinModal,
  PinPad,
  TaskAssignToday,
  TodayStatusCard,
} from "../../components";

import {
  getStatus,
  getWorkedMinutes,
} from "../../../../../utils/time";

const ClockInPage = () => {
  const c = useClockIn();
  const now = useNow(c.offset);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [description, setDescription] = useState("");

  const { record, shift, shifts, tasks, loading, error } = c;

  // clock in nahi hua ya clock out ho chuka ho to "in", warna "out"
  const mode =
    !record?.clockInAt || record?.clockOutAt ? "in" : "out";

  const status = getStatus(now, shift, record);
  const worked = getWorkedMinutes(record, now);

  const ready = !loading && !error;

  // result return karna zaroori hai, PinPad isi se error/invalid pin dikhata hai
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

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">

        {/* LEFT SIDE */}
        <div className="min-w-0 lg:sticky lg:top-4">

          <PinPad
            key={mode}
            mode={mode}
            disabled={!ready}
            keyboard={!forgotOpen}
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

          <TodayStatusCard
            status={status}
            record={record}
            worked={worked}
            loading={loading}
          />

          {/* CLOCK OUT DESCRIPTION */}
          {mode === "out" && (
            <ClockOutDescription
              value={description}
              onChange={setDescription}
            />
          )}

          <TaskAssignToday
            tasks={tasks}
            loading={loading}
          />

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