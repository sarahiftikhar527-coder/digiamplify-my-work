'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import { X, HelpCircle } from 'lucide-react';

import EmployeeSupportView from './components/EmployeeSupportView';
import AdminSupportView from './components/AdminSupportView';
import TicketDetailsModal from './components/TicketDetailsModal';

export default function HelpAndSupportPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [issueType, setIssueType] = useState('Technical Issue');
  const [customIssueType, setCustomIssueType] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState('Email');
  const [attachments, setAttachments] = useState<{ name: string; content: string }[]>([]);

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role?.toLowerCase() === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      fetchTickets();
    } else {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const interval = setInterval(() => {
      fetchTickets(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/support', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets');
      }
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred loading support tickets');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError(`File ${file.name} size exceeds the 5MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachments(prev => [...prev, { name: file.name, content: reader.result as string }]);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        processFile(files[i]);
      }
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!issueType) {
      setError('Please select an issue type.');
      return;
    }
    let finalIssueType = issueType;
    if (issueType === 'Other') {
      if (!customIssueType) {
        setError('Please enter your custom issue type.');
        return;
      }
      finalIssueType = customIssueType;
    }
    if (!subject) {
      setError('Please enter a subject.');
      return;
    }
    if (!description) {
      setError('Please enter a description of the problem.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          issueType: finalIssueType,
          subject,
          priority,
          description,
          fileName: attachments.length > 0 ? JSON.stringify(attachments.map(a => a.name)) : null,
          fileContent: attachments.length > 0 ? JSON.stringify(attachments.map(a => a.content)) : null,
          contactMethod
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      setSuccess('Problem reported successfully! We will get back to you soon.');

      setIssueType('Technical Issue');
      setCustomIssueType('');
      setSubject('');
      setPriority('High');
      setDescription('');
      setAttachments([]);
      setContactMethod('Email');

      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Error occurred submitting report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminResponse) {
      setError('Please write a resolution response.');
      return;
    }

    setIsSubmittingResponse(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/support/respond/${selectedTicket.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminResponse })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send resolution');
      }

      setSuccess('Resolution submitted successfully!');
      setAdminResponse('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Error occurred resolving ticket');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const downloadAttachment = (fileName: string, fileContent: string) => {
    if (fileName.trim().startsWith('[') && fileContent.trim().startsWith('[')) {
      try {
        const names = JSON.parse(fileName);
        const contents = JSON.parse(fileContent);
        if (Array.isArray(names) && Array.isArray(contents)) {
          names.forEach((name, index) => {
            const content = contents[index];
            if (content) {
              const link = document.createElement('a');
              link.href = content;
              link.download = name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          });
          return;
        }
      } catch (e) {
        console.error('Error parsing attachments:', e);
      }
    }

    const link = document.createElement('a');
    link.href = fileContent;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTickets = tickets.filter((ticket) => {

    if (activeTab === 'PENDING' && ticket.status !== 'PENDING') return false;
    if (activeTab === 'RESOLVED' && ticket.status !== 'RESOLVED') return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const subjectMatch = (ticket.subject || '').toLowerCase().includes(query);
      const descMatch = (ticket.description || '').toLowerCase().includes(query);
      const emailMatch = (ticket.user?.email || '').toLowerCase().includes(query);
      const nameMatch = (ticket.user?.profile?.fullName || '').toLowerCase().includes(query);

      return subjectMatch || descMatch || emailMatch || nameMatch;
    }

    return true;
  });

  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">



        {error && (
          <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {error}
            <button onClick={() => setError('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {success}
            <button onClick={() => setSuccess('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isAdmin ? (
          <AdminSupportView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tickets={tickets}
            filteredTickets={filteredTickets}
            onTicketClick={(t) => setSelectedTicket(t)}
          />
        ) : (
          <div className="space-y-10">

            <div className="select-none">
              <h1 className="text-[23px] font-semibold tracking-wide text-white flex items-center gap-2.5">
                <HelpCircle className="w-6.5 h-6.5 text-[#be0919]" />
                <span>Report a Problem</span>
              </h1>
              <p className="text-[17px] text-neutral-400 font-regular mt-3 leading-relaxed font-sans">
                Let us know what is going on. We’ll look into it and get back to you soon.
              </p>
            </div>

            <EmployeeSupportView
              subject={subject}
              setSubject={setSubject}
              issueType={issueType}
              setIssueType={setIssueType}
              priority={priority}
              setPriority={setPriority}
              description={description}
              setDescription={setDescription}
              contactMethod={contactMethod}
              setContactMethod={setContactMethod}
              attachments={attachments}
              handleFileUpload={handleFileUpload}
              handleRemoveAttachment={handleRemoveAttachment}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              onSubmit={handleSubmitTicket}
              isLoading={isLoading}
              tickets={tickets}
              onTicketClick={(t) => setSelectedTicket(t)}
            />
          </div>
        )}

      </div>

      <TicketDetailsModal
        isOpen={!!selectedTicket}
        onClose={() => {
          setSelectedTicket(null);
          setAdminResponse('');
          setError('');
        }}
        selectedTicket={selectedTicket}
        isAdmin={isAdmin}
        adminResponse={adminResponse}
        setAdminResponse={setAdminResponse}
        onSubmitResponse={handleResolveTicket}
        isSubmittingResponse={isSubmittingResponse}
        downloadAttachment={downloadAttachment}
      />

    </div>
  );
}
