'use client';

import React from 'react';

interface EmployeeEarningsOverviewChartProps {
  earnings: number[];
  transactionsCount: number;
  currentMonthIndex: number;
  months: string[];
}

export default function EmployeeEarningsOverviewChart({
  earnings,
  transactionsCount,
  currentMonthIndex,
  months
}: EmployeeEarningsOverviewChartProps) {
  const getEarningsOverviewPath = () => {
    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 20;

    const maxVal = Math.max(...earnings, 100);
    const scaleMax = maxVal * 1.15;

    const getX = (index: number) => paddingX + (index * (width - 2 * paddingX) / 11);
    const getY = (value: number) => height - paddingY - (value / scaleMax) * (height - 2 * paddingY);

    let pathD = `M ${getX(0)} ${getY(earnings[0])}`;
    for (let i = 1; i < earnings.length; i++) {
      const x = getX(i);
      const y = getY(earnings[i]);
      const prevX = getX(i - 1);
      const prevY = getY(earnings[i - 1]);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }

    const areaD = `${pathD} L ${getX(11)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

    return { pathD, areaD, getX, getY, scaleMax };
  };

  return (
    <div className="lg:col-span-3 bg-[#0c0c0c] border border-neutral-900 rounded-xl p-8 shadow-md animate-fadeIn">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-900 select-none">
        <h3 className="text-base font-bold tracking-wide">Earnings Overview</h3>
      </div>

      <div className="relative w-full h-[220px] flex items-center justify-center">
        {transactionsCount === 0 ? (
          <span className="text-sm sm:text-base text-neutral-500 font-light select-none">No transaction history</span>
        ) : (
          (() => {
            const { pathD, areaD, getX, getY, scaleMax } = getEarningsOverviewPath();
            return (
              <svg viewBox="0 0 600 200" className="w-full h-full">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#be0919" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#be0919" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const v = scaleMax * ratio;
                  const y = getY(v);
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="570" y2={y} stroke="#16181C" strokeWidth="1" strokeDasharray="4 4" />
                      <text x="15" y={y + 4} fill="#ffffff" fontSize="10.5" fontWeight="600" textAnchor="middle">${Math.round(v)}</text>
                    </g>
                  );
                })}

                <path d={areaD} fill="url(#chart-glow)" />
                <path d={pathD} fill="none" stroke="#be0919" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {earnings.map((val, idx) => {
                  const x = getX(idx);
                  const y = getY(val);
                  const isCurrent = idx === currentMonthIndex;

                  return (
                    <g key={idx}>
                      {isCurrent && val > 0 && (
                        <>
                          <line x1={x} y1="20" x2={x} y2="160" stroke="#be0919" strokeWidth="1" strokeDasharray="2 2" />
                          <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#be0919" strokeWidth="2" />
                          <rect x={x - 22} y={y - 24} width="44" height="16" rx="3" fill="#be0919" />
                          <text x={x} y={y - 13} fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">${Math.round(val)}</text>
                        </>
                      )}
                      <circle cx={x} cy={y} r="3" fill="#be0919" opacity={isCurrent && val > 0 ? 0 : 0.7} />
                    </g>
                  );
                })}

                {months.map((m, idx) => (
                  <text key={idx} x={getX(idx)} y="185" fill="#ffffff" fontSize="11" fontWeight="600" textAnchor="middle">{m}</text>
                ))}
              </svg>
            );
          })()
        )}
      </div>
    </div>
  );
}
