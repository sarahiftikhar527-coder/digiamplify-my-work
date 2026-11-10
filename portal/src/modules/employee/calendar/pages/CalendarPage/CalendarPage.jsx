import { useCallback, useEffect, useMemo, useState } from 'react';
import CalendarHeader from '../../components/CalendarHeader';
import CalendarToolbar from '../../components/CalendarToolbar';
import CalendarLegend from '../../components/CalendarLegend';
import CalendarGrid from '../../components/CalendarGrid';
import CalendarDayView from '../../components/CalendarDayView';
import MiniCalendar from '../../components/MiniCalendar';
import UpcomingTaskList from '../../components/UpcomingTaskList';
import EmployeeAbsenteeismCard from '../../components/EmployeeAbsenteeismCard';
import LeaveRequestsList from '../../components/LeaveRequestsList';
import RequestLeaveButton from '../../components/RequestLeaveButton';
import RequestLeaveModal from '../../components/RequestLeaveModal';
import SetAvailabilityModal from '../../components/SetAvailabilityModal';
import { useAuth } from '@/context';
import { MeetingsPanel, useMeetingModals } from '../../../../meetings';
import { calendarService } from '../../../../../services/calendarService';
import {
  useAbsenteeism,
  useDaySchedule,
  useEvents,
  useLeaveRequests,
  useUpcomingTasks,
} from '../../../../../hooks/useCalendarData';
import {
  ALL_VISIBLE,
  addDays,
  addMonths,
  monthMatrix,
  rangeForView,
  startOfDay,
  toISO,
  weekDays,
} from '../../../../../utils/calendar';
import './calendar.css';

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export default function CalendarPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const { user } = useAuth();
  const currentUserId = String(user?.id || user?._id || '');

  const [cursor, setCursor] = useState(today);
  const [view, setView] = useState('month');
  const [backTo, setBackTo] = useState('month');
  const [visible, setVisible] = useState(ALL_VISIBLE);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const { from, to } = useMemo(
    () => rangeForView(view, cursor),
    [view, cursor]
  );

  const events = useEvents(from, to, version);
  const schedule = useDaySchedule(toISO(cursor), view === 'day', version);
  const tasks = useUpcomingTasks();
  const absent = useAbsenteeism();
  const leaves = useLeaveRequests();

  const eventsByDate = useMemo(() => {
    const records = Array.isArray(events.data) ? events.data : [];

    return records.reduce((acc, event) => {
      const rawDate =
        event?.date ??
        event?.from ??
        event?.startDate ??
        event?.start ??
        event?.startTime;

      if (!rawDate) return acc;

      const dateKey =
        rawDate instanceof Date
          ? toISO(rawDate)
          : String(rawDate).slice(0, 10);

      if (!dateKey) return acc;

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(event);

      return acc;
    }, {});
  }, [events.data]);

  const days = useMemo(
    () =>
      view === 'week'
        ? weekDays(cursor)
        : monthMatrix(cursor.getFullYear(), cursor.getMonth()).flat(),
    [view, cursor]
  );

  const meetings = useMeetingModals({
    currentUserId,
    onToast: setToast,
    onChanged: () => setVersion((current) => current + 1),
  });

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = setTimeout(() => {
      setToast('');
    }, 3200);

    return () => clearTimeout(timeout);
  }, [toast]);

  const step = useCallback(
    (direction) => {
      setCursor((current) =>
        view === 'month'
          ? addMonths(current, direction)
          : addDays(current, direction * (view === 'week' ? 7 : 1))
      );
    },
    [view]
  );

  const openDay = useCallback(
    (date) => {
      setBackTo((current) => (view === 'day' ? current : view));
      setCursor(startOfDay(date));
      setView('day');
    },
    [view]
  );

  const changeView = useCallback(
    (nextView) => {
      if (nextView === 'day') {
        openDay(cursor);
        return;
      }

      setView(nextView);
    },
    [cursor, openDay]
  );

  const toggleType = useCallback((key) => {
    setVisible((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  const showAbsentOnly = useCallback(() => {
    setVisible((current) => ({
      ...Object.fromEntries(
        Object.keys(current).map((key) => [key, false])
      ),
      absent: true,
      weekend: true,
    }));

    setView('month');
    setCursor(today);
    setToast(
      'Showing absent days only. Use the legend to show other calendar items.'
    );
  }, [today]);

  const retryEvents = useCallback(() => {
    if (typeof events.reload === 'function') {
      events.reload();
    }
  }, [events.reload]);

  const retrySchedule = useCallback(() => {
    if (typeof schedule.reload === 'function') {
      schedule.reload();
    }
  }, [schedule.reload]);

  const submitLeave = useCallback(
    async (payload) => {
      if (submittingLeave) return;

      setSubmittingLeave(true);

      try {
        await calendarService.createLeaveRequest(payload);

        if (typeof leaves.reload === 'function') {
          await leaves.reload();
        }

        setLeaveOpen(false);
        setToast('Leave request submitted successfully');
      } catch (error) {
        setToast(
          getErrorMessage(error, 'Unable to submit leave request')
        );
      } finally {
        setSubmittingLeave(false);
      }
    },
    [submittingLeave, leaves.reload]
  );

  const submitAvailability = useCallback(
    async (payload) => {
      if (savingAvailability) return;

      setSavingAvailability(true);

      try {
        await calendarService.saveAvailability(payload);

        setVersion((current) => current + 1);
        setAvailOpen(false);
        setToast('Availability saved successfully');
      } catch (error) {
        setToast(
          getErrorMessage(error, 'Unable to save availability')
        );
      } finally {
        setSavingAvailability(false);
      }
    },
    [savingAvailability]
  );

  return (
    <div className="cal-page">
      <CalendarHeader />

      <div className="cal-layout">
        <section className="cal-main" aria-label="Employee Calendar">
          {view === 'day' ? (
            <CalendarDayView
              date={cursor}
              schedule={schedule.data}
              loading={schedule.loading}
              error={schedule.error}
              onRetry={retrySchedule}
              events={eventsByDate[toISO(cursor)] || []}
              visible={visible}
              onToggle={toggleType}
              onBack={() => setView(backTo)}
              onPrev={() => step(-1)}
              onNext={() => step(1)}
              onOpenMeeting={meetings.openDetails}
              onScheduleMeeting={() => meetings.openCreate(toISO(cursor))}
            />
          ) : (
            <>
              <CalendarToolbar
                view={view}
                cursor={cursor}
                onPrev={() => step(-1)}
                onNext={() => step(1)}
                onPickMonth={setCursor}
                onViewChange={changeView}
                onSetAvailability={() => setAvailOpen(true)}
              />

              <CalendarLegend
                visible={visible}
                onToggle={toggleType}
              />

              {events.error && (
                <p className="cal-msg cal-msg--error" role="alert">
                  {typeof events.error === 'string'
                    ? events.error
                    : getErrorMessage(
                        events.error,
                        'Unable to load calendar events.'
                      )}{' '}
                  <button type="button" onClick={retryEvents}>
                    Retry
                  </button>
                </p>
              )}

              <CalendarGrid
                key={`${view}-${toISO(days[0] ?? cursor)}`}
                days={days}
                month={cursor.getMonth()}
                weekMode={view === 'week'}
                eventsByDate={eventsByDate}
                visible={visible}
                today={today}
                busy={events.loading}
                onSelectDay={openDay}
              />
            </>
          )}
        </section>

        <aside className="cal-side">
          <MiniCalendar
            today={today}
            version={version}
            onSelectDate={openDay}
          />

          <MeetingsPanel
            refreshKey={version}
            onSchedule={() => meetings.openCreate(toISO(cursor))}
            onOpen={meetings.openDetails}
            onChanged={() => setVersion((current) => current + 1)}
          />

          <UpcomingTaskList
            tasks={tasks.data}
            loading={tasks.loading}
            error={tasks.error}
            onRetry={tasks.reload}
          />

          <EmployeeAbsenteeismCard
            data={absent.data}
            loading={absent.loading}
            error={absent.error}
            onRetry={absent.reload}
            onViewDetail={showAbsentOnly}
          />

          <LeaveRequestsList
            requests={leaves.data}
            loading={leaves.loading}
            error={leaves.error}
            onRetry={leaves.reload}
            footer={
              <RequestLeaveButton
                onClick={() => setLeaveOpen(true)}
              />
            }
          />
        </aside>
      </div>

      {leaveOpen && (
        <RequestLeaveModal
          onClose={() => {
            if (!submittingLeave) {
              setLeaveOpen(false);
            }
          }}
          onSubmit={submitLeave}
          onSearchApprovers={calendarService.searchApprovers}
        />
      )}

      {availOpen && (
        <SetAvailabilityModal
          initialDate={cursor}
          onClose={() => {
            if (!savingAvailability) {
              setAvailOpen(false);
            }
          }}
          onSubmit={submitAvailability}
        />
      )}

      {meetings.modals}

      {toast && (
        <div className="cal-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}