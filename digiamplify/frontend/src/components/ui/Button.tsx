import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subscribe';
  className?: string;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  
  // Base styles shared by all buttons
  const baseStyles = 'bg-[#be0919] hover:bg-[#990714] text-white rounded-[50px] transition-colors duration-200 flex items-center justify-center';
  
  // Specific size and text variations
  const variants = {
    primary: 'py-2.5 px-6 text-[0.9rem] font-semibold',       
    secondary: 'py-3 px-10 text-[0.95rem] font-semibold',     
    subscribe: 'py-3 px-10 text-[0.85rem] font-medium'        
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}