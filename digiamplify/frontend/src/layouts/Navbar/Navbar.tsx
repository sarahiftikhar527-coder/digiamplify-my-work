'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname === '/login' || pathname === '/pages/login' || pathname === '/signup' || pathname === '/pages/signup' || pathname?.includes('/portal') || pathname?.includes('/admin')) {
    return null;
  }

  const linkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path));
    return `font-semibold text-[0.99rem] transition-colors duration-200 ${
      isActive ? 'text-[#be0919]' : 'text-white hover:text-[#be0919]'
    }`;
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  let pageFolder = 'home';
  if (pathname?.includes('/about')) pageFolder = 'about';
  else if (pathname?.includes('/services')) pageFolder = 'services';
  else if (pathname?.includes('/projects')) pageFolder = 'projects';
  else if (pathname?.includes('/blog')) pageFolder = 'blog';
  else if (pathname?.includes('/contact')) pageFolder = 'contact';

  const logoSrc = `/assets/${pageFolder}/logo.png`;

  return (
    <div className="w-full flex justify-center pt-8 px-8 max-[480px]:pt-6 max-[480px]:px-4 z-[9999] relative">
      <nav className="flex justify-between items-center w-full max-w-[1200px] bg-[#383838] py-2 pr-2 pl-8 max-[968px]:py-[0.8rem] max-[968px]:px-6 rounded-[50px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">

        <Link href="/" className="flex items-center">
          <Image
            src={logoSrc}
            alt="DigiAmplify Logo"
            width={160}
            height={36}
            priority
          />
        </Link>

        <button
          className="hidden max-[968px]:flex items-center justify-center bg-transparent border-none text-white cursor-pointer p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>

        <div className={`flex gap-10 items-center max-[968px]:absolute max-[968px]:top-[calc(100%+15px)] max-[968px]:left-0 max-[968px]:right-0 max-[968px]:bg-[#2a2a2a] max-[968px]:flex-col max-[968px]:p-8 max-[968px]:rounded-[20px] max-[968px]:shadow-[0_10px_40px_rgba(0,0,0,0.7)] max-[968px]:gap-6 ${isMenuOpen ? 'max-[968px]:flex' : 'max-[968px]:hidden'}`}>

          <Link href="/" className={linkClass('/')} onClick={handleLinkClick}>Home</Link>
          <Link href="/about" className={linkClass('/about')} onClick={handleLinkClick}>About</Link>
          <Link href="/services" className={linkClass('/services')} onClick={handleLinkClick}>Services</Link>
          <Link href="/projects" className={linkClass('/projects')} onClick={handleLinkClick}>Projects</Link>
          <Link href="/blog" className={linkClass('/blog')} onClick={handleLinkClick}>Blog</Link>
          <Link href="/contact" className={linkClass('/contact')} onClick={handleLinkClick}>Contact Us</Link>

          <div className="hidden max-[968px]:flex flex-col gap-3 w-full mt-4">
            <Link href="/login" className="w-full" onClick={handleLinkClick}>
              <Button variant="secondary" className="w-full cursor-pointer">
                Login
              </Button>
            </Link>
            <Link href="/signup" className="w-full" onClick={handleLinkClick}>
              <Button variant="secondary" className="w-full cursor-pointer">
                Signup
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-3 max-[968px]:hidden mr-2">
          <Link href="/login">
            <Button variant="secondary">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary">
              Signup
            </Button>
          </Link>
        </div>

      </nav>
    </div>
  );
}