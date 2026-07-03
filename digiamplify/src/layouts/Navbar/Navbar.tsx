'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path ? styles.activeLink : '';

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.navbarWrapper}>
      <nav className={styles.navbar}>
        
        <Link href="/" className={styles.logoLink}>
          <Image 
            src="/assets/logo.png" 
            alt="DigiAmplify Logo"
            width={160} 
            height={36}  
            priority
          />
        </Link>
        
        {/* Hamburger Menu Toggle */}
        <button 
          className={styles.menuToggle} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            /* Standard White Close "X" Icon */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            /* Standard White Hamburger Icon */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
        
        <div className={`${styles.links} ${isMenuOpen ? styles.mobileOpen : ''}`}>
          <Link href="/" className={isActive('/')} onClick={handleLinkClick}>Home</Link>
          <Link href="/about" className={isActive('/about')} onClick={handleLinkClick}>About</Link>
          <Link href="/services" className={isActive('/services')} onClick={handleLinkClick}>Services</Link>
          <Link href="/projects" className={isActive('/projects')} onClick={handleLinkClick}>Projects</Link>
          <Link href="/blog" className={isActive('/blog')} onClick={handleLinkClick}>Blog</Link>
          <Link href="/contact" className={isActive('/contact')} onClick={handleLinkClick}>Contact Us</Link>
          
          {/* Login Button for Mobile View */}
          <button className={`${styles.loginBtn} ${styles.mobileLogin}`}>Login</button>
        </div>
        
        {/* Login Button for Desktop View */}
        <button className={`${styles.loginBtn} ${styles.desktopLogin}`}>Login</button>

      </nav>
    </div>
  );
}