'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Title from '@/components/ui/Title';
import Button from '@/components/ui/Button';
import Newsletter from '@/components/ui/Newsletter';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("View All");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const categories = ["View All", "Design", "Social Media", "AI Automation", "Marketing", "Video Editing", "Web"];
  
  const blogPosts = [
    {
      title: "UI/UX Design Review",
      desc: "Our design process focuses on blending aesthetic appeal with seamless functionality to create engaging digital platforms. Every interface is crafted with deep understanding of user behavior, ensuring intuitive navigation always.",
      author: "Sarah Jenkins",
      date: "12 May 2026",
      category: "Design",
      image: "/assets/blog/blog-1.jpg"
    },
    {
      title: "Social Media Strategy",
      desc: "Our marketing approach centers on building authentic connections with your audience across multiple digital channels. Every campaign is developed with clear performance metrics in mind, driving meaningful engagement and growth.",
      author: "David Ross",
      date: "18 May 2026",
      category: "Social Media",
      image: "/assets/blog/blog-2.jpg"
    },
    {
      title: "AI Automation Basics",
      desc: "Our automation solutions streamline complex business workflows to improve overall efficiency and reduce manual overhead. Every system is implemented with strict security protocols in place, guaranteeing safe operations and scalability.",
      author: "Alex Chen",
      date: "25 May 2026",
      category: "AI Automation",
      image: "/assets/blog/blog-3.jpg"
    },
    {
      title: "Future Of Marketing",
      desc: "Our advertising methodology relies on analyzing deep consumer insights to craft highly targeted promotional materials. Every initiative is optimized with real-time conversion data, maximizing return on investment and market reach.",
      author: "Emma Watson",
      date: "02 June 2026",
      category: "Marketing",
      image: "/assets/blog/blog-4.jpg"
    },
    {
      title: "Video Editing Trends",
      desc: "Our production team excels at transforming raw visual footage into compelling narratives that captivate viewers. Every video is polished with advanced color grading techniques, delivering cinematic quality and brand consistency.",
      author: "Marcus Aurelius",
      date: "08 June 2026",
      category: "Video Editing",
      image: "/assets/blog/blog-5.jpg"
    },
    {
      title: "Web Development Guide",
      desc: "Our engineering standards prioritize building robust architectures that guarantee fast load times and cross-browser compatibility. Every application is tested with rigorous quality assurance processes, providing reliable performance and user satisfaction.",
      author: "Sophia Loren",
      date: "15 June 2026",
      category: "Web",
      image: "/assets/blog/blog-6.jpg"
    }
  ];

  const filteredPosts = selectedCategory === "View All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

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
              src="/assets/blog/silver-ring.png" 
              alt="3D Silver Ring" 
              width={228} 
              height={222} 
              className="object-contain -rotate-100 n hover:scale-105 transition-transform duration-700 animate-[spin_30s_linear_infinite] -rotate-[25deg]"
            />
          </div>
        </div>

        {}
        <div className="flex flex-wrap gap-8 lg:gap-12 mb-12 border-b border-[#222] pb-2">
          {categories.map((category, index) => {
            const isActive = selectedCategory === category;
            return (
              <button 
                key={index}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`text-[16px] font-poppins font-medium font-semibold pb-2 transition-colors duration-200 relative cursor-pointer ${
                  isActive ? 'text-white' : 'text-[#888] hover:text-[#ccc]'
                }`}
              >
                {category}
                {isActive && (
                  <span className="absolute bottom-[-3px] left-0 right-0 h-[2px] bg-white rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {currentPosts.map((post, index) => (
            <div key={index} className="flex flex-col group cursor-pointer">
             
              {}
              <div className="relative h-[220px] w-full rounded-xl overflow-hidden mb-5">
                <Image 
                  src={post.image}
                  alt="Blog thumbnail" 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-black/40 backdrop-blur-md flex justify-between items-center px-5 border-t border-white/10">
                  <div className="flex flex-col">
                  
                    <span className="text-white text-[14px] font-semibold tracking-wide">{post.author}</span>
        
                    <span className="text-[#FFFFFF] text-[12px] font-regular">{post.date}</span>
                  </div>
    
                  <span className="text-white text-[14px] font-regular uppercase tracking-wider">{post.category}</span>
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
        {filteredPosts.length > postsPerPage && (
          <div className="flex justify-center items-center gap-2 mb-20">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`w-8 h-8 flex items-center justify-center border border-[#333] rounded-md hover:border-white transition-colors cursor-pointer ${
                currentPage === 1 ? 'opacity-50 pointer-events-none' : 'text-white'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button 
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-md font-medium text-[0.85rem] cursor-pointer transition-colors ${
                  currentPage === pageNum 
                    ? 'bg-[#be0919] text-white' 
                    : 'border border-[#333] text-white hover:border-white'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={`w-8 h-8 flex items-center justify-center border border-[#333] rounded-md hover:border-white transition-colors cursor-pointer ${
                currentPage === totalPages ? 'opacity-50 pointer-events-none' : 'text-white'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        )}

        {}
        <Newsletter />

      </div>
    </div>
  );
}