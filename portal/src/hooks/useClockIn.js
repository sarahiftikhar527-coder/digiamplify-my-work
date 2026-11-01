import { useCallback, useEffect, useMemo, useState } from "react";
import { clockInService } from "../services/clockInService.js";
import { CLOCKIN_CONFIG } from "../modules/employee/clockIn/clockIn.config.js";

export default function useClockIn() {
  const me = useMemo(() => CLOCKIN_CONFIG.getUser(), []);
  const [data, setData] = useState({
    user: null,
    shift: null,
    shifts: [],
    record: null,
    tasks: [],
  });
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await clockInService.getToday();

      // backend ab array bheje (res.shifts) ya purana single (res.shift), dono chalenge
      const shifts = Array.isArray(res.shifts)
        ? res.shifts
        : Array.isArray(res.shift)
          ? res.shift
          : res.shift
            ? [res.shift]
            : [];

      setData({
        user: res.user || null,
        shifts,
        // purane components (getStatus, TodayStatusCard) single shift use karte hain
        shift: (Array.isArray(res.shift) ? res.shift[0] : res.shift) || shifts[0] || null,
        record: res.record || null,
        tasks: res.tasks || [],
      });

      if (res.serverTime) setOffset(new Date(res.serverTime).getTime() - Date.now());
      setError("");
    } catch (e) {
      if (!silent) setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onVisible = () => document.visibilityState === "visible" && load(true);
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
        setData((d) => ({ ...d, record: res.record || res, tasks: res.tasks || d.tasks }));
        return { ok: true };
      } catch (e) {
        const code = e.data?.code;
        if (code === "ALREADY_CLOCKED_IN" || code === "ALREADY_CLOCKED_OUT") load(true);
        return { ok: false, error: e.message, invalidPin: code === "INVALID_PIN" };
      }
    },
    [load]
  );

  const clockIn = useCallback((pin) => perform(() => clockInService.clockIn({ pin })), [perform]);
  const clockOut = useCallback(
    (pin, description) => perform(() => clockInService.clockOut({ pin, description })),
    [perform]
  );

  return { me, ...data, offset, loading, error, reload: load, clockIn, clockOut };
}