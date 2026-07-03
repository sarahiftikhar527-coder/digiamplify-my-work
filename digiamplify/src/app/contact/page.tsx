import Image from 'next/image';
import ContactForm from '@/components/ContactForm/ContactForm';
import styles from './page.module.css';

export default function ContactPage() {
  return (
    <div className={styles.wrapper}>
      
      {/* Hero Header Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 className={styles.pageTitle}>Contact <span className={styles.redText}>Us</span></h1>
          <p className={styles.description}>
            Whether you're looking to launch a new project, enhance your digital presence, or explore innovative solutions, our team is here to help. We believe great partnerships begin with meaningful conversations, and we're always ready to discuss your goals, challenges, and opportunities for growth.
          </p>

          <div className={styles.secondaryTextSection}>
            <div className={styles.cubeWrapper}>
              <Image 
                src="/assets/cube.png" 
                alt="3D Glowing Cube" 
                width={180} 
                height={180}
                className={styles.cubeImage} 
              />
            </div>
            <p className={styles.subParagraph}>
              With a commitment to transparency, quality, and results, we work closely with every client to ensure a smooth and successful experience. Your goals become our priority and every solution is crafted with care, precision, and a focus on long-term value.
            </p>
          </div>
        </div>

        <div className={styles.imageCollage}>
          <div className={styles.smallImageFrame}>
            <Image 
              src="/assets/agent-photo.jpg" 
              alt="Support agent" 
              fill 
              sizes="160px"
              className={styles.collageImg} 
            />
          </div>
          <div className={styles.largeImageFrame}>
            <Image 
              src="/assets/office-meeting.jpg" 
              alt="Team meeting" 
              fill 
              sizes="320px"
              className={styles.collageImg} 
            />
          </div>
        </div>
      </header>

      <ContactForm />

      {/* Grid of Basic Meta-Info Contacts cards */}
      <section className={styles.infoCardsGrid}>
        
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <svg className={styles.redIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span className={styles.cardLabel}>PHONE</span>
          </div>
          <p className={styles.cardValue}>12345678900</p>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <svg className={styles.redIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span className={styles.cardLabel}>EMAIL</span>
          </div>
          <p className={styles.cardValue}>name@gmail.com</p>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <svg className={styles.redIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className={styles.cardLabel}>OFFICE</span>
          </div>
          <p className={styles.cardValue}>London</p>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <svg className={styles.redIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span className={styles.cardLabel}>SOCIAL</span>
          </div>
          <p className={styles.cardValue}>LinkedIn, Instagram</p>
        </div>

      </section>

      {/* The Quarterly Newsletter Banner Section */}
      <section className={styles.newsletterBar}>
        <div className={styles.newsletterLeft}>
          <h3>The Quarterly note for ambitious brands</h3>
          <p>Occasional insight in digital positioning, launch strategy and premium experience Design.</p>
        </div>
        <div className={styles.newsletterRight}>
          <input type="email" placeholder="Enter your Email" className={styles.newsInput} />
          <button className={styles.subscribeBtn}>Subscribe</button>
        </div>
      </section>
      
      <p className={styles.finePrint}>We respect your inbox. No noise. No spam. Only strategic perspective.</p>
    </div>
  );
}