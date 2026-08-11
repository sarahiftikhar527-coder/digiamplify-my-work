import React from 'react';
import Title from '@/components/ui/Title';
import { Share2, RotateCw, Settings, Rocket } from 'lucide-react';

const metricsData = [
    {
        icon: Share2,
        title: "Qualified pipelines",
        value: "+214%",
        desc: "Accelerating inbound revenue opportunities through targeted outbound strategies and high-converting funnel optimizations."
    },
    {
        icon: RotateCw,
        title: "Retention Lift",
        value: "+37%",
        desc: "Improving customer lifetime value by optimizing user onboarding experiences and building engaging product feature flows."
    },
    {
        icon: Settings,
        title: "Lead Quality",
        value: "+62%",
        desc: "Filtering prospect traffic to deliver highly intent-driven leads directly to your sales development pipeline."
    },
    {
        icon: Rocket,
        title: "Launch velocity",
        value: "2.8x",
        desc: "Streamlining product development cycles to ship scalable digital products faster without sacrificing overall quality."
    }
];

const MiniBarChart = () => (
    <div className="flex items-end gap-1.5 h-14 mb-5">
        <div className="w-2.5 h-4 bg-[#2f2d2d] rounded-sm"></div>
        <div className="w-2.5 h-6 bg-[#474545] rounded-sm"></div>
        <div className="w-2.5 h-8 bg-[#606060] rounded-sm"></div>
        <div className="w-2.5 h-11 bg-[#be0919]/30 rounded-sm"></div>
        <div className="w-2.5 h-14 bg-[#be0919] rounded-sm shadow-[0_0_10px_rgba(190,9,25,0.5)]"></div>
    </div>
);

export default function HomeMetrics() {
    return (
        <section className="w-full py-15 bg-[#050505] overflow-hidden">
            <div className="max-w-[1350px] mx-auto px-6 lg:px-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                    <div className="lg:col-span-4 flex flex-col justify-between pr-0 lg:pr-6">

                        <div>
                            <Title as="h2" className="text-3xl sm:text-4xl lg:text-[41px] font-medium leading-[1.2] tracking-tight text-white mb-8">
                                <span className="block">Numbers Presented</span>
                                <span className="block">with the same</span>
                                <span className="block">confidence as the</span>
                                <span className="block text-[#be0919]">visuals system.</span>
                            </Title>

                            <p className="text-[#ffffff] text-[15px] leading-[1.7] mb-12 max-w-[400px]">
                                We combine enterprise-level discipline with a refined creative approach to deliver high-quality digital solutions, ensuring every project is executed
                            </p>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 w-full">
                            <p className="text-white/60 text-[12px] mb-6">Performance</p>

                            <div className="grid grid-cols-2 gap-6">

                                <div className="flex flex-col items-center text-center">
                                    <h4 className="text-[#be0919] text-3xl text-[30px] font-semibold mb-3">4.2 X</h4>
                                    <p className="text-[#ffffff] text-[10px] font-medium tracking-wide whitespace-nowrap mb-5">
                                        Average conversation uplift
                                    </p>
                                </div>

                                <div className="flex flex-col items-center text-center">
                                    <h4 className="text-[#be0919] text-3xl text-[30px] font-semibold mb-3">91%</h4>
                                    <p className="text-[#ffffff] text-[10px] font-medium tracking-wide">
                                        Repeat engagement rate
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            {metricsData.map((metric, index) => {
                                const Icon = metric.icon;
                                return (
                                    <div
                                        key={index}
                                        className="relative bg-[#0a0a0a] border border-white/20 rounded-3xl p-7 lg:px-8 py-4 overflow-hidden group hover:border-[#be0919]/50 transition-colors duration-300"
                                    >
                                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#be0919] opacity-[0.08] blur-[50px] rounded-full pointer-events-none group-hover:opacity-[0.15] transition-opacity duration-500"></div>

                                        <div className="flex items-center gap-3 mb-6 relative z-10">
                                            <div className="w-10 h-10 rounded-full border border-[#be0919]/30 flex items-center justify-center bg-[#be0919]/5 text-[#be0919]">
                                                <Icon size={20} strokeWidth={1.5} />
                                            </div>
                                            <span className="text-[#ffffff] text-[16px] font-regular font-['Glacial']">{metric.title}</span>
                                        </div>

                                        <div className="flex justify-between items-end relative z-10">
                                            <div className="max-w-[180px] xl:max-w-[220px]">
                                                <h3 className="text-white text-4xl lg:text-[46px] font-medium font-['Glacial'] mb-4">
                                                    {metric.value}
                                                </h3>
                                                <p className="text-[#ffffff] text-[14px] leading-[1.7] max-w-[190px]">
                                                    {metric.desc}
                                                </p>
                                            </div>

                                            <MiniBarChart />
                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
