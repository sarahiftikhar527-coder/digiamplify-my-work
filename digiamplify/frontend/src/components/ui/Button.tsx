import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subscribe' | 'outline' | 'ghost';
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {

  // Base styles shared by all buttons
  const baseStyles = 'rounded-[50px] transition-all duration-300 flex items-center justify-center cursor-pointer';


  const variants = {
    primary: 'bg-[#be0919] hover:bg-[#990714] text-white py-2.5 px-6 text-[0.9rem] font-semibold',
    secondary: 'bg-[#be0919] hover:bg-[#990714] text-white py-3 px-10 text-[0.95rem] font-semibold',
    subscribe: 'bg-[#be0919] hover:bg-[#990714] text-white py-3 px-10 text-[0.85rem] font-medium',
    outline: 'bg-transparent text-white hover:bg-[#be0919] py-3 px-10 text-[0.95rem] font-semibold',
    ghost: 'bg-transparent text-white hover:text-[#be0919] hover:bg-white/5 py-3 px-10 text-[0.95rem] font-semibold'
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