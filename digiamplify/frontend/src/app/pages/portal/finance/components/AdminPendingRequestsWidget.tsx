'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Check, X, AlertCircle } from 'lucide-react';

interface PendingRequest {
  id: string;
  userId: string;
  employeeName: string;
  email: string;
  department: string;
  jobTitle: string;
  title: string;
  reference: string;
  amount: string;
  amountRaw: number;
  type: string;
  dateFormatted: string;
  status: string;
}

interface AdminPendingRequestsWidgetProps {
  onActionComplete?: () => void;
}

export default function AdminPendingRequestsWidget({ onActionComplete }: AdminPendingRequestsWidgetProps) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/finance/admin/pending-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.pendingRequests || []);
      }
    } catch (e) {
      console.error('Failed to fetch pending requests', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(requestId);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/finance/admin/request/${requestId}/action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Request ${action.toLowerCase()}d successfully!`);
        await fetchPendingRequests();
        if (onActionComplete) onActionComplete();
      } else {
        setError(data.error || `Failed to ${action.toLowerCase()} request`);
      }
    } catch (e: any) {
      setError(e.message || 'Error processing request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 shadow-md mb-8 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Pending Financial Requests</h3>
            <p className="text-xs text-neutral-400 font-light mt-0.5">Approve or reject salary advances, reimbursements and withdrawals</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs rounded-lg">
          {requests.length} Pending
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {requests.map((req) => {
            const isAdvance = req.type === 'SALARY';
            const isBonus = req.type === 'BONUS';
            const isDeduction = req.type === 'DEDUCTION';

            let typeLabel = 'Financial Request';
            let badgeStyle = 'bg-neutral-800 text-neutral-300 border-neutral-700';
            if (isAdvance) {
              typeLabel = 'Salary Advance';
              badgeStyle = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
            } else if (isBonus) {
              typeLabel = 'Reimbursement / Bonus';
              badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            } else if (isDeduction) {
              typeLabel = 'Withdrawal Request';
              badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            }

            const initial = req.employeeName.charAt(0).toUpperCase();

            return (
              <div
                key={req.id}
                className="bg-[#050505] border border-neutral-900 hover:border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#be0919] text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-md">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate">{req.employeeName}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeStyle}`}>
                        {typeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-light mt-1 truncate">
                      {req.title} &bull; <span className="text-neutral-500">{req.dateFormatted}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-900">
                  <span className="text-base font-extrabold text-white tracking-wide">{req.amount}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(req.id, 'REJECT')}
                      disabled={processingId === req.id}
                      className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'APPROVE')}
                      disabled={processingId === req.id}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-[#050505] border border-neutral-900/60 rounded-xl">
          <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-xs text-neutral-400">No pending financial requests at this time.</p>
        </div>
      )}
    </div>
  );
}
