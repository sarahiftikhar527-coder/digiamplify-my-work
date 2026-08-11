import React from 'react';

interface BlogCategoriesProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function BlogCategories({
  categories,
  selectedCategory,
  onSelectCategory
}: BlogCategoriesProps) {
  return (
    <div className="flex flex-wrap gap-8 lg:gap-12 mb-12 border-b border-[#222] pb-2">
      {categories.map((category, index) => {
        const isActive = selectedCategory === category;
        return (
          <button 
            key={index}
            onClick={() => onSelectCategory(category)}
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
  );
}
