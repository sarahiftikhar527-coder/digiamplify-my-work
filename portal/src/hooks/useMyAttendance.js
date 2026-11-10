import { useCallback, useEffect, useState } from "react";
import { clockInService } from "../services/clockInService.js";

export default function useMyAttendance() {
  const [record, setRecord] = useState(null);
  const [shift, setShift] = useState(null);
  const [recent, setRecent] = useState([]);
  const [hasPin, setHasPin] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [state, setState] = useState("out");
  const [backendOutdated, setBackendOutdated] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      const today = await clockInService.getToday();

      const hasSessions = Array.isArray(today?.sessions);

      setRecord(today?.record ?? null);
      setShift(today?.shift ?? null);
      setHasPin(today?.hasPin ?? false);
      setSessions(hasSessions ? today.sessions : []);
      setBackendOutdated(!hasSessions);
      setState(
        today?.state ||
          (today?.record?.clockInAt && !today?.record?.clockOutAt
            ? "in"
            : "out")
      );

      try {
        const history = await clockInService.getRecent();

        setRecent(
          Array.isArray(history)
            ? history
            : history?.items ?? []
        );
      } catch {
        setRecent([]);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Attendance could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const perform = useCallback(
    async (action) => {
      if (submitting) {
        return {
          ok: false,
          error: "Request already in progress.",
        };
      }

      setSubmitting(true);
      setError("");

      try {
        await action();
        await reload(true);

        return { ok: true };
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Attendance action failed.";

        setError(message);

        return {
          ok: false,
          error: message,
          invalidPin: err?.response?.data?.code === "INVALID_PIN",
        };
      } finally {
        setSubmitting(false);
      }
    },
    [reload, submitting]
  );

  const clockIn = useCallback(
    (pin) =>
      perform(() => clockInService.clockIn({ pin })),
    [perform]
  );

  const clockOut = useCallback(
    (pin, description = "") =>
      perform(() =>
        clockInService.clockOut({ pin, description })
      ),
    [perform]
  );

  const startBreak = useCallback(
    (type) => perform(() => clockInService.startBreak(type)),
    [perform]
  );

  const endBreak = useCallback(
    () => perform(() => clockInService.endBreak()),
    [perform]
  );

  return {
    record,
    shift,
    recent,
    hasPin,
    sessions,
    state,
    backendOutdated,
    loading,
    submitting,
    error,
    reload,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
  };
}