import { useCallback, useEffect, useRef, useState } from "react";
import meetingsService, { meetingErrorMessage } from "@/services/meetingsService";

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function useLoader(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    Promise.resolve()
      .then(() => loaderRef.current())
      .then((data) => alive && setState({ data, loading: false, error: "" }))
      .catch((error) =>
        alive &&
        setState((s) => ({ ...s, loading: false, error: meetingErrorMessage(error, "Unable to load meetings.") }))
      );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export const useMeetings = (params, deps = []) =>
  useLoader(() => meetingsService.list(params), [JSON.stringify(params), ...deps]);

export const useMeetingSummary = (tzOffset, deps = []) =>
  useLoader(() => meetingsService.summary(tzOffset), [tzOffset, ...deps]);

export function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}