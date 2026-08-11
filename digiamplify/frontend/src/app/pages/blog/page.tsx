'use client';

import React, { useState } from 'react';
import BlogHero from './components/BlogHero';
import BlogSearch from './components/BlogSearch';
import BlogCategories from './components/BlogCategories';
import BlogGrid from './components/BlogGrid';
import BlogPagination from './components/BlogPagination';
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
        
        <BlogHero />
        <BlogSearch />
        
        <BlogCategories 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            setCurrentPage(1);
          }}
        />

        <BlogGrid posts={currentPosts} />

        {filteredPosts.length > postsPerPage && (
          <BlogPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        <Newsletter />

      </div>
    </div>
  );
}