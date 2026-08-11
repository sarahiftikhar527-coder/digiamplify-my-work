import React from 'react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function BlogPagination({
  currentPage,
  totalPages,
  onPageChange
}: BlogPaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mb-20">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className={`w-8 h-8 flex items-center justify-center border border-[#333] rounded-md hover:border-white transition-colors cursor-pointer ${
          currentPage === 1 ? 'opacity-50 pointer-events-none' : 'text-white'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button 
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
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
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className={`w-8 h-8 flex items-center justify-center border border-[#333] rounded-md hover:border-white transition-colors cursor-pointer ${
          currentPage === totalPages ? 'opacity-50 pointer-events-none' : 'text-white'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
