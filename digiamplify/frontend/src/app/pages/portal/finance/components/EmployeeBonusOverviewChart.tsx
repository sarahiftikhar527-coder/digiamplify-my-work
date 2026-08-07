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
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

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
                  <linearGradient id="bar-grad-hover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff1e32" stopOpacity="1" />
                    <stop offset="100%" stopColor="#be0919" stopOpacity="1" />
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
                  const isHovered = hoveredIndex === idx;
                  const maxBonusVal = Math.max(...bonuses);
                  const isHigh = val === maxBonusVal && val > 0 && hoveredIndex === null;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Transparent hit area for easy hover */}
                      <rect
                        x={x - 14}
                        y="10"
                        width="28"
                        height="160"
                        fill="transparent"
                      />

                      {/* Bar rectangle */}
                      <rect
                        x={x - 7}
                        y={y}
                        width="14"
                        height={Math.max(barHeight, 0)}
                        rx="3"
                        fill={isHovered ? 'url(#bar-grad-hover)' : 'url(#bar-grad)'}
                        stroke={isHovered ? '#ff4d5a' : 'transparent'}
                        strokeWidth={isHovered ? '1' : '0'}
                      />

                      {/* Static high label if not hovered */}
                      {isHigh && (
                        <text x={x} y={y - 6} fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">${Math.round(val)}</text>
                      )}

                      {/* Interactive Hover Tooltip & Dotted Line */}
                      {isHovered && (
                        <g className="animate-fadeIn">
                          <line x1={x} y1={y} x2={x} y2="160" stroke="#be0919" strokeWidth="1" strokeDasharray="2 2" />
                          <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#be0919" strokeWidth="2" />
                          <rect x={x - 24} y={y - 25} width="48" height="18" rx="4" fill="#be0919" />
                          <text x={x} y={y - 12} fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                            ${Math.round(val)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {months.map((m, idx) => (
                  <text key={idx} x={getX(idx)} y="185" fill={hoveredIndex === idx ? '#ff4d5a' : '#ffffff'} fontSize="11" fontWeight={hoveredIndex === idx ? 'bold' : '600'} textAnchor="middle">{m.split(' ')[0]}</text>
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
