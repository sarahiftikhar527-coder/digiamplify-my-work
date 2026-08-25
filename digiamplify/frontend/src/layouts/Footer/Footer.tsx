'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/pages/login' || pathname === '/signup' || pathname === '/pages/signup' || pathname?.includes('/portal') || pathname?.includes('/admin')) {
    return null;
  }
  let pageFolder = 'home';
  if (pathname?.includes('/about')) pageFolder = 'about';
  else if (pathname?.includes('/services')) pageFolder = 'services';
  else if (pathname?.includes('/projects')) pageFolder = 'projects';
  else if (pathname?.includes('/blog')) pageFolder = 'blog';
  else if (pathname?.includes('/contact')) pageFolder = 'contact';

  const logoSrc = `/assets/${pageFolder}/logo.png`;

  return (
    <footer className="bg-black border-t border-[#1f1f1f] pt-20 pb-24 px-8 relative overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[100%] lg:after:w-[80%] after:h-[150px] after:bg-[radial-gradient(ellipse_at_bottom,rgba(190,9,25,0.18)_0%,rgba(0,0,0,0)_70%)] after:pointer-events-none after:z-0">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-14 lg:gap-8 relative z-10">

        <div className="flex flex-col gap-4 items-start max-lg:items-center max-lg:text-center">
          <Link href="/" className="flex items-center mb-2">
            <Image
              src={logoSrc}
              alt="DigiAmplify Logo"
              width={160}
              height={36}
            />
          </Link>
          <p className="text-[#a3a3a3] text-[0.9rem] leading-relaxed max-w-[320px]">
            Empowering businesses with innovative digital solutions, strategic marketing, and technology-driven growth.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">

          <div className="flex flex-col gap-5 items-center text-center">
            <h4 className="text-[#777777] text-[0.9rem] uppercase tracking-wider font-medium">Company</h4>
            <ul className="flex flex-col gap-3.5 w-full">
              <li><Link href="/" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Home</Link></li>
              <li><Link href="/about" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">About</Link></li>
              <li><Link href="/services" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Service</Link></li>
              <li><Link href="/projects" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Projects</Link></li>
              <li><Link href="/blog" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Blog</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-5 items-center text-center">
            <h4 className="text-[#777777] text-[0.9rem] uppercase tracking-wider font-medium">Services</h4>
            <ul className="flex flex-col gap-3.5 w-full">
              <li><Link href="/services/b2b-marketing" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">B2B, B2C</Link></li>
              <li><Link href="/services/video-editing" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Video Editing</Link></li>
              <li><Link href="/services/ads" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Google / Meta Ads</Link></li>
              <li><Link href="/services/ai-automation" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">AI Automation</Link></li>
              <li><Link href="/services/graphic-design" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Graphic Designing</Link></li>
              <li><Link href="/services/ui-ux-design" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">UI/UX Design</Link></li>
              <li><Link href="/services/social-media" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Social Media Management</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-5 items-center text-center">
            <h4 className="text-[#777777] text-[0.9rem] uppercase tracking-wider font-medium">Support</h4>
            <ul className="flex flex-col gap-3.5 w-full">
              <li><Link href="/contact" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Contact</Link></li>
              <li><Link href="https://linkedin.com/company/digiamplify" target="_blank" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">LinkedIn</Link></li>
              <li><Link href="/privacy" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Terms</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-5 items-center text-center">
            <h4 className="text-[#777777] text-[0.9rem] uppercase tracking-wider font-medium">Resources</h4>
            <ul className="flex flex-col gap-3.5 w-full">
              <li><Link href="/case-studies" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Case Studies</Link></li>
              <li><Link href="/insights" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Insights</Link></li>
              <li><Link href="/deck" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Capabilities Deck</Link></li>
              <li><Link href="/newsletter" className="text-white text-[0.9rem] transition-colors duration-200 hover:text-[#be0919]">Newsletter</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}