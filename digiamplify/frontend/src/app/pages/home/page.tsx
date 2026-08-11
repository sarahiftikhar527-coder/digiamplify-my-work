import React from 'react';
import HomeHero from './components/HomeHero';
import HomeAbout from './components/HomeAbout';
import HomeGallery from './components/HomeGallery';
import HomeIntro from './components/HomeIntro';
import HomeServices from './components/HomeServices';
import HomeMetrics from './components/HomeMetrics';
import HomeWorkflow from './components/HomeWorkflow';
import HomeShowcase from './components/HomeShowcase';
import HomeTestimonials from './components/HomeTestimonials';
import HomeVideoTestimonial from './components/HomeVideoTestimonial';
import HomeFAQ from './components/HomeFAQ';
import ContactForm from '@/components/ContactForm/ContactForm';
import Newsletter from '@/components/ui/Newsletter';

export default function HomePage() {
    return (
        <div className="w-full min-h-screen bg-[#050505] text-white font-poppins selection:bg-[#be0919] selection:text-white overflow-hidden">
            <HomeHero />
            <HomeAbout />
            <HomeGallery />
            <HomeIntro />
            <HomeServices />
            
            <section className="w-full bg-[#050505] py-8 lg:py-2">
                <div className="w-full h-[60px] md:h-[80px] lg:h-[100px] bg-gradient-to-r from-[#222222] to-[#050505] border-y border-[#1a1a1a]"></div>
            </section>

            <HomeMetrics />
            <HomeWorkflow />
            <HomeShowcase />
            <HomeTestimonials />
            <HomeVideoTestimonial />
            <HomeFAQ />

            <ContactForm imageSrc="/assets/home/silver-sphere.png" />

            <div className="max-w-[1350px] mx-auto px-6 lg:px-12 w-full pt-12 pb-8 border-t border-[#1a1a1a]">
                <Newsletter />
            </div>
        </div>
    );
}