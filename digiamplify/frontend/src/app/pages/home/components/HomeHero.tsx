import React from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';

const heroStats = [
    {
        label: "Reach",
        value: "10k+",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#be0919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#be0919]">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        chart: (
            <svg viewBox="0 0 180 150" width="100%" height="auto" className="w-full h-auto mt-2">
                {/* Y-axis Gridlines */}
                <line x1="25" y1="10" x2="175" y2="10" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="48.3" x2="175" y2="48.3" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="86.6" x2="175" y2="86.6" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="125" x2="175" y2="125" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                {/* Y-axis Labels */}
                <text x="20" y="13" fill="#ffffff" fontSize="8.5" textAnchor="end">15k</text>
                <text x="20" y="51.3" fill="#ffffff" fontSize="8.5" textAnchor="end">10k</text>
                <text x="20" y="89.6" fill="#ffffff" fontSize="8.5" textAnchor="end">5k</text>
                <text x="20" y="128" fill="#ffffff" fontSize="8.5" textAnchor="end">0</text>

                {/* Bars */}
                <rect x="32" y="63.7" width="8" height="61.3" rx="2" fill="#be0919" />
                <rect x="53" y="40.7" width="8" height="84.3" rx="2" fill="#be0919" />
                <rect x="74" y="63.7" width="8" height="61.3" rx="2" fill="#be0919" />
                <rect x="95" y="33" width="8" height="92" rx="2" fill="#be0919" />
                <rect x="116" y="52.2" width="8" height="72.8" rx="2" fill="#be0919" />
                <rect x="137" y="79" width="8" height="46" rx="2" fill="#be0919" />
                <rect x="158" y="33" width="8" height="92" rx="2" fill="#be0919" />

                {/* X-axis Labels */}
                <text x="36" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Mon</text>
                <text x="57" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Tue</text>
                <text x="78" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Wed</text>
                <text x="99" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Thu</text>
                <text x="120" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Fri</text>
                <text x="141" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Sat</text>
                <text x="162" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Sun</text>
            </svg>
        )
    },
    {
        label: "Projects",
        value: "500+",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#be0919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#be0919]">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="12" y1="7" x2="12" y2="7.01" />
                <line x1="12" y1="14" x2="12" y2="14.01" />
                <path d="M6 21h12" />
            </svg>
        ),
        chart: (
            <svg viewBox="0 0 180 150" width="100%" height="auto" className="w-full h-auto mt-2">
                <defs>
                    <linearGradient id="projectsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#be0919" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#be0919" stopOpacity="0.01" />
                    </linearGradient>
                </defs>
                {/* Y-axis Gridlines */}
                <line x1="25" y1="10" x2="175" y2="10" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="48.3" x2="175" y2="48.3" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="86.6" x2="175" y2="86.6" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="125" x2="175" y2="125" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                {/* Y-axis Labels */}
                <text x="20" y="13" fill="#ffffff" fontSize="8.5" textAnchor="end">750</text>
                <text x="20" y="51.3" fill="#ffffff" fontSize="8.5" textAnchor="end">500</text>
                <text x="20" y="89.6" fill="#ffffff" fontSize="8.5" textAnchor="end">250</text>
                <text x="20" y="128" fill="#ffffff" fontSize="8.5" textAnchor="end">0</text>

                {/* Shaded Area */}
                <path d="M 36 109.7 L 57 75.9 L 78 82.1 L 99 45.3 L 120 40.7 L 141 28.4 L 162 16.1 L 162 125 L 36 125 Z" fill="url(#projectsGrad)" />

                {/* Line */}
                <path d="M 36 109.7 L 57 75.9 L 78 82.1 L 99 45.3 L 120 40.7 L 141 28.4 L 162 16.1" fill="none" stroke="#be0919" strokeWidth="1.5" />

                {/* Data Points */}
                <circle cx="36" cy="109.7" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="57" cy="75.9" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="78" cy="82.1" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="99" cy="45.3" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="120" cy="40.7" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="141" cy="28.4" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="162" cy="16.1" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />

                {/* X-axis Labels */}
                <text x="36" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Mon</text>
                <text x="57" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Tue</text>
                <text x="78" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Wed</text>
                <text x="99" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Thu</text>
                <text x="120" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Fri</text>
                <text x="141" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Sat</text>
                <text x="162" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Sun</text>
            </svg>
        )
    },
    {
        label: "Clients",
        value: "120+",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#be0919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#be0919]">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        chart: (
            <svg viewBox="0 0 180 150" width="100%" height="auto" className="w-full h-auto mt-2">
                <defs>
                    <linearGradient id="clientsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#be0919" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#be0919" stopOpacity="0.01" />
                    </linearGradient>
                </defs>
                {/* Y-axis Gridlines */}
                <line x1="25" y1="10" x2="175" y2="10" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="48.3" x2="175" y2="48.3" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="86.6" x2="175" y2="86.6" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="25" y1="125" x2="175" y2="125" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                {/* Y-axis Labels */}
                <text x="20" y="13" fill="#ffffff" fontSize="8.5" textAnchor="end">180</text>
                <text x="20" y="51.3" fill="#ffffff" fontSize="8.5" textAnchor="end">120</text>
                <text x="20" y="89.6" fill="#ffffff" fontSize="8.5" textAnchor="end">60</text>
                <text x="20" y="128" fill="#ffffff" fontSize="8.5" textAnchor="end">0</text>

                {/* Shaded Area - Spline */}
                <path d="M 36 112 C 45 104, 50 86, 57 84 C 64 82, 71 66, 78 64 C 85 62, 92 73, 99 71 C 106 69, 113 31, 120 29 C 127 27, 134 29, 141 32 C 148 35, 155 39, 162 42 L 162 125 L 36 125 Z" fill="url(#clientsGrad)" />

                {/* Line - Spline */}
                <path d="M 36 112 C 45 104, 50 86, 57 84 C 64 82, 71 66, 78 64 C 85 62, 92 73, 99 71 C 106 69, 113 31, 120 29 C 127 27, 134 29, 141 32 C 148 35, 155 39, 162 42" fill="none" stroke="#be0919" strokeWidth="1.5" />

                {/* Data Points */}
                <circle cx="36" cy="112" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="57" cy="84" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="78" cy="64" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="99" cy="71" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="120" cy="29" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="141" cy="32" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />
                <circle cx="162" cy="42" r="3" fill="#be0919" stroke="#ffffff" strokeWidth="1" />

                {/* X-axis Labels */}
                <text x="36" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Mon</text>
                <text x="57" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Tue</text>
                <text x="78" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Wed</text>
                <text x="99" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Thu</text>
                <text x="120" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Fri</text>
                <text x="141" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Sat</text>
                <text x="162" y="142" fill="#ffffff" fontSize="8" textAnchor="middle">Sun</text>
            </svg>
        )
    },
    {
        label: "Satisfaction",
        value: "99%",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#be0919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#be0919]">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        chart: (
            <svg viewBox="0 0 180 150" width="100%" height="auto" className="w-full h-auto mt-2">
                {/* Background Track Circle */}
                <circle cx="90" cy="68" r="52" fill="none" stroke="rgba(190, 9, 25, 0.08)" strokeWidth="10" />

                {/* Active Circle (99% coverage, visible gap, no rounded caps to overlap gap) */}
                {/* Circumference = 2 * PI * 52 = 326.73 */}
                {/* Dasharray = 326.73, Dashoffset = 326.73 * 0.02 = 6.53 */}
                <circle cx="90" cy="68" r="52" fill="none" stroke="#be0919" strokeWidth="10"
                    strokeDasharray="326.73" strokeDashoffset="6.5"
                    transform="rotate(-90 90 68)" />

                {/* Inner Text */}
                <text x="90" y="77" fill="#ffffff" fontSize="24" fontWeight="bold" textAnchor="middle">99%</text>

                {/* Bottom Label */}
                <text x="90" y="138" fill="#ffffff" fontSize="9" textAnchor="middle">Positive Feedback</text>
            </svg>
        )
    }
];

export default function HomeHero() {
    return (
        <section className="w-full relative min-h-screen flex items-center pt-15 pb-20">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#be0919]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="max-w-[1350px] mx-auto px-6 lg:px-12 w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    <div className="lg:col-span-8 flex flex-col justify-center">
                        <Title as="h1" className="text-5xl sm:text-6xl lg:text-[57px] font-['Glacial'] font-bold leading-[1.05] tracking-tight mb-8">
                            More Than<br /> Development Pure<br />
                            Digital <span className="text-[#be0919] font-bold">Craftsmanship</span>
                        </Title>
                        <p className="text-[#ffffff] text-[16px] leading-[1.8] max-w-[600px] mb-16">
                            Designing and developing intelligent software solutions that combine clean architecture, modern technology, and seamless user experiences to help businesses grow with confidence and scalability.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8 max-w-[1050px] w-full mt-12">
                            {heroStats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="relative stats-card rounded-2xl p-5 flex flex-col cursor-default"
                                >

                                    <div className="flex items-start gap-2.5 mb-3.5">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {stat.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-white/90 font-bold text-[14px] sm:text-[16px] leading-none mb-1.5">
                                                {stat.label}
                                            </h4>
                                            <p className="text-[#be0919] font-bold text-[22px] sm:text-[26px] leading-none tracking-tight">
                                                {stat.value}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full mt-auto">
                                        {stat.chart}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 relative h-[550px] lg:h-[680px] flex items-center justify-center">
                        <div className="relative w-[350px] h-[350px] lg:w-[480px] lg:h-[480px] z-10 animate-[spin_60s_linear_infinite]">
                            <Image src="/assets/home/home-hero-red-gear.png" alt="3D Red Gear" fill className="object-contain" priority />
                        </div>
                        <div className="absolute top-[10%] left-0 w-[150px] h-[150px] z-20 animate-[bounce_4s_infinite_ease-in-out]">
                            <Image src="/assets/home/home-hero-silver-c.png" alt="Silver Shape" fill className="object-contain" />
                        </div>
                        <div className="absolute bottom-[5%] right-[-5%] w-[120px] h-[120px] z-20 animate-[bounce_5s_infinite_ease-in-out_reverse]">
                            <Image src="/assets/home/home-hero-cube.png" alt="Silver Cube" fill className="object-contain" />
                        </div>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-white/20 mt-10"></div>
            </div>
        </section>
    );
}
