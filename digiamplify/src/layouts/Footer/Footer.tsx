import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Left Side: Brand Identity */}
        <div className={styles.brandColumn}>
          <Link href="/" className={styles.logoLink}>
            <Image 
              src="/assets/logo.png" 
              alt="DigiAmplify Logo" 
              width={160} 
              height={36} 
            />
          </Link>
          <p className={styles.tagline}>
            Empowering businesses with innovative digital solutions, strategic marketing, and technology-driven growth.
          </p>
        </div>

        {/* Right Side: Links Grid */}
        <div className={styles.linksGrid}>
          
          {/* Column 1: Company */}
          <div className={styles.column}>
            <h4 className={styles.heading}>Company</h4>
            <ul className={styles.list}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/services">Service</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Column 2: Services */}
          <div className={styles.column}>
            <h4 className={styles.heading}>Services</h4>
            <ul className={styles.list}>
              <li><Link href="/services/b2b">B2B, B2C</Link></li>
              <li><Link href="/services/video">Video Editing</Link></li>
              <li><Link href="/services/ads">Google / Meta Ads</Link></li>
              <li><Link href="/services/ai">AI Automation</Link></li>
              <li><Link href="/services/design">Graphic Designing</Link></li>
              <li><Link href="/services/ui-ux">UI/UX Design</Link></li>
              <li><Link href="/services/smm">Social Media Management</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className={styles.column}>
            <h4 className={styles.heading}>Support</h4>
            <ul className={styles.list}>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="https://linkedin.com" target="_blank">LinkedIn</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className={styles.column}>
            <h4 className={styles.heading}>Resources</h4>
            <ul className={styles.list}>
              <li><Link href="/case-studies">Case Studies</Link></li>
              <li><Link href="/insights">Insights</Link></li>
              <li><Link href="/deck">Capabilities Deck</Link></li>
              <li><Link href="/newsletter">Newsletter</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}