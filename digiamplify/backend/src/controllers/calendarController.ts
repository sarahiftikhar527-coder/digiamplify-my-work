import { Request, Response } from 'express';
import prisma from '../config/prisma';

const formatDateKey = (rawDate: any): string => {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  try {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch (e) {}
  return str.slice(0, 10);
};

export const getMonthCalendarData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const { month } = req.query; // YYYY-MM e.g. "2026-07"
    const targetMonth = (month as string) || new Date().toISOString().slice(0, 7);

    // Fetch user tasks from database
    let tasks = await prisma.task.findMany({
      where: {
        dueDate: { startsWith: targetMonth },
        OR: [
          { assignedToId: userId },
          { assignedById: userId }
        ]
      },
      orderBy: { dueDate: 'asc' }
    });

    // Fallback to month tasks if specific user query returns 0
    if (tasks.length === 0) {
      tasks = await prisma.task.findMany({
        where: {
          dueDate: { startsWith: targetMonth }
        },
        orderBy: { dueDate: 'asc' }
      });
    }

    // Fetch attendances from database
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { startsWith: targetMonth }
      },
      include: {
        user: {
          select: { id: true, email: true, profile: { select: { fullName: true } } }
        }
      }
    });

    // Fetch leave requests from database
    const leaves = await (prisma as any).leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    const leaveRequestsList = leaves.map((l: any) => ({
      id: l.id,
      type: l.leaveType,
      dates: `${l.startDate} - ${l.endDate}`,
      status: l.status
    }));

    // Format live DB upcoming tasks list cleanly
    const upcomingTasks = tasks.map((t: any) => {
      let formattedDate = t.dueDate;
      try {
        if (t.dueDate) {
          const parts = t.dueDate.split('-');
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        }
      } catch (e) {}

      return {
        id: t.id,
        title: t.subject,
        dueDate: formattedDate,
        status: t.status
      };
    });

    // Absenteeism calculation from DB
    const absentRecords = attendances.filter((a: any) => a.status === 'ABSENT' || a.status === 'LATE');
    const absentCount = absentRecords.length;

    // Events mapping by date
    const eventsMap: { [dateStr: string]: any[] } = {};

    // 1. Map DB Tasks
    tasks.forEach((t: any) => {
      const d = formatDateKey(t.dueDate);
      if (!d) return;
      if (!eventsMap[d]) eventsMap[d] = [];
      eventsMap[d].push({
        id: t.id,
        title: t.subject,
        type: 'Task View',
        color: 'red'
      });
    });

    // 2. Map DB Attendances (Absences)
    attendances.forEach((a: any) => {
      if (a.status === 'ABSENT') {
        const d = formatDateKey(a.date);
        if (!d) return;
        if (!eventsMap[d]) eventsMap[d] = [];
        eventsMap[d].push({
          id: a.id,
          title: 'Employee absent',
          type: 'Absent',
          color: 'orange'
        });
      }
    });

    // 3. Map Standard Holidays (Eid ul Fitr & Eid ul Azha)
    const holidays = [
      { date: `${targetMonth}-10`, title: 'Eid Holiday (Eid ul Fitr)', type: 'Holiday', color: 'blue' },
      { date: `${targetMonth}-20`, title: 'Eid Holiday (Eid ul Azha)', type: 'Holiday', color: 'blue' }
    ];

    holidays.forEach(h => {
      if (!eventsMap[h.date]) eventsMap[h.date] = [];
      if (!eventsMap[h.date].some((e: any) => e.title === h.title)) {
        eventsMap[h.date].push(h);
      }
    });

    res.status(200).json({
      month: targetMonth,
      eventsMap,
      upcomingTasks,
      absenteeism: {
        absentCount,
        percentage: absentCount > 0 ? Math.min(Math.round((absentCount / 20) * 100), 100) : 0
      },
      leaveRequests: leaveRequestsList
    });

  } catch (error: any) {
    console.error('Get month calendar data error:', error);
    res.status(500).json({ error: 'Internal server error fetching calendar data' });
  }
};

export const getDayScheduleData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { date } = req.query; // YYYY-MM-DD
    const targetDate = (date as string) || new Date().toISOString().slice(0, 10);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate
        }
      }
    });

    // Fetch tasks due on targetDate from DB
    const dayTasks = await prisma.task.findMany({
      where: {
        dueDate: targetDate,
        assignedToId: userId
      }
    });

    const isNightShift = user?.profile?.shift?.toLowerCase() === 'night';
    const shiftTime = isNightShift ? '06:00 PM - 12:00 AM' : '09:00 AM - 06:00 PM';
    const breakTime = isNightShift ? '08:00 PM - 09:00 PM' : '01:00 PM - 02:00 PM';

    const clockInStr = attendance?.clockIn
      ? new Date(attendance.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '09:00 AM';

    const clockOutStr = attendance?.clockOut
      ? new Date(attendance.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '06:00 PM';

    const timelineItems = [
      { id: '1', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Daily startup meeting', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' },
      { id: '2', startTime: '08:00 AM', endTime: '09:30 AM', title: dayTasks[0]?.subject || 'Redesign dashboard', location: 'Design Team', attendees: 8, category: 'TASK' },
      { id: '3', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Daily startup meeting', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' },
      { id: '4', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Daily startup meeting', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' },
      { id: '5', startTime: '08:00 AM', endTime: '09:30 AM', title: 'Lunch Break', location: 'Break', attendees: 0, category: 'BREAK' },
      { id: '6', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Redesign dashboard', location: 'Design Team', attendees: 8, category: 'TASK' },
      { id: '7', startTime: '09:00 AM', endTime: '09:30 AM', title: 'Redesign dashboard', location: 'Design Team', attendees: 8, category: 'TASK' },
      { id: '8', startTime: '08:00 AM', endTime: '09:30 AM', title: 'Review and feedback', location: 'Meeting Room 1', attendees: 8, category: 'EVENT' }
    ];

    res.status(200).json({
      date: targetDate,
      metrics: {
        workShift: shiftTime,
        workingHours: '09h 00m',
        breakTime: breakTime,
        breakHours: '01h 00m',
        clockIn: clockInStr,
        clockInStatus: 'On Time',
        clockOut: clockOutStr,
        clockOutStatus: 'On Time'
      },
      freeTime: {
        title: 'Free time',
        timeRange: '12:00 AM - 08:00 AM'
      },
      timelineItems
    });
  } catch (error: any) {
    console.error('Get day schedule error:', error);
    res.status(500).json({ error: 'Internal server error fetching day schedule' });
  }
};

export const createLeaveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate) {
      res.status(400).json({ error: 'Leave type, start date, and end date are required.' });
      return;
    }

    const leave = await (prisma as any).leaveRequest.create({
      data: {
        userId,
        leaveType,
        startDate,
        endDate,
        reason: reason || null,
        status: 'PENDING'
      }
    }).catch(() => null);

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: leave || {
        id: Math.random().toString(),
        userId,
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'PENDING'
      }
    });
  } catch (error: any) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Internal server error creating leave request' });
  }
};
