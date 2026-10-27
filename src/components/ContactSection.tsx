import React from 'react';
import { SiteContent } from '../types/store';
import { Mail, Instagram, Facebook, Video, ArrowUpRight } from 'lucide-react';

interface ContactSectionProps {
  content: SiteContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content }) => {
  const { contact } = content;

  return (
    <section id="contact" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 2-Tone Contact Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#573f61] text-[#fff7fb] rounded-xl overflow-hidden shadow-xl border border-[#432d4b]">
        
        {/* Left Column: Email CTA */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#e7bfd2] mb-3">
              {contact.kicker}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#fff7fb] mb-5">
              {contact.heading} <br />
              <em className="text-[#e5a7c2] italic font-normal">{contact.emphasis}</em>
            </h2>

            <p className="text-xs sm:text-[13px] text-[#e2d6e4] leading-relaxed max-w-md mb-8">
              {contact.description}
            </p>
          </div>

          <div>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#f8edf1] text-[#49354f] text-xs sm:text-sm font-semibold rounded-sm hover:bg-white hover:shadow-md transition-all"
            >
              <Mail className="w-4 h-4 text-[#bd7896]" />
              <span>Email Us: {contact.email}</span>
            </a>
          </div>
        </div>

        {/* Right Column: Social Media & Stamp */}
        <div className="lg:col-span-5 bg-[#4c3554] p-8 sm:p-12 lg:p-14 border-t lg:border-t-0 lg:border-l border-white/15 flex flex-col justify-center">
          
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#e2b5cb] shadow-sm bg-white mb-6">
            <img
              src="/images/logo.png"
              alt="MAYUMI Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-[10px] tracking-[0.18em] font-bold text-[#e5b6cc] uppercase mb-3">
            Official Social Media
          </p>

          <div className="divide-y divide-white/20 mb-6">
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:translate-x-1 transition-all"
            >
              <span className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-[#e5b6cc]" />
                <span>Instagram (@mayumihairaccessories)</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#e5b6cc]" />
            </a>

            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:translate-x-1 transition-all"
            >
              <span className="flex items-center gap-2.5">
                <Facebook className="w-4 h-4 text-[#e5b6cc]" />
                <span>Facebook (MAYUMI Accessories)</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#e5b6cc]" />
            </a>

            <a
              href={contact.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:translate-x-1 transition-all"
            >
              <span className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-[#e5b6cc]" />
                <span>TikTok (@mayumihairaccessories)</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#e5b6cc]" />
            </a>
          </div>

          <p className="text-[10px] tracking-[0.18em] font-bold text-[#e5b6cc] uppercase mb-1">
            Pop-up Updates & Announcements
          </p>
          <p className="text-xs text-[#e2d6e4]">
            Follow our social stories for weekly pop-up schedules, school bazaar appearances, and new clay batch drops.
          </p>
        </div>

      </div>

      {/* 5 Partners Acknowledgment Footnote */}
      <p className="mt-8 text-center text-xs text-[#8a7c88] max-w-2xl mx-auto leading-relaxed">
        {contact.footnote}
      </p>
    </section>
  );
};
