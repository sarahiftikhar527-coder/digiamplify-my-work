import { useCallback, useEffect, useMemo, useState } from "react";
import { clockInService } from "../services/clockInService.js";
import { CLOCKIN_CONFIG } from "../modules/employee/clockIn/clockIn.config.js";

const RELOAD_CODES = [
  "ALREADY_CLOCKED_IN",
  "ALREADY_CLOCKED_OUT",
  "ALREADY_ON_BREAK",
  "NOT_ON_BREAK",
  "NOT_CLOCKED_IN",
];

export default function useClockIn() {
  const me = useMemo(() => CLOCKIN_CONFIG.getUser(), []);
  const [data, setData] = useState({
    user: null,
    shift: null,
    shifts: [],
    record: null,
    tasks: [],
    sessions: [],
    state: "out",
  });
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendOutdated, setBackendOutdated] = useState(false);
  const [breakBusy, setBreakBusy] = useState(false);
  const [breakError, setBreakError] = useState("");

  const applySnapshot = useCallback((res) => {
    const shifts = Array.isArray(res.shifts)
      ? res.shifts
      : Array.isArray(res.shift)
        ? res.shift
        : res.shift
          ? [res.shift]
          : [];

    // Backend purana ho to sessions nahi aate: banner dikhao
    const hasSessions = Array.isArray(res.sessions);
    setBackendOutdated(!hasSessions);

    const fallbackState =
      res.record?.clockInAt && !res.record?.clockOutAt ? "in" : "out";

    setData({
      user: res.user || null,
      shifts,
      shift:
        (Array.isArray(res.shift) ? res.shift[0] : res.shift) ||
        shifts[0] ||
        null,
      record: res.record || null,
      tasks: res.tasks || [],
      sessions: hasSessions ? res.sessions : [],
      state: res.state || fallbackState,
    });

    if (res.serverTime) {
      setOffset(new Date(res.serverTime).getTime() - Date.now());
    }
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);

      try {
        const res = await clockInService.getToday();
        applySnapshot(res);
        setError("");
      } catch (e) {
        if (!silent) setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [applySnapshot]
  );

  useEffect(() => {
    load();

    const onVisible = () =>
      document.visibilityState === "visible" && load(true);

    document.addEventListener("visibilitychange", onVisible);

    const t = setInterval(() => load(true), 5 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(t);
    };
  }, [load]);

  const perform = useCallback(
    async (fn) => {
      try {
        const res = await fn();

        if (res && typeof res === "object" && "serverTime" in res) {
          applySnapshot(res);
        } else {
          await load(true);
        }

        return { ok: true, message: res?.message };
      } catch (e) {
        // apiClient error mein code response.data.code mein hota hai
        const code = e.response?.data?.code || e.data?.code;

        if (RELOAD_CODES.includes(code)) load(true);

        return {
          ok: false,
          error: e.message,
          invalidPin: code === "INVALID_PIN",
        };
      }
    },
    [applySnapshot, load]
  );

  const clockIn = useCallback(
    (pin) => perform(() => clockInService.clockIn({ pin })),
    [perform]
  );

  const clockOut = useCallback(
    (pin, description) =>
      perform(() => clockInService.clockOut({ pin, description })),
    [perform]
  );

  const runBreak = useCallback(
    async (fn) => {
      setBreakBusy(true);
      setBreakError("");

      const result = await perform(fn);

      if (!result.ok) setBreakError(result.error);

      setBreakBusy(false);

      return result;
    },
    [perform]
  );

  const startBreak = useCallback(
    (type) => runBreak(() => clockInService.startBreak(type)),
    [runBreak]
  );

  const endBreak = useCallback(
    () => runBreak(() => clockInService.endBreak()),
    [runBreak]
  );

  return {
    me,
    ...data,
    offset,
    loading,
    error,
    backendOutdated,
    reload: load,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    breakBusy,
    breakError,
  };
}