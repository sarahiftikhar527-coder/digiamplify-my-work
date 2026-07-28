'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import {
  AlertCircle,
  X,
  Flag,
  UploadCloud,
  Download,
  ExternalLink,
  FileText,
  CheckCircle,
  Clock,
  Send,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Search,
  ChevronDown
} from 'lucide-react';

export default function HelpAndSupportPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for Employee
  const [issueType, setIssueType] = useState('');
  const [customIssueType, setCustomIssueType] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState('Email');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');

  // Admin response states
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

  const fetchTickets = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (e.g. 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      setFileContent(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      setFileContent(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFileName('');
    setFileContent('');
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
          fileName,
          fileContent,
          contactMethod
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      setSuccess('Problem reported successfully! We will get back to you soon.');
      // Reset form
      setIssueType('');
      setCustomIssueType('');
      setSubject('');
      setPriority('High');
      setDescription('');
      setFileName('');
      setFileContent('');
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
    const link = document.createElement('a');
    link.href = fileContent;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tickets for Admin View
  const filteredTickets = tickets.filter((ticket) => {
    // Tab filter
    if (activeTab === 'PENDING' && ticket.status !== 'PENDING') return false;
    if (activeTab === 'RESOLVED' && ticket.status !== 'RESOLVED') return false;

    // Search query filter
    const query = searchQuery.toLowerCase();
    const emailMatch = (ticket.user?.email || '').toLowerCase().includes(query);
    const nameMatch = (ticket.user?.profile?.fullName || '').toLowerCase().includes(query);
    const subjectMatch = (ticket.subject || '').toLowerCase().includes(query);
    const issueMatch = (ticket.issueType || '').toLowerCase().includes(query);

    return emailMatch || nameMatch || subjectMatch || issueMatch;
  });

  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white">
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-neutral-500 font-light text-sm flex items-center gap-1.5">
            <span className="text-red-500 font-medium">Support</span>
            <span>/</span>
            <span>{isAdmin ? 'Admin Console' : 'Help Desk'}</span>
          </div>
        </div>

        {/* Global Success/Error Alerts */}
        {error && (
          <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {error}
            <button onClick={() => setError('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light relative animate-fadeIn">
            {success}
            <button onClick={() => setSuccess('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EMPLOYEE VIEW */}
        {/* ========================================================================= */}
        {!isAdmin && (
          <div className="flex flex-col gap-8 w-full">
            
            {/* Report Form */}
            <div className="w-full bg-black border border-neutral-900 rounded-xl p-6 lg:p-8 relative shadow-lg">
              
              {/* Header Title with warning icon */}
              <div className="flex items-start justify-between mb-10">
                <div className="flex gap-3">
                  <div className="p-1 rounded-lg text-[#be0919]">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold text-white tracking-wide">Report a Problem</h2>
                    <p className="text-xs text-neutral-400 font-light mt-1 max-w-[400px]">
                      Let us know what is going on. We'll look into it and get back to you soon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitTicket} className="space-y-6 text-sm">
                
                {/* Issue Type */}
                <div className="flex flex-col">
                  <label className="text-sm text-white/90 mb-2.5 font-medium poppins">
                    Issue Type <span className="text-[#be0919] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3.5 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer"
                    >
                      <option value="" className="text-neutral-500">Enter or select Issue type</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="HR & Payroll">HR & Payroll</option>
                      <option value="Portal & Access">Portal & Access</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  {issueType === 'Other' && (
                    <div className="flex flex-col mt-4 animate-fadeIn">
                      <label className="text-sm text-white/90 mb-2.5 font-medium poppins">
                        Custom Issue Type <span className="text-[#be0919] font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your issue type"
                        value={customIssueType}
                        onChange={(e) => setCustomIssueType(e.target.value)}
                        className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3.5 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 font-light"
                      />
                    </div>
                  )}
                </div>

                {/* Subject & Priority (Side by Side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Subject */}
                  <div className="flex flex-col">
                    <label className="text-sm text-white/90 mb-2.5 font-medium poppins">
                      Subject <span className="text-[#be0919] font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter leave subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 font-light"
                    />
                  </div>

                  {/* Priority Type */}
                  <div className="flex flex-col">
                    <label className="text-sm text-white/90 mb-2.5 font-medium poppins">
                      Priority Type <span className="text-[#be0919] font-bold">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3 pl-10 pr-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer font-light"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <Flag className="w-4 h-4 text-[#be0919] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col">
                  <label className="text-sm text-white/90 mb-2.5 font-medium poppins">
                    Description <span className="text-[#be0919] font-bold">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter description for Problem..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 resize-none font-light"
                  />
                </div>

                {/* File Attachment Drag & Drop Dropzone */}
                <div className="flex flex-col">
                  <label className="text-base text-white/90 mb-2.5 font-medium poppins">
                    Attachment (Optional)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="w-full border-2 border-dashed border-neutral-800 rounded-xl bg-[#0c0c0c] hover:border-neutral-700 transition-colors p-7 flex flex-col items-center justify-center cursor-pointer text-center relative"
                  >
                    <input
                      type="file"
                      id="support-file"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    
                    <div className="w-12 h-12 rounded-full bg-[#be0919]/10 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6 text-[#be0919]" />
                    </div>

                    {fileName ? (
                      <div className="z-10 flex items-center gap-2 max-w-full px-4">
                        <FileText className="w-5 h-5 text-neutral-400 shrink-0" />
                        <span className="text-sm text-white font-medium truncate max-w-[200px]">{fileName}</span>
                        <button
                          onClick={handleClearFile}
                          className="p-1 rounded bg-[#0c0c0c] hover:bg-neutral-800 text-neutral-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-white font-medium tracking-wide">Drag & Drop files here</span>
                        <span className="text-xs text-neutral-500 font-light mt-1.5">
                          or <span className="text-[#be0919] hover:underline font-normal">browse files</span> from computer
                        </span>
                      </>
                    )}

                    <div className="flex gap-2.5 mt-5">
                      <span className="text-xs font-bold py-1.5 px-3.5 bg-[#0c0c0c] border border-neutral-800 text-neutral-400 rounded-md">.PDF</span>
                      <span className="text-xs font-bold py-1.5 px-3.5 bg-[#0c0c0c] border border-neutral-800 text-neutral-400 rounded-md">.DOC</span>
                      <span className="text-xs font-bold py-1.5 px-3.5 bg-[#0c0c0c] border border-neutral-800 text-neutral-400 rounded-md">.PNG</span>
                      <span className="text-xs font-bold py-1.5 px-3.5 bg-[#0c0c0c] border border-neutral-800 text-neutral-400 rounded-md">.JPG</span>
                    </div>
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div className="flex flex-col">
                  <label className="text-sm text-white/90 mb-2.5 font-medium poppins">
                    Preferred Contact Method
                  </label>
                  <div className="relative">
                    <select
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                      className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3.5 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer font-light"
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="Portal Chat">Portal Chat</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Submit button bar */}
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#be0919] hover:bg-[#990714] disabled:opacity-50 text-white font-bold py-3 px-10 rounded-lg text-sm cursor-pointer shadow-[0_4px_15px_rgba(190,9,25,0.25)] transition-all"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>

            {/* Support Tickets History (placed below the form, wide card) */}
            <div className="w-full bg-black border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-lg">
              <h2 className="text-lg font-bold text-white tracking-wide border-b border-neutral-900 pb-3 mb-6">
                My Support Tickets
              </h2>

              {isLoading && tickets.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 font-light text-xs">Loading history...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 font-light text-xs">
                  No issues reported yet. Your ticket history will display here.
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => setSelectedTicket(t)}
                      className="p-4 bg-[#0c0c0c] border border-white/20 hover:border-[#be0919]/50 rounded-xl cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs text-neutral-400 font-light">
                          {new Date(t.createdAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${
                          t.status === 'RESOLVED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {t.status === 'RESOLVED' ? 'Resolved' : 'Pending'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{t.subject}</h4>
                      <p className="text-xs text-neutral-400 truncate mt-1.5">{t.description}</p>
                      
                      {t.adminResponse && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-900 flex items-start gap-1.5 text-xs text-neutral-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">Response: {t.adminResponse}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADMIN VIEW */}
        {/* ========================================================================= */}
        {isAdmin && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Dashboard summary & tabs */}
            <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Support Tickets Console</h2>
                  <p className="text-xs text-neutral-500 font-light mt-1">Review, respond, and resolve employee queries and problems.</p>
                </div>
                
                {/* Search Bar */}
                <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-2.5 w-full md:max-w-[300px] focus-within:border-[#be0919] transition-all">
                  <Search className="w-4 h-4 text-neutral-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search by email, name or subject..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-neutral-900 pb-4 mb-6">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'ALL' ? 'text-[#be0919] border-[#be0919]' : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
                >
                  All Tickets ({tickets.length})
                </button>
                <button
                  onClick={() => setActiveTab('PENDING')}
                  className={`text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'PENDING' ? 'text-[#be0919] border-[#be0919]' : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
                >
                  Pending ({tickets.filter(t => t.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => setActiveTab('RESOLVED')}
                  className={`text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'RESOLVED' ? 'text-[#be0919] border-[#be0919]' : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
                >
                  Resolved ({tickets.filter(t => t.status === 'RESOLVED').length})
                </button>
              </div>

              {/* Tickets Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 text-neutral-400 text-sm font-semibold uppercase tracking-wider">
                      <th className="py-4 px-4">Employee</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Subject</th>
                      <th className="py-4 px-4">Priority</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-900 text-sm">
                    {filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-4.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-white font-semibold">{t.user?.profile?.fullName || '—'}</span>
                            <span className="text-xs text-neutral-400 font-light mt-1">{t.user?.email}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-4 text-sm text-neutral-200 font-normal">
                          {t.issueType}
                        </td>
                        <td className="py-4.5 px-4 text-sm text-neutral-200 font-normal max-w-[200px] truncate">
                          {t.subject}
                        </td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            t.priority === 'High' ? 'text-[#ff4d5a]' : t.priority === 'Medium' ? 'text-amber-400' : 'text-neutral-400'
                          }`}>
                            <Flag className="w-3.5 h-3.5" />
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-sm font-semibold ${
                            t.status === 'RESOLVED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {t.status === 'RESOLVED' ? 'Resolved' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="inline-flex items-center gap-1.5 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-white/5 text-sm font-bold py-2.5 px-5 rounded transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Respond</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTickets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-500 font-light text-xs">No tickets found matching current view.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL POPUPS */}
        {/* ========================================================================= */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scaleIn">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-[#050505]">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#be0919]" />
                  <h3 className="text-base font-bold text-white">Ticket Details</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setAdminResponse('');
                    setError('');
                  }}
                  className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-red-scrollbar text-base text-neutral-300 font-light">
                
                {/* Embedded Custom Red Scrollbar Styles */}
                <style dangerouslySetInnerHTML={{__html: `
                  .custom-red-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                  }
                  .custom-red-scrollbar::-webkit-scrollbar-track {
                    background: #050505;
                  }
                  .custom-red-scrollbar::-webkit-scrollbar-thumb {
                    background: #be0919;
                    border-radius: 3px;
                  }
                  .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #990714;
                  }
                `}} />

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 border-b border-neutral-900 pb-4">
                  <div>
                    <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Submitted On</span>
                    <span className="text-sm text-white font-medium mt-1 block">
                      {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Status</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium mt-1 border ${
                      selectedTicket.status === 'RESOLVED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {selectedTicket.status === 'RESOLVED' ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Issue Category</span>
                    <span className="text-sm text-white font-medium mt-1 block">{selectedTicket.issueType}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Priority</span>
                    <span className="text-sm text-white font-medium flex items-center gap-1.5 mt-1">
                      <Flag className="w-4 h-4 text-[#be0919]" />
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                {/* Submitter Details (Admin view only) */}
                {isAdmin && (
                  <div className="border-b border-neutral-900 pb-4">
                    <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block mb-2">Submitted By</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">{selectedTicket.user?.profile?.fullName || '—'}</span>
                      <span className="text-xs text-neutral-400 font-medium mt-1">{selectedTicket.user?.email}</span>
                    </div>
                  </div>
                )}

                {/* Subject & Description */}
                <div>
                  <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Subject</span>
                  <span className="text-sm text-white font-medium mt-1.5 block">{selectedTicket.subject}</span>
                </div>

                <div>
                  <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Description</span>
                  <p className="text-sm text-neutral-200 bg-[#050505] p-4 rounded-lg border border-neutral-900 mt-1.5 font-light leading-relaxed whitespace-pre-line">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Attachment */}
                {selectedTicket.fileName && selectedTicket.fileContent && (
                  <div className="flex items-center justify-between bg-[#be0919]/5 border border-[#be0919]/10 rounded-xl p-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4.5 h-4.5 text-[#be0919] shrink-0" />
                      <span className="text-sm font-medium text-white truncate max-w-[220px]">{selectedTicket.fileName}</span>
                    </div>
                    <button
                      onClick={() => downloadAttachment(selectedTicket.fileName, selectedTicket.fileContent)}
                      className="flex items-center gap-1.5 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2 px-3.5 rounded-md cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                )}

                {/* Contact Method */}
                <div>
                  <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Preferred Contact Method</span>
                  <div className="flex items-center gap-2 text-sm text-white font-medium mt-1.5">
                    {selectedTicket.contactMethod === 'Email' ? (
                      <Mail className="w-4 h-4 text-neutral-400" />
                    ) : selectedTicket.contactMethod === 'Phone' ? (
                      <Phone className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>{selectedTicket.contactMethod}</span>
                  </div>
                </div>

                {/* Resolution / Admin response */}
                {selectedTicket.status === 'RESOLVED' && selectedTicket.adminResponse && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4.5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                      <CheckCircle className="w-4.5 h-4.5" />
                      <span>Resolution Response</span>
                    </div>
                    <p className="text-sm text-neutral-200 font-light leading-relaxed whitespace-pre-line">
                      {selectedTicket.adminResponse}
                    </p>
                    {selectedTicket.respondedAt && (
                      <span className="text-xs text-neutral-500 font-light block pt-1">
                        Resolved on {new Date(selectedTicket.respondedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Resolve Action Panel (Admin only & Pending status) */}
                {isAdmin && selectedTicket.status === 'PENDING' && (
                  <form onSubmit={handleResolveTicket} className="space-y-4 pt-4 border-t border-neutral-900">
                    <div className="flex flex-col">
                      <label className="text-[13px] text-white font-semibold mb-2">
                        Resolve & Respond <span className="text-[#be0919] font-bold">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Write a message explaining the resolution..."
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        className="w-full bg-[#050505] border border-neutral-900 rounded-[12px] py-3 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 resize-none font-light leading-relaxed"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingResponse}
                        className="flex items-center gap-1.5 bg-[#be0919] hover:bg-[#990714] disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg text-xs cursor-pointer shadow-[0_4px_15px_rgba(190,9,25,0.25)] transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingResponse ? 'Sending...' : 'Send Resolution'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
