'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface EmployeeBonusOverviewChartProps {
  bonuses: number[];
  transactionsCount: number;
  months: string[];
}

export default function EmployeeBonusOverviewChart({
  bonuses,
  transactionsCount,
  months
}: EmployeeBonusOverviewChartProps) {
  const getBonusOverviewCoords = () => {
    const width = 450;
    const height = 180;
    const paddingX = 40;
    const paddingY = 20;

    const maxVal = Math.max(...bonuses, 100);
    const scaleMax = maxVal * 1.15;

    const getX = (index: number) => paddingX + (index * (width - 2 * paddingX) / 11);
    const getY = (value: number) => height - paddingY - (value / scaleMax) * (height - 2 * paddingY);

    return { getX, getY, scaleMax, width, height, paddingX, paddingY };
  };

  return (
    <div className="lg:col-span-2 bg-[#0c0c0c] border border-neutral-900 rounded-xl p-8 shadow-md flex flex-col justify-between animate-fadeIn">
      <div className="pb-4 border-b border-neutral-900 mb-6 select-none">
        <h3 className="text-base font-bold tracking-wide">Bonus Overview <span className="text-[10px] text-neutral-450 lowercase font-medium">(This Year)</span></h3>
      </div>

      <div className="relative w-full h-[200px] flex items-center justify-center">
        {transactionsCount === 0 ? (
          <span className="text-sm sm:text-base text-neutral-500 font-light select-none">No transaction history</span>
        ) : (
          (() => {
            const { getX, getY, scaleMax, width, height, paddingX, paddingY } = getBonusOverviewCoords();
            return (
              <svg viewBox="0 0 450 200" className="w-full h-full">
                <defs>
                  <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#be0919" stopOpacity="1" />
                    <stop offset="100%" stopColor="#60050d" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const v = scaleMax * ratio;
                  const y = getY(v);
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="420" y2={y} stroke="#16181C" strokeWidth="1" strokeDasharray="4 4" />
                      <text x="15" y={y + 4} fill="#ffffff" fontSize="10.5" fontWeight="600" textAnchor="middle">${Math.round(v)}</text>
                    </g>
                  );
                })}

                {bonuses.map((val, idx) => {
                  const x = getX(idx);
                  const y = getY(val);
                  const barHeight = height - paddingY - y;
                  const isHigh = val === Math.max(...bonuses) && val > 0;

                  return (
                    <g key={idx}>
                      <rect
                        x={x - 6}
                        y={y}
                        width="12"
                        height={Math.max(barHeight, 0)}
                        rx="3"
                        fill="url(#bar-grad)"
                      />
                      {isHigh && (
                        <>
                          <text x={x} y={y - 6} fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">${Math.round(val)}</text>
                        </>
                      )}
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

      <div className="mt-6 border-t border-neutral-900 pt-5 flex items-center gap-2.5 select-none">
        <TrendingUp className="w-4.5 h-4.5 text-[#be0919]" />
        <span className="text-xs sm:text-sm text-neutral-400">
          Total bonus this year : <span className="font-bold text-white">${bonuses.reduce((acc, curr) => acc + curr, 0).toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}
