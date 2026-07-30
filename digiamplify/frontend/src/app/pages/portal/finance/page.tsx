'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import AdminFinanceView from './components/AdminFinanceView';
import EmployeeFinanceView from './components/EmployeeFinanceView';

export default function FinancePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setRole(parsed.role?.toLowerCase() || 'employee');
      } catch (e) {
        console.error('Failed to parse user role', e);
        setRole('employee');
      }
    } else {
      setRole('employee');
    }
  }, []);

  if (role === null) {
    return (
      <div className="flex h-screen bg-[#050505]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be0919]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">
        {role === 'admin' ? <AdminFinanceView /> : <EmployeeFinanceView />}
      </div>
    </div>
  );
}
