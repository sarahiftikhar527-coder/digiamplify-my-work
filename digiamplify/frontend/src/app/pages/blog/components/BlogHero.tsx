import React from 'react';
import Title from '@/components/ui/Title';

export default function BlogHero() {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-10">
      <Title as="h1" className="text-6xl lg:text-[5rem] tracking-wide shrink-0">
        Our <span className="text-[#be0919]">Blogs</span>
      </Title>
      <p className="text-white/50 text-[13px] leading-relaxed max-w-xl lg:text-left">
        Our portfolio showcases a carefully curated selection of projects that reflect our creativity, strategy, and technical expertise. Each work is designed with a focus on performance, user experience, and measurable results. We aim to deliver solutions that not only look exceptional but also create real business impact. This collection represents our commitment to quality, innovation, and continuous improvement.
      </p>
    </div>
  );
}
