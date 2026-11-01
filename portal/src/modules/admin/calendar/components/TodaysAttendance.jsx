
import Avatar from './Avatar';
import { Clock3, Users, LoaderCircle } from 'lucide-react';

function formatTime(value) {
  if (!value) return '--';

  if (typeof value === 'string') {
    const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

    if (match) {
      const hours = Number(match[1]);
      const minutes = match[2];

      if (hours >= 0 && hours <= 23) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
      }
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatWorkedHours(value) {
  if (value === null || value === undefined || value === '') {
    return '--';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);

    if (minutes === 60) {
      return `${hours + 1}h`;
    }

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return String(value);
}

function getEmployeeName(record) {
  const employee = record.employeeId;

  if (employee && typeof employee === 'object') {
    return (
      record.name ||
      record.employeeName ||
      employee.name ||
      employee.fullName ||
      employee.email ||
      'Employee'
    );
  }

  return record.name || record.employeeName || 'Employee';
}

function getEmployeeId(record, index) {
  const employee = record.employeeId;

  return (
    record.id ||
    record._id ||
    (employee && typeof employee === 'object'
      ? employee._id || employee.id
      : employee) ||
    `${getEmployeeName(record)}-${index}`
  );
}

function getClockIn(record) {
  return record.clockIn || record.checkIn || record.checkInTime || record.inTime;
}

function getClockOut(record) {
  return record.clockOut || record.checkOut || record.checkOutTime || record.outTime;
}

function getWorked(record) {
  if (record.worked !== undefined && record.worked !== null) {
    return record.worked;
  }

  if (record.workedHours !== undefined && record.workedHours !== null) {
    return record.workedHours;
  }

  return record.totalHours;
}

export default function TodaysAttendance({
  records = [],
  loading = false,
}) {
  const attendanceRecords = Array.isArray(records) ? records : [];

  return (
    <section
      className="rounded-lg border border-[#232323] bg-[#0a0a0a] p-4"
      aria-labelledby="attendance-title"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="attendance-title"
          className="flex items-center gap-2 text-xs font-semibold text-white"
        >
          <Clock3 size={14} className="text-neutral-400" />
          Today&apos;s Attendance
        </h2>

        <span className="flex items-center gap-1.5 rounded-full border border-[#292929] bg-[#111111] px-2 py-1 text-[10px] text-neutral-300">
          <Users size={12} />
          {attendanceRecords.length}
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-24 items-center justify-center gap-2 text-xs text-neutral-400">
          <LoaderCircle size={16} className="animate-spin" />
          Loading attendance...
        </div>
      ) : attendanceRecords.length === 0 ? (
        <div className="flex min-h-24 flex-col items-center justify-center text-center">
          <Users size={22} className="mb-2 text-neutral-500" />
          <p className="text-xs text-neutral-300">
            No attendance records found for today.
          </p>
          <p className="mt-1 text-[10px] text-neutral-500">
            Records will appear here when attendance data is available.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {attendanceRecords.map((record, index) => {
            const name = getEmployeeName(record);
            const clockIn = getClockIn(record);
            const clockOut = getClockOut(record);
            const worked = getWorked(record);
            const hasClockedIn = Boolean(clockIn);
            const hasClockedOut = Boolean(clockOut);

            return (
              <li
                key={getEmployeeId(record, index)}
                className="min-w-0 rounded-lg border border-[#202020] bg-[#080808] p-3 text-[10px] leading-snug text-neutral-300 transition-colors hover:border-[#343434]"
              >
                <div className="mb-3 flex min-w-0 items-center gap-2">
                  <Avatar
                    name={name}
                    size="h-8 w-8"
                    online={hasClockedIn && !hasClockedOut}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[11px] font-medium text-white"
                      title={name}
                    >
                      {name}
                    </p>

                    <p
                      className={`mt-0.5 text-[9px] ${
                        hasClockedOut
                          ? 'text-emerald-400'
                          : hasClockedIn
                            ? 'text-sky-400'
                            : 'text-neutral-500'
                      }`}
                    >
                      {hasClockedOut
                        ? 'Checked out'
                        : hasClockedIn
                          ? 'Checked in'
                          : 'Not checked in'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-neutral-500">Clock In</span>
                    <span className="text-right text-neutral-200">
                      {formatTime(clockIn)}
                    </span>
                  </p>

                  <p className="flex items-center justify-between gap-2">
                    <span className="text-neutral-500">Clock Out</span>
                    <span className="text-right text-neutral-200">
                      {formatTime(clockOut)}
                    </span>
                  </p>

                  <div className="border-t border-[#202020] pt-1.5">
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-neutral-500">Worked Hours</span>
                      <span className="text-right font-medium text-white">
                        {formatWorkedHours(worked)}
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
