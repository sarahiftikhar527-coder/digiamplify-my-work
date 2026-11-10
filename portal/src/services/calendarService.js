import apiClient, { unwrap } from './api/apiClient';
import meetingsService from './meetingsService';
import { meetingToCalendarEvent, meetingToDayItem } from '../modules/meetings/utils';

const getRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.tasks)) return response.tasks;
  if (Array.isArray(response?.events)) return response.events;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.leaves)) return response.leaves;
  if (Array.isArray(response?.requests)) return response.requests;
  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.employees)) return response.employees;
  return [];
};

const getRecordId = (record) => record?._id || record?.id || '';

const formatDate = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const formatTime = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = value.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];

    if (/^\d{2}:\d{2}/.test(value)) {
      return value.slice(0, 5);
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
};

const normalizeEvent = (record = {}) => {
  const from = formatDate(
    record.from || record.date || record.startDate
  );

  const to = formatDate(
    record.to ||
      record.endDate ||
      record.from ||
      record.date ||
      record.startDate
  );

  const employee =
    record.employeeId && typeof record.employeeId === 'object'
      ? record.employeeId
      : null;

  return {
    ...record,
    id: getRecordId(record),
    employeeId: employee?._id || record.employeeId || '',
    employeeName:
      record.employeeName ||
      employee?.name ||
      record.employee?.name ||
      '',
    date: from,
    from,
    to,
    startDate: from,
    endDate: to,
    title:
      record.title ||
      record.subject ||
      record.shiftName ||
      record.leaveType ||
      record.eventType ||
      'Calendar event',
    type: record.eventType || record.type || 'event',
    status: String(record.status || 'pending').toLowerCase(),
    leaveType: record.leaveType || '',
    approverIds: Array.isArray(record.approverIds)
      ? record.approverIds.map((approver) =>
          typeof approver === 'object'
            ? approver?._id || approver?.id || ''
            : approver
        )
      : [],
  };
};

const normalizeApprover = (record = {}) => {
  const id = getRecordId(record);

  return {
    id,
    _id: id,
    name:
      record.name ||
      record.fullName ||
      record.username ||
      'Unknown user',
    email: record.email || '',
    role:
      typeof record.role === 'object'
        ? record.role?.name ||
          record.role?.title ||
          record.role?.roleName ||
          ''
        : record.role || '',
  };
};

const request = async (promise) => {
  const response = await promise;
  return unwrap(response);
};

const getCalendarRecords = async (params = {}) => {
  const response = await request(
    apiClient.get('/calendar', { params })
  );

  return getRows(response).map(normalizeEvent);
};

const overlapsDate = (record, date) =>
  Boolean(
    record.from &&
      record.to &&
      record.from <= date &&
      record.to >= date
  );

const isCancelled = (status) =>
  ['cancelled', 'rejected'].includes(
    String(status || '').toLowerCase()
  );

// Meetings must never break the rest of the calendar if that request fails.
const getMeetingsSafely = async (from, to) => {
  try {
    const params = { scope: 'mine' };
    if (from) params.from = new Date(`${from}T00:00:00`).toISOString();
    if (to) params.to = new Date(`${to}T23:59:59`).toISOString();
    return await meetingsService.list(params);
  } catch (error) {
    console.warn('Unable to load meetings:', error?.message || error);
    return [];
  }
};

export const calendarService = {
  async getEvents({ from, to } = {}) {
    const params = {};

    if (from) params.from = from;
    if (to) params.to = to;

    const [records, meetings] = await Promise.all([
      getCalendarRecords(params),
      getMeetingsSafely(from, to),
    ]);

    return [...records, ...meetings.map(meetingToCalendarEvent)];
  },

  async getDaySchedule(date) {
    if (!date) {
      throw new Error('A date is required to load the daily schedule.');
    }

    const [records, meetings] = await Promise.all([
      getCalendarRecords({ from: date, to: date }),
      getMeetingsSafely(date, date),
    ]);

    const shifts = records.filter(
      (record) =>
        record.type === 'shift' &&
        overlapsDate(record, date) &&
        !isCancelled(record.status)
    );

    const attendance = records.find(
      (record) =>
        record.type === 'attendance' &&
        record.from === date
    );

    const taskItems = records
      .filter(
        (record) =>
          record.type === 'task' &&
          overlapsDate(record, date) &&
          !isCancelled(record.status)
      )
      .map((record) => ({
        id: record.id,
        type: record.type,
        title: record.title,
        start: record.startTime || '',
        end: record.endTime || '',
        place: record.description || '',
        attendees: null,
      }));

    const meetingItems = meetings
      .filter((meeting) => !isCancelled(meeting.status))
      .map(meetingToDayItem);

    const items = [...taskItems, ...meetingItems]
      .filter((item) => item.start)
      .sort((a, b) => a.start.localeCompare(b.start));

    const shift = shifts[0];

    return {
      date,
      shift: shift
        ? {
            start: shift.startTime || '',
            end: shift.endTime || '',
          }
        : null,
      breakTime: shift?.breakTime || null,
      clockIn: attendance?.clockIn
        ? {
            time: formatTime(attendance.clockIn),
            status: attendance.status || '',
          }
        : null,
      clockOut: attendance?.clockOut
        ? {
            time: formatTime(attendance.clockOut),
            status: attendance.status || '',
          }
        : null,
      items,
    };
  },

  async getUpcomingTasks() {
    const today = formatDate(new Date());

    const response = await request(
      apiClient.get('/tasks/employee')
    );

    return getRows(response)
      .map((task) => ({
        id: getRecordId(task),
        title:
          task.title ||
          task.subject ||
          task.name ||
          'Untitled task',
        date: formatDate(
          task.dueDate || task.date || task.from
        ),
        status: String(task.status || 'pending').toLowerCase(),
        isNew: false,
      }))
      .filter(
        (task) =>
          task.id &&
          task.date &&
          task.date >= today &&
          !['cancelled', 'rejected', 'completed', 'approved'].includes(
            task.status
          )
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async getAbsenteeism() {
    const today = formatDate(new Date());

    const records = await getCalendarRecords({
      from: today,
      to: today,
      eventType: 'attendance',
    });

    const absent = records.filter(
      (record) => record.status === 'absent'
    ).length;

    return {
      absent,
      total: records.length,
    };
  },

  async getLeaveRequests() {
    const records = await getCalendarRecords({
      eventType: 'leave',
    });

    return records
      .map((record) => ({
        ...record,
        type: record.leaveType || 'Leave',
        subject: record.title || 'Leave request',
        startDate: record.from,
        endDate: record.to,
      }))
      .sort((a, b) =>
        b.startDate.localeCompare(a.startDate)
      );
  },

  async searchApprovers(query = '') {
    const response = await request(
      apiClient.get('/calendar/approvers', {
        params: { q: query.trim() },
      })
    );

    return getRows(response)
      .map(normalizeApprover)
      .filter(
        (approver) =>
          approver.id && approver.name !== 'Unknown user'
      );
  },

  async createLeaveRequest(payload) {
    if (!payload?.startDate || !payload?.endDate) {
      throw new Error('Please select the leave start and end dates.');
    }

    if (payload.endDate < payload.startDate) {
      throw new Error('End date must be on or after the start date.');
    }

    if (!payload.subject?.trim()) {
      throw new Error('Please enter a leave subject.');
    }

    if (!payload.description?.trim()) {
      throw new Error('Please enter a leave description.');
    }

    if (
      !Array.isArray(payload.approverIds) ||
      payload.approverIds.length === 0
    ) {
      throw new Error('Please select at least one approver.');
    }

    const formData = new FormData();

    formData.append('eventType', 'leave');
    formData.append('title', payload.subject.trim());
    formData.append('from', payload.startDate);
    formData.append('to', payload.endDate);
    formData.append('status', 'pending');
    formData.append('description', payload.description.trim());
    formData.append('leaveType', payload.leaveType || 'Sick');

    formData.append(
      'approverIds',
      JSON.stringify(payload.approverIds)
    );

    (payload.attachments || []).forEach((file) => {
      if (typeof File !== 'undefined' && file instanceof File) {
        formData.append('attachments', file);
      }
    });

    const response = await request(
      apiClient.post('/calendar', formData)
    );

    return normalizeEvent(response?.data || response);
  },

  async updateLeaveStatus(id, status) {
    if (!id) {
      throw new Error('Leave request ID is missing.');
    }

    const normalizedStatus = String(status || '').toLowerCase();

    if (!['approved', 'rejected'].includes(normalizedStatus)) {
      throw new Error('Status must be approved or rejected.');
    }

    const response = await request(
      apiClient.patch(`/calendar/${id}/status`, {
        status: normalizedStatus,
      })
    );

    return normalizeEvent(response?.data || response);
  },

  async saveAvailability(payload) {
    return request(
      apiClient.post('/availability', payload)
    );
  },
};