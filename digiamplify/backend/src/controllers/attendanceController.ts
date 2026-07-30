import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';

const getLocalDateString = (): string => {
  const localDate = new Date();
  const offset = localDate.getTimezoneOffset();
  const adjustedDate = new Date(localDate.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

const formatDuration = (totalMins: number): string => {
  if (totalMins <= 0) return '0h 0m';
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hrs}h ${mins}m`;
};

export const getTodayStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const todayStr = getLocalDateString();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            fullName: true,
            shift: true,
            department: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr
        }
      },
      include: {
        breaks: true
      }
    });

    let workedHours = '--h --m';
    let breakHours = '--h --m';
    let currentStatus = 'Absent';

    if (attendance) {
      const now = new Date();
      const clockInTime = new Date(attendance.clockIn!);
      const clockOutTime = attendance.clockOut ? new Date(attendance.clockOut) : null;

      let totalBreakMins = 0;
      let hasActiveBreak = false;

      if (attendance.breaks && attendance.breaks.length > 0) {
        attendance.breaks.forEach((b) => {
          const start = new Date(b.startTime);
          const end = b.endTime ? new Date(b.endTime) : now;
          if (!b.endTime) hasActiveBreak = true;

          const diffMs = end.getTime() - start.getTime();
          totalBreakMins += Math.floor(diffMs / 60000);
        });
      }

      breakHours = formatDuration(totalBreakMins);

      const endMarker = clockOutTime || now;
      const totalElapsedMs = endMarker.getTime() - clockInTime.getTime();
      const totalElapsedMins = Math.floor(totalElapsedMs / 60000);
      const activeWorkedMins = totalElapsedMins - totalBreakMins;

      workedHours = formatDuration(activeWorkedMins);

      if (clockOutTime) {
        currentStatus = 'Clocked Out';
      } else if (hasActiveBreak) {
        currentStatus = 'On Break';
      } else if (attendance.status === 'LATE') {
        currentStatus = `${attendance.lateDuration} Late`;
      } else {
        currentStatus = 'On Time';
      }
    }

    res.status(200).json({
      role: user.role,
      profile: user.profile,
      attendance,
      stats: {
        status: currentStatus,
        workedHours,
        breakHours
      }
    });
  } catch (error: any) {
    console.error('Get today status error:', error);
    res.status(500).json({ error: 'Internal server error fetching attendance status' });
  }
};

export const clockIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { pin } = req.body;

    if (!pin) {
      res.status(400).json({ error: 'PIN is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      res.status(400).json({ error: 'Invalid PIN code' });
      return;
    }

    const todayStr = getLocalDateString();

    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr
        }
      }
    });

    if (existing) {
      res.status(400).json({ error: 'You have already clocked in today' });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    const isNightShift = profile?.shift?.toLowerCase() === 'night';
    const now = new Date();

    const startOfShift = new Date(now);

    startOfShift.setHours(isNightShift ? 18 : 9, 0, 0, 0);

    let status = 'ON_TIME';
    let lateDuration = null;

    if (now.getTime() > startOfShift.getTime()) {
      const diffMs = now.getTime() - startOfShift.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > 0) {
        status = 'LATE';
        if (diffMins >= 60) {
          const hrs = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          lateDuration = `${hrs}h ${mins}m`;
        } else {
          lateDuration = `${diffMins}m`;
        }
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: todayStr,
        clockIn: now,
        status,
        lateDuration
      }
    });

    res.status(201).json({
      message: 'Clocked in successfully',
      attendance
    });
  } catch (error: any) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Internal server error during clock in' });
  }
};

export const clockOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { pin, description } = req.body;

    if (!pin) {
      res.status(400).json({ error: 'PIN is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      res.status(400).json({ error: 'Invalid PIN code' });
      return;
    }

    const todayStr = getLocalDateString();

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr
        }
      },
      include: {
        breaks: true
      }
    });

    if (!attendance) {
      res.status(400).json({ error: 'You must clock in first before clocking out' });
      return;
    }

    if (attendance.clockOut) {
      res.status(400).json({ error: 'You have already clocked out for today' });
      return;
    }

    const now = new Date();

    const activeBreak = attendance.breaks.find((b) => !b.endTime);
    if (activeBreak) {
      await prisma.break.update({
        where: { id: activeBreak.id },
        data: { endTime: now }
      });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: now,
        status: 'CLOCKED_OUT',
        description: description || null
      }
    });

    res.status(200).json({
      message: 'Clocked out successfully',
      attendance: updatedAttendance
    });
  } catch (error: any) {
    console.error('Clock out error:', error);
    res.status(500).json({ error: 'Internal server error during clock out' });
  }
};

export const startBreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const todayStr = getLocalDateString();

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr
        }
      },
      include: {
        breaks: true
      }
    });

    if (!attendance) {
      res.status(400).json({ error: 'You must clock in before starting a break' });
      return;
    }

    if (attendance.clockOut) {
      res.status(400).json({ error: 'Cannot start break after clocking out' });
      return;
    }

    const activeBreak = attendance.breaks.find((b) => !b.endTime);
    if (activeBreak) {
      res.status(400).json({ error: 'You are already on a break' });
      return;
    }

    const now = new Date();
    const newBreak = await prisma.break.create({
      data: {
        attendanceId: attendance.id,
        startTime: now
      }
    });

    res.status(201).json({
      message: 'Break started successfully',
      break: newBreak
    });
  } catch (error: any) {
    console.error('Start break error:', error);
    res.status(500).json({ error: 'Internal server error starting break' });
  }
};

export const endBreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const todayStr = getLocalDateString();

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr
        }
      },
      include: {
        breaks: true
      }
    });

    if (!attendance) {
      res.status(400).json({ error: 'Attendance record not found' });
      return;
    }

    const activeBreak = attendance.breaks.find((b) => !b.endTime);
    if (!activeBreak) {
      res.status(400).json({ error: 'No active break to resume from' });
      return;
    }

    const now = new Date();
    const endedBreak = await prisma.break.update({
      where: { id: activeBreak.id },
      data: {
        endTime: now
      }
    });

    res.status(200).json({
      message: 'Break ended successfully',
      break: endedBreak
    });
  } catch (error: any) {
    console.error('End break error:', error);
    res.status(500).json({ error: 'Internal server error ending break' });
  }
};

export const resetPin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { password, newPin } = req.body;

    if (!password || !newPin) {
      res.status(400).json({ error: 'Password and new PIN are required' });
      return;
    }

    if (typeof newPin !== 'string' || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      res.status(400).json({ error: 'PIN must be exactly 4 digits' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ error: 'Invalid account password' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(newPin, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { pin: hashedPin }
    });

    res.status(200).json({ message: 'PIN reset successfully' });
  } catch (error: any) {
    console.error('Reset PIN error:', error);
    res.status(500).json({ error: 'Internal server error resetting PIN' });
  }
};

export const getAdminTodayStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'Admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const todayStr = getLocalDateString();

    const employees = await prisma.user.findMany({
      where: {
        role: 'Employee',
        status: 'APPROVED'
      },
      include: {
        profile: {
          select: {
            fullName: true,
            shift: true,
            department: true
          }
        },
        attendances: {
          where: { date: todayStr },
          include: { breaks: true }
        }
      }
    });

    const now = new Date();

    const attendanceRecords = employees.map((emp) => {
      const todayAttendance = emp.attendances[0] || null;
      let workedHours = '--h --m';
      let breakHours = '--h --m';
      let currentStatus = 'Absent';
      let clockInTimeStr = '--:--';
      let clockOutTimeStr = '--:--';

      if (todayAttendance) {
        clockInTimeStr = new Date(todayAttendance.clockIn!).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        if (todayAttendance.clockOut) {
          clockOutTimeStr = new Date(todayAttendance.clockOut).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }

        const clockInTime = new Date(todayAttendance.clockIn!);
        const clockOutTime = todayAttendance.clockOut ? new Date(todayAttendance.clockOut) : null;

        let totalBreakMins = 0;
        let hasActiveBreak = false;

        if (todayAttendance.breaks && todayAttendance.breaks.length > 0) {
          todayAttendance.breaks.forEach((b) => {
            const start = new Date(b.startTime);
            const end = b.endTime ? new Date(b.endTime) : now;
            if (!b.endTime) hasActiveBreak = true;

            const diffMs = end.getTime() - start.getTime();
            totalBreakMins += Math.floor(diffMs / 60000);
          });
        }
        breakHours = formatDuration(totalBreakMins);

        const endMarker = clockOutTime || now;
        const totalElapsedMs = endMarker.getTime() - clockInTime.getTime();
        const totalElapsedMins = Math.floor(totalElapsedMs / 60000);
        const activeWorkedMins = totalElapsedMins - totalBreakMins;
        workedHours = formatDuration(activeWorkedMins);

        if (clockOutTime) {
          currentStatus = 'Clocked Out';
        } else if (hasActiveBreak) {
          currentStatus = 'On Break';
        } else if (todayAttendance.status === 'LATE') {
          currentStatus = `${todayAttendance.lateDuration} Late`;
        } else {
          currentStatus = 'On Time';
        }
      }

      return {
        userId: emp.id,
        fullName: emp.profile?.fullName || 'Unnamed Employee',
        department: emp.profile?.department || 'N/A',
        shift: emp.profile?.shift || 'Morning',
        email: emp.email,
        status: currentStatus,
        isLate: todayAttendance ? todayAttendance.status === 'LATE' : false,
        isOnTime: todayAttendance ? todayAttendance.status === 'ON_TIME' : false,
        clockIn: clockInTimeStr,
        clockOut: clockOutTimeStr,
        workedHours,
        breakHours,
        description: todayAttendance?.description || null
      };
    });

    const totalCount = attendanceRecords.length;
    const clockedInCount = attendanceRecords.filter((r) => r.status !== 'Absent').length;
    const onBreakCount = attendanceRecords.filter((r) => r.status === 'On Break').length;
    const clockedOutCount = attendanceRecords.filter((r) => r.status === 'Clocked Out').length;
    const onTimeCount = attendanceRecords.filter((r) => r.isOnTime).length;
    const lateCount = attendanceRecords.filter((r) => r.isLate).length;

    res.status(200).json({
      records: attendanceRecords,
      summary: {
        totalCount,
        clockedInCount,
        onBreakCount,
        clockedOutCount,
        onTimeCount,
        lateCount
      }
    });
  } catch (error: any) {
    console.error('Get admin today status error:', error);
    res.status(500).json({ error: 'Internal server error fetching admin status logs' });
  }
};
