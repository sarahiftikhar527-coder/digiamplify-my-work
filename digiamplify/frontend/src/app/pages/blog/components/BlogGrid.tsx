import React from 'react';
import Image from 'next/image';

interface BlogPost {
  title: string;
  desc: string;
  author: string;
  date: string;
  category: string;
  image: string;
}

interface BlogGridProps {
  posts: BlogPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {posts.map((post, index) => (
        <div key={index} className="flex flex-col group cursor-pointer">
         
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
  );
}
