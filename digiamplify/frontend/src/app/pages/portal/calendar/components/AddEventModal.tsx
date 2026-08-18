'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Users, Sparkles, CheckCircle2, Link2, UserCheck } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface AddEventModalProps {
  onClose: () => void;
  onEventCreated: () => void;
}

export default function AddEventModal({ onClose, onEventCreated }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [eventType, setEventType] = useState('MEETING');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/digi-amplify-meeting');
  const [description, setDescription] = useState('');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/calendar/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === teamMembers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(teamMembers.map(m => m.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      setErrorMsg('Please enter a meeting title and date.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          date,
          startTime: eventType === 'HOLIDAY' ? 'Full Day' : startTime,
          endTime: eventType === 'HOLIDAY' ? 'Full Day' : endTime,
          eventType,
          meetingLink: eventType === 'MEETING' ? meetingLink : null,
          invitedUserIds: eventType === 'HOLIDAY' ? [] : selectedUserIds,
          description
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(
          data.message ||
          (eventType === 'HOLIDAY' ? 'Company holiday announced!' : 'Event created & team notified!')
        );
        setTimeout(() => {
          onEventCreated();
          onClose();
        }, 1300);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to schedule meeting.');
      }
    } catch (err) {
      console.error('Error creating meeting event:', err);
      setErrorMsg('Error connecting to backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative select-none custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-900 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#be0919]/10 border border-[#be0919]/30 flex items-center justify-center text-[#be0919]">
              {eventType === 'HOLIDAY' ? (
                <Calendar className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {eventType === 'HOLIDAY'
                  ? 'Announce Company Holiday'
                  : eventType === 'TASK_VIEW'
                  ? 'Create Project Deadline'
                  : 'Schedule Remote Meeting'}
              </h2>
              <p className="text-xs text-neutral-400">
                {eventType === 'HOLIDAY'
                  ? 'Announce an official full-day company holiday'
                  : eventType === 'TASK_VIEW'
                  ? 'Set a critical project deadline for team members'
                  : 'Invite team members with remote meeting link & notifications'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
            <h3 className="text-base font-bold text-white">{successMsg}</h3>
            <p className="text-xs text-neutral-400">Updates have been reflected on the company calendar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">
                {eventType === 'HOLIDAY'
                  ? 'Holiday Name'
                  : eventType === 'TASK_VIEW'
                  ? 'Deadline / Task Title'
                  : 'Meeting Title'}
              </label>
              <input
                type="text"
                placeholder={
                  eventType === 'HOLIDAY'
                    ? 'e.g. Eid-ul-Fitr / Independence Day'
                    : eventType === 'TASK_VIEW'
                    ? 'e.g. Q3 Sprint Milestone Delivery'
                    : 'e.g. Weekly Product Sync / Design Sprint Review'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#be0919]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be0919]"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be0919]"
                >
                  <option value="MEETING">Remote Team Meeting</option>
                  <option value="HOLIDAY">Company Holiday</option>
                  <option value="TASK_VIEW">Project Deadline</option>
                </select>
              </div>
            </div>

            {/* Time Controls (Hidden for Full-Day Company Holidays) */}
            {eventType !== 'HOLIDAY' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">
                    {eventType === 'TASK_VIEW' ? 'Due Time' : 'Start Time'}
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-[#be0919]"
                  />
                </div>
                {eventType === 'MEETING' && (
                  <div>
                    <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">End Time</label>
                    <input
                      type="text"
                      placeholder="11:00 AM"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-[#be0919]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Remote Meeting Link Input (Only for Meetings) */}
            {eventType === 'MEETING' && (
              <div>
                <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#be0919]" />
                  <span>Remote Meeting Link (Google Meet / Zoom)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono placeholder-white/30 focus:outline-none focus:border-[#be0919]"
                />
              </div>
            )}

            {/* Invite Team Members Multi-Select (Hidden for Holidays) */}
            {eventType !== 'HOLIDAY' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Invite Team Members ({selectedUserIds.length} Selected)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-semibold text-[#be0919] hover:underline cursor-pointer"
                  >
                    {selectedUserIds.length === teamMembers.length ? 'Deselect All' : 'Select Entire Team'}
                  </button>
                </div>

                {isLoadingMembers ? (
                  <div className="py-4 text-center text-neutral-500">Loading team directory...</div>
                ) : (
                  <div className="bg-[#050505] border border-neutral-800 rounded-2xl p-2.5 max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                    {teamMembers.length > 0 ? (
                      teamMembers.map(member => {
                        const isSelected = selectedUserIds.includes(member.id);
                        return (
                          <div
                            key={member.id}
                            onClick={() => toggleUserSelection(member.id)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#be0919]/10 border border-[#be0919]/40 text-white'
                                : 'hover:bg-neutral-900 text-neutral-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-[#be0919] text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold block text-white text-xs">{member.name}</span>
                                <span className="text-[10px] text-neutral-500 block">{member.department} • {member.role}</span>
                              </div>
                            </div>

                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-[#be0919] border-[#be0919]' : 'border-neutral-700'}`}>
                              {isSelected && <UserCheck className="w-2.5 h-2.5 text-white" />}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-neutral-500">No team members found.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">
                {eventType === 'HOLIDAY' ? 'Holiday Notes / Description' : 'Agenda / Description'}
              </label>
              <textarea
                rows={2}
                placeholder={eventType === 'HOLIDAY' ? 'Official holiday details for all staff...' : 'Brief details regarding discussion topics...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#be0919]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-900">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-all cursor-pointer border border-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {eventType === 'HOLIDAY' ? (
                  <Calendar className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                <span>
                  {isLoading
                    ? 'Processing...'
                    : eventType === 'HOLIDAY'
                    ? 'Announce Holiday'
                    : eventType === 'TASK_VIEW'
                    ? 'Create Deadline'
                    : 'Schedule & Notify Team'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
