'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  return (
    <div className={styles.formContainer}>
      
      <div className={styles.mapSidebar}>
        <Image 
          src="/assets/map-img.png" 
          alt="Office locations map" 
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className={styles.mapImage}
          priority
        />
      </div>

      <form onSubmit={() => {}} className={styles.mainForm}>
        
        <div className={styles.titleRow}>
          <div>
            <h2 className={styles.formTitle}>
              Let's turn your next launch into a category defining <span className={styles.highlight}>digital presence.</span>
            </h2>
            <p className={styles.formSubtitle}>
              Share the ambition, timeline, and scope. We will recommend the right engagement model.
            </p>
          </div>
          <div className={styles.sphereWrapper}>
            <Image 
              src="/assets/silver-sphere.png" 
              alt="3D Silver Sphere" 
              width={140} 
              height={140} 
              className={styles.sphereImage}
            />
          </div>
        </div>
        
        <div className={styles.fieldsGrid}>
          <div className={styles.leftInputsCard}>
            <div className={styles.inputGroup}>
              <label>Project Type</label>
              <input 
                type="text" 
                placeholder="SEO of website" 
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Company Name</label>
              <input 
                type="text" 
                placeholder="your company name" 
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input 
                type="email" 
                placeholder="name@gmail.com" 
                required
              />
            </div>
          </div>

          <div className={styles.rightInputsCard}>
            <div className={styles.inputGroup}>
              <label>Project Description</label>
              <textarea 
                rows={6}
                placeholder="Share the ambition, timeline, and scope. We will recommend the right engagement model."
                required
              />
            </div>
            <button type="submit" className={styles.submitBtn}>Send Inquiry</button>
          </div>
        </div>
      </form>
    </div>
  );
}