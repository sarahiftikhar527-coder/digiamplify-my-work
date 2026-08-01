import Image from 'next/image';
import Title from '@/components/ui/Title';
import Button from '@/components/ui/Button';
import Newsletter from '@/components/ui/Newsletter';

export default function BlogPage() {
  const categories = ["View All", "Design", "Social Media", "AI Automation", "Marketing", "Video Editing"];
  
  const blogPosts = [
    {
      title: "UI/UX Design Review",
      desc: "Our design process focuses on blending aesthetic appeal with seamless functionality to create engaging digital platforms. Every interface is crafted with deep understanding of user behavior, ensuring intuitive navigation always."
    },
    {
      title: "Social Media Strategy",
      desc: "Our marketing approach centers on building authentic connections with your audience across multiple digital channels. Every campaign is developed with clear performance metrics in mind, driving meaningful engagement and growth."
    },
    {
      title: "AI Automation Basics",
      desc: "Our automation solutions streamline complex business workflows to improve overall efficiency and reduce manual overhead. Every system is implemented with strict security protocols in place, guaranteeing safe operations and scalability."
    },
    {
      title: "Future Of Marketing",
      desc: "Our advertising methodology relies on analyzing deep consumer insights to craft highly targeted promotional materials. Every initiative is optimized with real-time conversion data, maximizing return on investment and market reach."
    },
    {
      title: "Video Editing Trends",
      desc: "Our production team excels at transforming raw visual footage into compelling narratives that captivate viewers. Every video is polished with advanced color grading techniques, delivering cinematic quality and brand consistency."
    },
    {
      title: "Web Development Guide",
      desc: "Our engineering standards prioritize building robust architectures that guarantee fast load times and cross-browser compatibility. Every application is tested with rigorous quality assurance processes, providing reliable performance and user satisfaction."
    }
  ];

  return (
    <div className="w-full bg-[#0d0d0d] min-h-screen text-white">
      <div className="max-w-[1200px] mx-auto pt-24 pb-20 px-6 lg:px-8 font-sans w-full">
        
        {}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-10">
          <Title as="h1" className="text-6xl lg:text-[5rem] tracking-wide shrink-0">
            Our <span className="text-[#be0919]">Blogs</span>
          </Title>
          <p className="text-white/50 text-[13px] leading-relaxed max-w-xl lg:text-left">
            Our portfolio showcases a carefully curated selection of projects that reflect our creativity, strategy, and technical expertise. Each work is designed with a focus on performance, user experience, and measurable results. We aim to deliver solutions that not only look exceptional but also create real business impact. This collection represents our commitment to quality, innovation, and continuous improvement.
          </p>
        </div>

        {}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          
          <div className="relative w-full md:w-[420px]">
            <input 
              type="text" 
              placeholder="Search blog..." 
              className="bg-transparent border border-2 border-[#FFFFFF] text-white py-2 pl-10 pr-[140px] rounded-full w-full text-[16px] focus:outline-none focus:border-[#aaa] transition-colors font-poppins"
            />
         
            <Button 
              variant="primary" 
              className="absolute top-0 right-0 h-full px-10 rounded-full"
            >
              Search
            </Button>
          </div>

          <div className="hidden md:block shrink-0">
            <Image 
              src="/assets/silver-ring.png" 
              alt="3D Silver Ring" 
              width={228} 
              height={222} 
              className="object-contain -rotate-100 n hover:scale-105 transition-transform duration-700 animate-[spin_30s_linear_infinite] -rotate-[25deg]"
            />
          </div>
        </div>

        {}
        <div className="flex flex-wrap gap-8 lg:gap-12 mb-12 border-b border-[#222] pb-2">
          {categories.map((category, index) => (
            <button 
              key={index}
              className={`text-[16px] font-poppins font-medium font-semibold pb-2 transition-colors duration-200 relative ${
                index === 0 ? 'text-white' : 'text-[#888] hover:text-[#ccc]'
              }`}
            >
              {category}
              {index === 0 && (
                <span className="absolute bottom-[-3px] left-0 right-0 h-[2px] bg-white rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post, index) => (
            <div key={index} className="flex flex-col group cursor-pointer">
             
              {}
              <div className="relative h-[220px] w-full rounded-xl overflow-hidden mb-5">
                <Image 
                  src={`/assets/blog-${index + 1}.jpg`}
                  alt="Blog thumbnail" 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-black/40 backdrop-blur-md flex justify-between items-center px-5 border-t border-white/10">
                  <div className="flex flex-col">
                 
                    <span className="text-white text-[14px] font-semibold tracking-wide">Jhon mari</span>
        
                    <span className="text-[#FFFFFF] text-[12px] font-regular">10 June 2026</span>
                  </div>
    
                  <span className="text-white text-[14px] font-regular uppercase tracking-wider">Design</span>
                </div>
              </div>
              
              {}
              <h3 className="text-[16px] font-semibold text-white mb-3 tracking-wide">{post.title}</h3>
              <p className="text-white/50 text-[13px] leading-relaxed mb-4">
                {post.desc}
              </p>
              
              <div className="flex items-center gap-1 text-white text-[0.85rem] font-medium transition-colors group-hover:text-[#be0919]">
                Read Post 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="flex justify-center items-center gap-2 mb-20">
          <button className="w-8 h-8 flex items-center justify-center border border-[#333] text-[#888] rounded-md hover:border-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-[#be0919] text-white rounded-md font-medium text-[0.85rem]">1</button>
          <button className="w-8 h-8 flex items-center justify-center border border-[#333] text-white rounded-md hover:border-white transition-colors font-medium text-[0.85rem]">2</button>
          <button className="w-8 h-8 flex items-center justify-center border border-[#333] text-white rounded-md hover:border-white transition-colors font-medium text-[0.85rem]">3</button>
          <button className="w-8 h-8 flex items-center justify-center border border-[#333] text-[#888] rounded-md hover:border-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        {}
        <Newsletter />

      </div>
    </div>
  );
}