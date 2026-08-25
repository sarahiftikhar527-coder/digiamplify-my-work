'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle, Mail } from 'lucide-react';
import Title from '@/components/ui/Title';

const sections = [
  { id: 'introduction', title: '1. Introduction', icon: FileText },
  { id: 'information-collection', title: '2. Information We Collect', icon: Eye },
  { id: 'information-use', title: '3. How We Use Information', icon: CheckCircle },
  { id: 'data-security', title: '4. Data Security', icon: Lock },
  { id: 'privacy-rights', title: '5. Your Privacy Rights', icon: Shield },
  { id: 'contact-us', title: '6. Contact Us', icon: Mail },
];

export default function PrivacyPolicyPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full bg-[#070707] min-h-screen text-[#e0e0e0] font-sans relative overflow-hidden pt-8 pb-24">
      <div className="absolute left-[-10%] top-[20%] w-[500px] h-[500px] bg-[#be0919]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute right-[-10%] bottom-[10%] w-[600px] h-[600px] bg-[#be0919]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="mb-12">
          <Title as="h1" className="text-4xl sm:text-5xl lg:text-[50px] font-['Glacial'] font-bold leading-tight tracking-tight mb-4 pl-0">
            Privacy <span className="text-[#be0919] font-bold">Policy</span>
          </Title>
          <p className="text-white/60 text-sm">
            Last Updated: August 25, 2026 &bull; Read how we collect, store, and process your information.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#be0919] transition-colors duration-200 text-sm mt-5 group">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {sections.map((sect) => {
            const Icon = sect.icon;
            return (
              <button
                key={sect.id}
                onClick={() => scrollToSection(sect.id)}
                className="relative stats-card rounded-xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left group"
              >
                <div className="p-2.5 rounded-lg bg-[#be0919]/10 text-[#be0919] group-hover:bg-[#be0919] group-hover:text-white transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm group-hover:text-[#be0919] transition-colors duration-200">{sect.title}</h4>
                  <p className="text-white/40 text-[11px] mt-0.5">Jump to section</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-10 w-full">
          <section id="introduction" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
            <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
              <FileText className="w-6 h-6 text-[#be0919]" />
              <h2 className="text-xl font-bold text-white tracking-wide">1. Introduction</h2>
            </div>
            <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
              <p>
                Welcome to <strong>DigiAmplify</strong>. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us.
              </p>
              <p>
                By accessing or using our services, you agree to the terms of this Privacy Policy. If you do not agree with any terms in this policy, please discontinue use of our services immediately.
              </p>
            </div>
          </section>

          <section id="information-collection" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
            <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
              <Eye className="w-6 h-6 text-[#be0919]" />
              <h2 className="text-xl font-bold text-white tracking-wide">2. Information We Collect</h2>
            </div>
            <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
              <p>
                We collect information that you voluntarily provide to us when you fill out contact forms, subscribe to our newsletter, request capabilities decks, or contact support. This may include:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
                <li><strong className="text-white">Personal Data:</strong> Name, email address, phone number, company name, and job title.</li>
                <li><strong className="text-white">Credentials:</strong> Account identifiers and login details if you log in to our customer portal.</li>
                <li><strong className="text-white">Communications:</strong> Any details or feedback you submit through message forms.</li>
              </ul>
              <p>
                We also collect certain technical and usage details automatically when you browse our site, including IP addresses, browser specifications, page view analytics, and cookie tracking.
              </p>
            </div>
          </section>

          <section id="information-use" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
            <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
              <CheckCircle className="w-6 h-6 text-[#be0919]" />
              <h2 className="text-xl font-bold text-white tracking-wide">3. How We Use Information</h2>
            </div>
            <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
              <p>
                We process your information based on legitimate business interests, compliance, and consent. Specifically, we use your data to:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
                <li>Deliver and maintain our digital services, client portal capabilities, and user experience.</li>
                <li>Respond to inquiries, provide client support, and send newsletter updates or marketing decks.</li>
                <li>Perform statistical analysis, identify security issues, and optimize our site's loading speeds and layouts.</li>
                <li>Fulfill our contractual obligations and manage portal billing/finance information.</li>
              </ul>
            </div>
          </section>

          <section id="data-security" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
            <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
              <Lock className="w-6 h-6 text-[#be0919]" />
              <h2 className="text-xl font-bold text-white tracking-wide">4. Data Security</h2>
            </div>
            <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
              <p>
                We implement robust technical and organizational security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. We utilize SSL encryption, secure servers, and restrict data access only to authorized personnel.
              </p>
              <p>
                However, please remember that no transmission over the internet or database storage is 100% secure. While we strive to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          <section id="privacy-rights" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
            <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
              <Shield className="w-6 h-6 text-[#be0919]" />
              <h2 className="text-xl font-bold text-white tracking-wide">5. Your Privacy Rights</h2>
            </div>
            <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
              <p>
                Depending on your jurisdiction, you may have specific rights regarding your personal data. These rights commonly include:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
                <li>The right to access the personal data we hold about you.</li>
                <li>The right to request rectification of inaccurate or incomplete information.</li>
                <li>The right to request erasure ("right to be forgotten") of your data under certain conditions.</li>
                <li>The right to restrict or object to the processing of your data.</li>
                <li>The right to opt-out of marketing communications at any time.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact our privacy compliance team via the email address listed below.
              </p>
            </div>
          </section>

          <section id="contact-us" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default mb-4">
            <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
              <Mail className="w-6 h-6 text-[#be0919]" />
              <h2 className="text-xl font-bold text-white tracking-wide">6. Contact Us</h2>
            </div>
            <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
              <p>
                If you have questions, comments, or concerns regarding this Privacy Policy or our data management practices, please contact us at:
              </p>
              <div className="bg-white/5 border border-white/5 rounded-xl p-5 mt-2 flex flex-col gap-2">
                <p><strong className="text-white">Email:</strong> privacy@digiamplify.com</p>
                <p><strong className="text-white">Address:</strong> DigiAmplify HQ, Suite 500, Technology District</p>
                <p><strong className="text-white">Support Desk:</strong> <Link href="/contact" className="text-[#be0919] hover:underline">Contact Support Form</Link></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
