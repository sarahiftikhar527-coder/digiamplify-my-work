
import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient, { unwrap } from "@/services/api/apiClient";
import { useAuth } from "@/context";
import meetingsService from "@/services/meetingsService";
import {
  AdminMeetingsBoard,
  useMeetingModals,
  toDateKey as meetingDateKey,
} from "../../../../meetings";

import CalendarToolbar from "../../components/CalendarToolbar.jsx";
import CalendarGrid from "../../components/CalendarGrid.jsx";
import HolidayApprovalList from "../../components/HolidayApprovalList.jsx";
import AdminLeaveRequests from "../../components/AdminLeaveRequests.jsx";
import TodaysAttendance from "../../components/TodaysAttendance.jsx";
import AssignShiftModal from "../../components/AssignShiftModal.jsx";

const isValidId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const formatKey = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const parseKey = (value) => {
  if (!value) return new Date();

  const parts = String(value).split("-").map(Number);

  if (
    parts.length !== 3 ||
    !parts[0] ||
    parts[1] < 1 ||
    parts[1] > 12 ||
    parts[2] < 1 ||
    parts[2] > 31
  ) {
    return new Date();
  }

  return new Date(parts[0], parts[1] - 1, parts[2]);
};

const eachDay = (from, to) => {
  if (!from || !to) return [];

  const start = parseKey(formatKey(from));
  const end = parseKey(formatKey(to));

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return [];
  }

  const days = [];

  while (start <= end) {
    days.push(formatKey(start));
    start.setDate(start.getDate() + 1);
  }

  return days;
};

const getResponseRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.events)) return response.events;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.shifts)) return response.shifts;

  return [];
};

const getEmployeeName = (event) => {
  const employee = event?.employeeId;

  if (employee && typeof employee === "object") {
    return (
      event.employeeName ||
      event.name ||
      employee.name ||
      employee.fullName ||
      employee.email ||
      event.title ||
      "Employee"
    );
  }

  return event?.employeeName || event?.name || event?.title || "Employee";
};

const getEmployeeRole = (event) => {
  const employee = event?.employeeId;

  if (employee && typeof employee === "object") {
    return (
      event.role ||
      employee.role ||
      employee.designation ||
      "Employee"
    );
  }

  return event?.role || event?.designation || "Employee";
};

const normalizeEvent = (event = {}) => {
  const from = formatKey(event.from || event.date || event.startDate);
  const to = formatKey(event.to || event.endDate || event.from || event.date);

  return {
    ...event,
    id: event._id || event.id || "",
    from,
    to,
    name: getEmployeeName(event),
    employeeName: getEmployeeName(event),
    role: getEmployeeRole(event),
    title: event.title || event.shiftName || event.eventType || "Calendar event",
    type: event.leaveType || event.title || event.eventType || "Leave",
    date: from,
    status: String(event.status || "pending").toLowerCase(),
    description: event.description || "",
    comment: event.comment || event.adminComment || "",
  };
};

const getVisibleRange = (cursor, view) => {
  let start;
  let end;

  if (view === "week") {
    const mondayOffset = (cursor.getDay() + 6) % 7;

    start = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate() - mondayOffset
    );

    end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 6
    );
  } else {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const sundayOffset = (lastDay.getDay() + 6) % 7;

    start = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth(),
      firstDay.getDate() - mondayOffset
    );

    end = new Date(
      lastDay.getFullYear(),
      lastDay.getMonth(),
      lastDay.getDate() + (6 - sundayOffset)
    );
  }

  return {
    from: formatKey(start),
    to: formatKey(end),
  };
};

const getEmployeeDetails = (employee) => {
  if (typeof employee === "string") {
    return {
      employeeId: isValidId(employee) ? employee : null,
      employeeName: isValidId(employee) ? "" : employee,
    };
  }

  const id =
    employee?._id ||
    employee?.id ||
    employee?.employeeId ||
    employee?.value ||
    null;

  return {
    employeeId: isValidId(id) ? id : null,
    employeeName:
      employee?.name ||
      employee?.fullName ||
      employee?.label ||
      employee?.employeeName ||
      employee?.email ||
      "",
  };
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getEventId = (event) => event?._id || event?.id || "";

export default function AdminCalendarPage() {
  const { user } = useAuth();
  const currentUserId = String(user?.id || user?._id || "");

  const [cursor, setCursor] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [view, setView] = useState("month");

  const [filters, setFilters] = useState({
    task: true,
    absent: true,
    weekend: true,
    event: true,
    holiday: true,
    meeting: true,
  });

  const [holidays, setHolidays] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingShift, setSavingShift] = useState(false);
  const [deletingShift, setDeletingShift] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const today = formatKey(new Date());

  const visibleRange = useMemo(
    () => getVisibleRange(cursor, view),
    [cursor, view]
  );

  const pendingHolidays = useMemo(
    () => holidays.filter((event) => event.status === "pending"),
    [holidays]
  );

  const approvedHolidays = useMemo(
    () => holidays.filter((event) => event.status === "approved"),
    [holidays]
  );

  const holidaysByDate = useMemo(() => {
    const map = {};

    approvedHolidays.forEach((holiday) => {
      eachDay(holiday.from, holiday.to).forEach((key) => {
        if (!map[key]) map[key] = [];

        map[key].push({
          ...holiday,
          title: holiday.title || "Holiday",
          sub: holiday.description || holiday.status || "",
        });
      });
    });

    return map;
  }, [approvedHolidays]);

  const leaveByDate = useMemo(() => {
    const map = {};

    leaveRequests
      .filter((request) => request.status === "approved")
      .forEach((request) => {
        eachDay(request.from, request.to).forEach((key) => {
          map[key] = (map[key] || 0) + 1;
        });
      });

    return map;
  }, [leaveRequests]);

  const shiftsByDate = useMemo(() => {
    const map = {};

    shifts
      .filter(
        (shift) =>
          !["cancelled", "rejected"].includes(shift.status) &&
          Boolean(getEventId(shift))
      )
      .forEach((shift) => {
        eachDay(shift.from, shift.to).forEach((key) => {
          if (!map[key]) map[key] = [];
          map[key].push(shift);
        });
      });

    return map;
  }, [shifts]);

  const attendanceByDate = useMemo(() => {
    const map = {};

    attendanceRecords.forEach((record) => {
      const key = formatKey(record.from || record.date || record.createdAt);

      if (!key) return;

      if (!map[key]) {
        map[key] = {
          count: 0,
          title: "Attendance",
          sub: "",
        };
      }

      map[key].count += 1;
      map[key].sub = `${map[key].count} Employee${
        map[key].count === 1 ? "" : "s"
      }`;
    });

    return map;
  }, [attendanceRecords]);

  const meetingsByDate = useMemo(() => {
    const map = {};

    meetings
      .filter((meeting) => meeting.status !== "cancelled")
      .forEach((meeting) => {
        const key = meetingDateKey(meeting.startAt);

        if (!map[key]) map[key] = [];
        map[key].push(meeting);
      });

    return map;
  }, [meetings]);

  const calendarData = useMemo(
    () => ({
      holidays: holidaysByDate,
      leaveByDate,
      shiftsByDate,
      attendanceByDate,
      meetingsByDate,
    }),
    [holidaysByDate, leaveByDate, shiftsByDate, attendanceByDate, meetingsByDate]
  );

  const loadCalendar = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const responses = await Promise.all([
          apiClient.get("/calendar", {
            params: {
              from: visibleRange.from,
              to: visibleRange.to,
              eventType: "holiday",
            },
            signal,
          }),
          apiClient.get("/calendar", {
            params: {
              from: visibleRange.from,
              to: visibleRange.to,
              eventType: "leave",
            },
            signal,
          }),
          apiClient.get("/calendar", {
            params: {
              from: visibleRange.from,
              to: visibleRange.to,
              eventType: "shift",
            },
            signal,
          }),
          apiClient.get("/calendar", {
            params: {
              from: today,
              to: today,
              eventType: "attendance",
            },
            signal,
          }),
        ]);

        if (signal?.aborted) return;

        // Meetings must never break the rest of the calendar if they fail.
        let meetingRows = [];

        try {
          meetingRows = await meetingsService.list({
            from: new Date(`${visibleRange.from}T00:00:00`).toISOString(),
            to: new Date(`${visibleRange.to}T23:59:59`).toISOString(),
            scope: "all",
          });
        } catch (meetingError) {
          console.warn("Unable to load meetings:", meetingError?.message || meetingError);
        }

        if (signal?.aborted) return;

        const [
          holidayResponse,
          leaveResponse,
          shiftResponse,
          attendanceResponse,
        ] = await Promise.all(responses.map((response) => unwrap(response)));

        if (signal?.aborted) return;

        setHolidays(
          getResponseRows(holidayResponse).map(normalizeEvent)
        );

        setLeaveRequests(
          getResponseRows(leaveResponse).map(normalizeEvent)
        );

        setShifts(
          getResponseRows(shiftResponse).map(normalizeEvent)
        );

        setAttendanceRecords(
          getResponseRows(attendanceResponse).map(normalizeEvent)
        );

        setMeetings(meetingRows);
      } catch (err) {
        if (
          signal?.aborted ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        ) {
          return;
        }

        setError(getErrorMessage(err, "Unable to load calendar data."));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [visibleRange.from, visibleRange.to, today]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadCalendar(controller.signal);

    return () => controller.abort();
  }, [loadCalendar, reloadKey]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(""), 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  const refreshCalendar = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const step = useCallback(
    (direction) => {
      setCursor((current) => {
        if (view === "week") {
          return new Date(
            current.getFullYear(),
            current.getMonth(),
            current.getDate() + direction * 7
          );
        }

        return new Date(
          current.getFullYear(),
          current.getMonth() + direction,
          1
        );
      });
    },
    [view]
  );

  const pickMonth = useCallback((value) => {
    if (!value) return;

    const [year, month] = value.split("-").map(Number);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return;
    }

    setCursor(new Date(year, month - 1, 1));
  }, []);

  const changeView = useCallback(
    (nextView) => {
      if (!["month", "week"].includes(nextView)) return;

      setView(nextView);

      if (nextView === "week" && selectedKey) {
        setCursor(parseKey(selectedKey));
      }
    },
    [selectedKey]
  );

  const toggleFilter = useCallback((id) => {
    setFilters((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }, []);

  const updateRequestStatus = useCallback(
    async (request, status, comment = "") => {
      const id = getEventId(request);

      if (!id) {
        const message = "Cannot update this request: request ID is missing.";
        setToast(message);
        throw new Error(message);
      }

      if (!["approved", "rejected"].includes(status)) {
        throw new Error("Invalid leave request status.");
      }

      if (!comment.trim()) {
        const message = "Please enter an admin comment.";
        setToast(message);
        throw new Error(message);
      }

      try {
        await unwrap(
          apiClient.patch(`/calendar/${id}/status`, {
            status,
            comment: comment.trim(),
          })
        );

        setToast(
          status === "approved"
            ? `Approved request for ${request.employeeName || request.name || "employee"}.`
            : `Rejected request for ${request.employeeName || request.name || "employee"}.`
        );

        refreshCalendar();
      } catch (err) {
        setToast(
          getErrorMessage(
            err,
            status === "approved"
              ? "Unable to approve this leave request."
              : "Unable to reject this leave request."
          )
        );

        throw err;
      }
    },
    [refreshCalendar]
  );

  const approve = useCallback(
    async (request, comment = "") => {
      await updateRequestStatus(request, "approved", comment);
    },
    [updateRequestStatus]
  );

  const reject = useCallback(
    async (request, comment = "") => {
      await updateRequestStatus(request, "rejected", comment);
    },
    [updateRequestStatus]
  );

  const jumpToRequest = useCallback((request) => {
    if (!request?.from) return;

    setCursor(parseKey(request.from));
    setSelectedKey(formatKey(request.from));
  }, []);

  const openAssignModal = useCallback(() => {
    setSelectedShift(null);
    setModalOpen(true);
  }, []);

  const openShiftDetails = useCallback((shift) => {
    if (!shift || !getEventId(shift)) {
      setToast("Unable to open shift details: shift ID is missing.");
      return;
    }

    setSelectedShift(shift);
    setSelectedKey(formatKey(shift.from || shift.date));
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (savingShift || deletingShift) return;

    setModalOpen(false);
    setSelectedShift(null);
  }, [savingShift, deletingShift]);

  const saveShift = useCallback(
    async (shift) => {
      if (savingShift) return;

      const isEditing = Boolean(selectedShift);
      const shiftId = getEventId(selectedShift);

      if (isEditing && !shiftId) {
        const message = "Cannot update this shift because its ID is missing.";
        setToast(message);
        throw new Error(message);
      }

      const from = formatKey(shift.from || selectedShift?.from);
      const to = formatKey(shift.to || selectedShift?.to);

      if (!from || !to) {
        const message = "Please select the shift start and end dates.";
        setToast(message);
        throw new Error(message);
      }

      if (parseKey(from) > parseKey(to)) {
        const message = "The shift start date cannot be after its end date.";
        setToast(message);
        throw new Error(message);
      }

      const submittedEmployees = Array.isArray(shift.employees)
        ? shift.employees
        : [];

      const employees = isEditing
        ? [
            submittedEmployees[0] ||
              shift.employeeId ||
              selectedShift.employeeId ||
              {
                _id: selectedShift.employeeId,
                name: selectedShift.employeeName || selectedShift.name || "",
              },
          ]
        : submittedEmployees;

      if (!employees.length) {
        const message = "Please select at least one employee.";
        setToast(message);
        throw new Error(message);
      }

      const payloads = employees.map((employee) => {
        const details = getEmployeeDetails(employee);

        if (!details.employeeId) {
          throw new Error(
            `A valid employee ID is missing for ${
              details.employeeName || "a selected employee"
            }.`
          );
        }

        return {
          eventType: "shift",
          title:
            shift.title ||
            shift.shiftName ||
            shift.shift ||
            shift.preset ||
            selectedShift?.title ||
            "Assigned Shift",
          employeeId: details.employeeId,
          employeeName:
            details.employeeName ||
            selectedShift?.employeeName ||
            selectedShift?.name ||
            "",
          from,
          to,
          startTime:
            shift.startTime ||
            shift.start ||
            selectedShift?.startTime ||
            "",
          endTime:
            shift.endTime ||
            shift.end ||
            selectedShift?.endTime ||
            "",
          status: shift.status || selectedShift?.status || "scheduled",
          description: shift.description ?? selectedShift?.description ?? "",
        };
      });

      setSavingShift(true);

      try {
        if (isEditing) {
          await unwrap(
            apiClient.patch(`/calendar/${shiftId}`, payloads[0])
          );

          setToast("Shift updated successfully.");
        } else {
          await Promise.all(
            payloads.map((payload) =>
              unwrap(apiClient.post("/calendar", payload))
            )
          );

          setToast(
            `Shift assigned to ${employees.length} employee${
              employees.length === 1 ? "" : "s"
            }.`
          );
        }

        setModalOpen(false);
        setSelectedShift(null);
        setSelectedKey(from);
        setCursor(parseKey(from));
        refreshCalendar();
      } catch (err) {
        setToast(
          getErrorMessage(
            err,
            isEditing
              ? "Unable to update the shift."
              : "Unable to assign the shift. Please try again."
          )
        );

        throw err;
      } finally {
        setSavingShift(false);
      }
    },
    [selectedShift, savingShift, refreshCalendar]
  );

  const deleteShift = useCallback(
    async (shiftToDelete) => {
      if (deletingShift) return;

      const target = shiftToDelete || selectedShift;
      const id = getEventId(target);

      if (!id) {
        const message = "Cannot delete this shift because its ID is missing.";
        setToast(message);
        throw new Error(message);
      }

      const confirmed = window.confirm(
        `Delete the shift for ${getEmployeeName(target)}? This action cannot be undone.`
      );

      if (!confirmed) return;

      setDeletingShift(true);

      try {
        await unwrap(apiClient.delete(`/calendar/${id}`));

        setModalOpen(false);
        setSelectedShift(null);
        setToast("Shift deleted successfully.");
        refreshCalendar();
      } catch (err) {
        setToast(getErrorMessage(err, "Unable to delete the shift."));
        throw err;
      } finally {
        setDeletingShift(false);
      }
    },
    [selectedShift, deletingShift, refreshCalendar]
  );

  const meetingModals = useMeetingModals({
    currentUserId,
    onToast: setToast,
    onChanged: refreshCalendar,
  });

  const todayAttendance = useMemo(
    () =>
      attendanceRecords.map((record) => ({
        ...record,
        id: record.id || record._id,
        name: getEmployeeName(record),
        clockIn:
          record.clockIn ||
          record.checkIn ||
          record.checkInTime ||
          "",
        clockOut:
          record.clockOut ||
          record.checkOut ||
          record.checkOutTime ||
          "",
        worked:
          record.worked ??
          record.workedHours ??
          record.totalHours ??
          "",
      })),
    [attendanceRecords]
  );

  return (
    <div className="min-h-screen bg-black p-4 font-['Poppins',sans-serif] text-white sm:p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Calendar</h1>

        <p className="mt-1 text-xs text-neutral-300 sm:text-sm">
          Manage holidays, requests and approvals
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={refreshCalendar}
            className="rounded border border-red-800 px-3 py-1.5 hover:bg-red-900/40"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-3 rounded-lg border border-[#232323] bg-[#0a0a0a] p-3 sm:p-4">
          <CalendarToolbar
            cursor={cursor}
            view={view}
            filters={filters}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            onPickMonth={pickMonth}
            onViewChange={changeView}
            onToggleFilter={toggleFilter}
            onAssign={openAssignModal}
          />

          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-neutral-400">
              Loading calendar data...
            </div>
          ) : (
            <CalendarGrid
              cursor={cursor}
              view={view}
              filters={filters}
              data={calendarData}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              onShiftSelect={openShiftDetails}
              onMeetingSelect={meetingModals.openDetails}
            />
          )}
        </section>

        <aside className="grid content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          <HolidayApprovalList
            requests={pendingHolidays}
            onApprove={approve}
            onReject={reject}
            loading={loading}
          />

          <AdminLeaveRequests
            requests={leaveRequests}
            onSelect={jumpToRequest}
            onApprove={approve}
            onCancel={reject}
            loading={loading}
          />
        </aside>
      </div>

      <section className="mt-4">
        <TodaysAttendance records={todayAttendance} loading={loading} />
      </section>

      <section className="mt-4">
        <AdminMeetingsBoard
          refreshKey={reloadKey}
          onOpen={meetingModals.openDetails}
          onSchedule={() =>
            meetingModals.openCreate(selectedKey || formatKey(cursor))
          }
        />
      </section>

      {meetingModals.modals}

      {modalOpen && (
        <AssignShiftModal
          open={modalOpen}
          defaultDate={selectedKey || formatKey(cursor)}
          initialShift={selectedShift}
          mode={selectedShift ? "details" : "create"}
          onClose={closeModal}
          onSave={saveShift}
          onDelete={deleteShift}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] rounded border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}