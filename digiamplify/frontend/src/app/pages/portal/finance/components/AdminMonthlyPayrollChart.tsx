'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AdminMonthlyPayrollChartProps {
  monthlyData?: number[];
}

export default function AdminMonthlyPayrollChart({ monthlyData = [] }: AdminMonthlyPayrollChartProps) {
  const [filterPeriod, setFilterPeriod] = useState<'Month' | 'Quarter' | 'Year'>('Month');
  const [showDropdown, setShowDropdown] = useState(false);

  const rawMonths = ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26'];
  
  // Ensure array has 12 numbers
  const fullMonthlyValues = Array.from({ length: 12 }, (_, i) => monthlyData[i] || 0);

  let displayLabels = rawMonths;
  let displayValues = fullMonthlyValues;

  if (filterPeriod === 'Quarter') {
    displayLabels = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];
    displayValues = [
      fullMonthlyValues.slice(0, 3).reduce((a, b) => a + b, 0),
      fullMonthlyValues.slice(3, 6).reduce((a, b) => a + b, 0),
      fullMonthlyValues.slice(6, 9).reduce((a, b) => a + b, 0),
      fullMonthlyValues.slice(9, 12).reduce((a, b) => a + b, 0)
    ];
  } else if (filterPeriod === 'Year') {
    displayLabels = ['2026 Total'];
    displayValues = [fullMonthlyValues.reduce((a, b) => a + b, 0)];
  }

  // Convert to thousands (K)
  const dataPointsInK = displayValues.map(val => val / 1000);
  const peakValK = Math.max(...dataPointsInK, 10);
  const maxVal = Math.ceil(peakValK / 200) * 200 || 1000;

  const width = 620;
  const height = 220;
  const paddingX = 58;
  const paddingY = 25;

  const numPoints = displayLabels.length;
  const getX = (index: number) => {
    if (numPoints === 1) return width / 2;
    return paddingX + (index * (width - 2 * paddingX) / (numPoints - 1));
  };
  const getY = (value: number) => height - paddingY - (value / maxVal) * (height - 2 * paddingY);

  let pathD = `M ${getX(0)} ${getY(dataPointsInK[0])}`;
  if (numPoints > 1) {
    for (let i = 1; i < dataPointsInK.length; i++) {
      const x = getX(i);
      const y = getY(dataPointsInK[i]);
      const prevX = getX(i - 1);
      const prevY = getY(dataPointsInK[i - 1]);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }
  }

  const lastIndex = numPoints - 1;
  const areaD = numPoints > 1
    ? `${pathD} L ${getX(lastIndex)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`
    : `M ${getX(0)} ${getY(dataPointsInK[0])} L ${getX(0)} ${height - paddingY} Z`;

  const yTicks = [maxVal, maxVal * 0.8, maxVal * 0.6, maxVal * 0.4, maxVal * 0.2, 0].map(v => Math.round(v));


  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 sm:p-7 shadow-sm animate-fadeIn flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-900 select-none">
        <h3 className="text-base sm:text-lg font-bold tracking-wide text-white">Monthly Payroll Analytic</h3>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-3.5 py-1.5 bg-[#050505] border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{filterPeriod}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-[#0c0c0c] border border-neutral-800 rounded-xl shadow-xl py-1.5 z-20">
              {(['Month', 'Quarter', 'Year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setFilterPeriod(period);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    filterPeriod === period ? 'text-[#be0919] bg-white/5' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full h-[230px] flex items-center justify-center">
        <svg viewBox="0 0 630 240" className="w-full h-full">
          <defs>
            <linearGradient id="admin-chart-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#be0919" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#be0919" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid lines & Ticks */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line x1="58" y1={y} x2="600" y2={y} stroke="#16181C" strokeWidth="1" strokeDasharray="4 4" />
                <text x="45" y={y + 4} fill="#8e8e93" fontSize="10.5" fontWeight="600" textAnchor="end">{val === 0 ? '0' : `${val}K`}</text>
              </g>
            );
          })}


          {/* Area & Line */}
          <path d={areaD} fill="url(#admin-chart-glow)" />
          <path d={pathD} fill="none" stroke="#be0919" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {dataPointsInK.map((val, idx) => {
            const x = getX(idx);
            const y = getY(val);
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="5" fill="#be0919" stroke="#0c0c0c" strokeWidth="2" />
                <circle cx={x} cy={y} r="2.5" fill="#ffffff" />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {displayLabels.map((m, idx) => (
            <text key={idx} x={getX(idx)} y="225" fill="#ffffff" fontSize="10.5" fontWeight="600" textAnchor="middle">{m}</text>
          ))}

        </svg>
      </div>
    </div>
  );
}
