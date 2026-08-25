'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, Award, FileText, Ban, AlertCircle, HelpCircle } from 'lucide-react';
import Title from '@/components/ui/Title';

const sections = [
  { id: 'agreement-to-terms', title: '1. Agreement to Terms', icon: FileText },
  { id: 'intellectual-property', title: '2. Intellectual Property', icon: Award },
  { id: 'user-representations', title: '3. User Representations', icon: Scale },
  { id: 'prohibited-activities', title: '4. Prohibited Activities', icon: Ban },
  { id: 'limitation-liability', title: '5. Limitation of Liability', icon: ShieldAlert },
  { id: 'governing-law', title: '6. Governing Law', icon: AlertCircle },
  { id: 'contact-us', title: '7. Contact Us', icon: HelpCircle },
];

export default function TermsOfServicePage() {
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
      <div className="absolute right-[-10%] top-[20%] w-[500px] h-[500px] bg-[#be0919]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute left-[-10%] bottom-[10%] w-[600px] h-[600px] bg-[#be0919]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-[1250px] mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="mb-12">
          <Title as="h1" className="text-4xl sm:text-5xl lg:text-[50px] font-['Glacial'] font-bold leading-tight tracking-tight mb-4 pl-0">
            Terms of <span className="text-[#be0919] font-bold">Service</span>
          </Title>
          <p className="text-white/60 text-sm">
            Last Updated: August 25, 2026 &bull; Please read these terms carefully before using our platform or services.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#be0919] transition-colors duration-200 text-sm mt-5 group">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
          <aside className="hidden lg:block sticky top-28 bg-[#0e0e0e] border border-white/5 rounded-2xl p-5 shadow-2xl">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-5 pb-3 border-b border-white/5">
              Sections
            </h4>
            <nav className="flex flex-col gap-2">
              {sections.map((sect) => {
                const Icon = sect.icon;
                return (
                  <button
                    key={sect.id}
                    onClick={() => scrollToSection(sect.id)}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-left text-sm text-white/70 hover:text-white hover:bg-[#be0919]/10 transition-all duration-200 cursor-pointer group"
                  >
                    <Icon className="w-4 h-4 text-white/40 group-hover:text-[#be0919] transition-colors duration-200" />
                    <span>{sect.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex flex-col gap-8 w-full">
            <section id="agreement-to-terms" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
                <FileText className="w-6 h-6 text-[#be0919]" />
                <h2 className="text-xl font-bold text-white tracking-wide">1. Agreement to Terms</h2>
              </div>
              <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
                <p>
                  These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and <strong>DigiAmplify</strong>, concerning your access to and use of our website as well as any other media form, media channel, mobile website, client portal, or related services (collectively, the "Services").
                </p>
                <p>
                  By accessing or using the Services, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms, you are expressly prohibited from using our Services and must cease access immediately.
                </p>
              </div>
            </section>

            <section id="intellectual-property" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
                <Award className="w-6 h-6 text-[#be0919]" />
                <h2 className="text-xl font-bold text-white tracking-wide">2. Intellectual Property Rights</h2>
              </div>
              <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
                <p>
                  Unless otherwise indicated, the Services and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us, and are protected by copyright and trademark laws.
                </p>
                <p>
                  The Content and Marks are provided on the site "AS IS" for your information and personal or business use only. Except as expressly provided in these Terms of Service, no part of the site, Content, or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                </p>
              </div>
            </section>

            <section id="user-representations" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
                <Scale className="w-6 h-6 text-[#be0919]" />
                <h2 className="text-xl font-bold text-white tracking-wide">3. User Representations</h2>
              </div>
              <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
                <p>
                  By using the Services, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
                  <li>All registration information you submit will be true, accurate, current, and complete.</li>
                  <li>You will maintain the accuracy of such information and promptly update registration information as necessary.</li>
                  <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                  <li>You are not a minor in the jurisdiction in which you reside.</li>
                  <li>You will not access the Services through automated or non-human means, whether through a bot, script, or otherwise.</li>
                </ul>
              </div>
            </section>

            <section id="prohibited-activities" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
                <Ban className="w-6 h-6 text-[#be0919]" />
                <h2 className="text-xl font-bold text-white tracking-wide">4. Prohibited Activities</h2>
              </div>
              <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
                <p>
                  You may not access or use the Services for any purpose other for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                </p>
                <p>
                  As a user of the Services, you agree not to:
                </p>
                <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
                  <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                  <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
                  <li>Engage in unauthorized framing of or linking to the Services.</li>
                  <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account credentials.</li>
                  <li>Use any automated system, including without limitation robots, spiders, or offline readers, that accesses the Services.</li>
                </ul>
              </div>
            </section>

            <section id="limitation-liability" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
                <ShieldAlert className="w-6 h-6 text-[#be0919]" />
                <h2 className="text-xl font-bold text-white tracking-wide">5. Limitation of Liability</h2>
              </div>
              <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
                <p>
                  IN NO EVENT WILL DIGIAMPLIFY OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
                <p>
                  NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.
                </p>
              </div>
            </section>

            <section id="governing-law" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default">
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
                <AlertCircle className="w-6 h-6 text-[#be0919]" />
                <h2 className="text-xl font-bold text-white tracking-wide">6. Governing Law</h2>
              </div>
              <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
                <p>
                  These Terms of Service and your use of the Services are governed by and construed in accordance with the laws of the State in which DigiAmplify is incorporated, without regard to its conflict of law principles.
                </p>
                <p>
                  Any legal action or proceeding arising under these Terms of Service shall be brought exclusively in the state or federal courts located within the headquarters county of DigiAmplify, and you hereby consent to the personal jurisdiction and venue of such courts.
                </p>
              </div>
            </section>

            <section id="contact-us" className="relative stats-card rounded-2xl p-8 flex flex-col cursor-default mb-4">
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/5">
                <HelpCircle className="w-6 h-6 text-[#be0919]" />
                <h2 className="text-xl font-bold text-white tracking-wide">7. Contact Us</h2>
              </div>
              <div className="text-white/70 text-[0.95rem] leading-[1.8] flex flex-col gap-4">
                <p>
                  In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
                </p>
                <div className="bg-white/5 border border-white/5 rounded-xl p-5 mt-2 flex flex-col gap-2">
                  <p><strong className="text-white">Email:</strong> legal@digiamplify.com</p>
                  <p><strong className="text-white">Address:</strong> DigiAmplify HQ, Suite 500, Technology District</p>
                  <p><strong className="text-white">Support Desk:</strong> <Link href="/contact" className="text-[#be0919] hover:underline">Contact Support Form</Link></p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
