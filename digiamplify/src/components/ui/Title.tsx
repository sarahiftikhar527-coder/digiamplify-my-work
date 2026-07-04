import React from 'react';

interface TitleProps {
  as?: 'h1' | 'h2' | 'h3';
  children: React.ReactNode;
  className?: string;
}

export default function Title({ 
  as: Component = 'h2', 
  children, 
  className = '' 
}: TitleProps) {
  
  const baseStyles = 'text-white';

  const sizes = {
    h1: 'text-5xl lg:text-[5.5rem] font-normal tracking-wide',
    h2: "text-3xl lg:text-[2.2rem] font-['Glacial'] leading-[1.3]",
    h3: "text-[2.0rem] font-['Glacial']"
  };

  return (
    <Component className={`${baseStyles} ${sizes[Component]} ${className}`}>
      {children}
    </Component>
  );
}