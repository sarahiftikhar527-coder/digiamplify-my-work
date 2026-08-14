'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import MonthGridCalendar from './components/MonthGridCalendar';
import DayScheduleView from './components/DayScheduleView';
import CalendarRightSidebar from './components/CalendarRightSidebar';
import RequestLeaveModal from './components/RequestLeaveModal';
import SetAvailabilityModal from './components/SetAvailabilityModal';
import AbsenteeismDetailModal from './components/AbsenteeismDetailModal';
import AllEventsModal from './components/AllEventsModal';
import AddEventModal from './components/AddEventModal';
import { formatDateWithDay } from '@/utils/dateUtils';
import { Plus, Calendar as CalendarIcon, Video } from 'lucide-react';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'Month' | 'Day'>('Month');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        setUserRole(u.role || 'Employee');
      } catch (e) {}
    }
  }, []);

  // Derive initial month and date dynamically from real system date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');

  const defaultMonthStr = `${currentYear}-${currentMonth}`;
  const defaultDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);
  const [selectedDate, setSelectedDate] = useState(defaultDateStr);

  const [monthData, setMonthData] = useState<any>(null);
  const [dayData, setDayData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showAbsenteeismModal, setShowAbsenteeismModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [allEventsModalData, setAllEventsModalData] = useState<{ dateStr: string; events: any[] } | null>(null);



  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchMonthCalendarData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`http://localhost:5000/api/calendar/month?month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMonthData(data);
      }
    } catch (err) {
      console.error('Error fetching month calendar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDayScheduleData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/calendar/day?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setDayData(data);
      }
    } catch (err) {
      console.error('Error fetching day schedule data:', err);
    }
  };

  useEffect(() => {
    fetchMonthCalendarData();
  }, [selectedMonth]);

  useEffect(() => {
    if (viewMode === 'Day') {
      fetchDayScheduleData();
    }
  }, [selectedDate, viewMode]);

  const [yearStr, mStr] = selectedMonth.split('-');
  const monthIdx = parseInt(mStr, 10) - 1;
  const currentMonthYearStr = `${monthsList[monthIdx]} ${yearStr}`;

  const handlePrevMonth = () => {
    let y = parseInt(yearStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const newM = m < 10 ? `0${m}` : `${m}`;
    setSelectedMonth(`${y}-${newM}`);
  };

  const handleNextMonth = () => {
    let y = parseInt(yearStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const newM = m < 10 ? `0${m}` : `${m}`;
    setSelectedMonth(`${y}-${newM}`);
  };

  const handleDateClick = (dayNum: number) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `${selectedMonth}-${formattedDay}`;
    setSelectedDate(dateStr);
    setViewMode('Day');
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const formatFullDateHeader = (dateIso: string) => {
    return formatDateWithDay(dateIso);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">
        
        {/* Header Breadcrumbs */}
        <div className="mb-2 select-none">
          <span className="text-xs font-semibold text-[#be0919]">Calendar</span>
        </div>

        <div className="mb-8 select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-white">Calendar</h1>
            <p className="text-sm text-neutral-400 font-normal mt-1 leading-relaxed">
              View schedules, tasks, and important dates.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {userRole === 'Admin' ? (
              <button
                onClick={() => setShowAddEventModal(true)}
                className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event / Meeting</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Schedule Meeting</span>
                </button>

                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-neutral-800 flex items-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4 text-[#be0919]" />
                  <span>Request Leave</span>
                </button>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be0919]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            
            {/* Left 70% Main Calendar Panel */}
            <div className="lg:col-span-8 w-full">
              {viewMode === 'Month' ? (
                <MonthGridCalendar
                  currentMonthYearStr={currentMonthYearStr}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onSetAvailabilityClick={() => setShowAvailabilityModal(true)}
                  onDateClick={handleDateClick}
                  onMoreClick={(dateStr, events) => setAllEventsModalData({ dateStr, events })}
                  eventsMap={monthData?.eventsMap || {}}
                  selectedMonth={selectedMonth}
                  selectedDate={selectedDate}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />


              ) : (
                <DayScheduleView
                  dateStr={formatFullDateHeader(selectedDate)}
                  onBack={() => setViewMode('Month')}
                  onPrevDay={handlePrevDay}
                  onNextDay={handleNextDay}
                  scheduleData={dayData}
                />
              )}
            </div>

            {/* Right 30% Sidebar Panel */}
            <div className="lg:col-span-4 w-full">
              <CalendarRightSidebar
                currentMonthYearStr={currentMonthYearStr}
                selectedMonth={selectedMonth}
                selectedDate={selectedDate}
                onDateSelect={handleDateClick}
                eventsMap={monthData?.eventsMap || {}}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                upcomingTasks={monthData?.upcomingTasks || []}
                absenteeism={monthData?.absenteeism || { absentCount: 3, percentage: 75 }}
                leaveRequests={monthData?.leaveRequests || []}
                onRequestLeaveClick={() => setShowLeaveModal(true)}
                onViewAbsenteeismClick={() => setShowAbsenteeismModal(true)}
                onAnnounceHolidayClick={() => setShowAddEventModal(true)}
                userRole={userRole}
              />
            </div>

          </div>
        )}

      </div>

      {showLeaveModal && (
        <RequestLeaveModal
          onClose={() => setShowLeaveModal(false)}
          onSuccess={fetchMonthCalendarData}
        />
      )}

      {showAvailabilityModal && (
        <SetAvailabilityModal
          onClose={() => setShowAvailabilityModal(false)}
          onSuccess={fetchMonthCalendarData}
        />
      )}

      {showAbsenteeismModal && (
        <AbsenteeismDetailModal
          onClose={() => setShowAbsenteeismModal(false)}
          absentCount={monthData?.absenteeism?.absentCount || 0}
          currentMonthYearStr={currentMonthYearStr}
          records={monthData?.absenteeism?.records || []}
        />
      )}

      {allEventsModalData && (
        <AllEventsModal
          dateStr={allEventsModalData.dateStr}
          formattedDateHeader={formatFullDateHeader(allEventsModalData.dateStr)}
          events={allEventsModalData.events}
          onClose={() => setAllEventsModalData(null)}
          onOpenDayView={() => {
            setSelectedDate(allEventsModalData.dateStr);
            setViewMode('Day');
            setAllEventsModalData(null);
          }}
        />
      )}



      {showAddEventModal && (
        <AddEventModal
          onClose={() => setShowAddEventModal(false)}
          onEventCreated={fetchMonthCalendarData}
        />
      )}

    </div>
  );
}
