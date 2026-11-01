import { useCallback, useEffect, useState } from 'react';
import { calendarService } from '../services/calendarService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Something went wrong while loading calendar data.';

function useAsync(loader, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: '',
  });

  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      setState((current) => ({
        ...current,
        loading: true,
        error: '',
      }));

      try {
        const data = await loader();

        if (alive) {
          setState({
            data,
            loading: false,
            error: '',
          });
        }
      } catch (error) {
        if (alive) {
          setState((current) => ({
            ...current,
            loading: false,
            error: getErrorMessage(error),
          }));
        }
      }
    };

    loadData();

    return () => {
      alive = false;
    };
  }, [...deps, tick]);

  const reload = useCallback(() => {
    setTick((current) => current + 1);
  }, []);

  return {
    ...state,
    reload,
  };
}

export const useEvents = (from, to, version = 0) =>
  useAsync(
    () => calendarService.getEvents({ from, to }),
    [from, to, version]
  );

export const useDaySchedule = (iso, enabled, version = 0) =>
  useAsync(
    () =>
      enabled
        ? calendarService.getDaySchedule(iso)
        : Promise.resolve(null),
    [iso, enabled, version]
  );

export const useUpcomingTasks = () =>
  useAsync(
    () => calendarService.getUpcomingTasks(),
    []
  );

export const useAbsenteeism = () =>
  useAsync(
    () => calendarService.getAbsenteeism(),
    []
  );

export const useLeaveRequests = () =>
  useAsync(
    () => calendarService.getLeaveRequests(),
    []
  );