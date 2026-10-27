import React from 'react';
import { SiteContent } from '../types/store';
import { MapPin, Clock, Calendar, CheckCircle2, Facebook, Instagram, Video, ExternalLink, Sparkles } from 'lucide-react';

interface VisitAndOrderSectionProps {
  content: SiteContent;
  onOpenOrderModal?: () => void;
}

export const VisitAndOrderSection: React.FC<VisitAndOrderSectionProps> = ({
  content,
}) => {
  const { popup } = content;

  const fbUrl = 'https://www.facebook.com/profile.php?id=61568215620941';
  const igUrl = 'https://www.instagram.com/mayumihairaccessories/';
  const tiktokUrl = 'https://www.tiktok.com/@mayumihairaccessories';

  const orderSteps = [
    'Browse our handcrafted clay hair clip collection.',
    'Choose your favorite design and clip size: Gamay (3.2 cm) or Dako (5.5 cm).',
    'Click the links below to message us directly on our official Facebook or Instagram page.',
    'Let us know if you prefer to pick up at our Minuyan SJDM booth or arrange delivery / meetup.',
    'Settle payment conveniently via GCash, Maya, or Cash on Pickup/Meet-up.'
  ];

  return (
    <section id="visit" className="bg-[#f2e7ec] py-20 sm:py-24 lg:py-28 border-t border-[#e6dce1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-14">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8c657f] mb-3">
            03 — VISIT & ORDER VIA PAGES
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-normal leading-tight text-[#29232b]">
            Handcrafted with love, <br />
            <em className="text-[#bd7896] italic font-normal">ordered directly on our pages.</em>
          </h2>
          <p className="text-xs sm:text-sm text-[#766a75] mt-3">
            Explore our collection here anytime. When you find a clip you adore, click the links below to send us a direct message to order!
          </p>
        </div>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Card 1: Pop-up Store & Hours */}
          <div className="bg-white border border-[#e6dce1] p-6 sm:p-9 rounded-lg shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-full bg-[#f2dce5] text-[#583e61]">
                <MapPin className="w-5 h-5 text-[#bd7896]" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#29232b]">
                  {popup.storeName}
                </h3>
                <p className="text-xs text-[#8c657f] font-mono tracking-wide mt-0.5">
                  San Jose del Monte, Bulacan
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[#766a75] leading-relaxed mb-6">
              {popup.locationDesc}
            </p>

            {/* Operating Hours Table */}
            <div className="border-t border-[#e6dce1] pt-5 mb-6">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#29232b]">
                <Clock className="w-3.5 h-3.5 text-[#bd7896]" />
                <span>Store & Booth Hours</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {popup.hours.map((h, idx) => (
                    <tr key={idx} className="border-b border-[#e6dce1]/60 last:border-0">
                      <td className="py-2 text-[#645965] font-medium">{h.days}</td>
                      <td className="py-2 text-right text-[#29232b] font-mono font-medium">{h.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-[#887784] mt-2.5 leading-relaxed">
                {popup.hoursNote}
              </p>
            </div>

            {/* Next Bazaar Banner */}
            {popup.nextEventTitle && (
              <div className="bg-[#fbf7f1] p-4 rounded-md border border-[#d6a9bd]/80 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#583e61] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-semibold text-[#583e61]">
                    {popup.nextEventTitle}
                  </strong>
                  <p className="text-[11px] text-[#766a75] mt-0.5">
                    {popup.nextEventDetails}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: How to Order via Official Pages */}
          <div className="bg-white border border-[#e6dce1] p-6 sm:p-9 rounded-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-full bg-[#f2dce5] text-[#583e61]">
                  <CheckCircle2 className="w-5 h-5 text-[#bd7896]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#29232b]">
                    How to Order On Our Pages
                  </h3>
                  <p className="text-xs text-[#8c657f] font-mono tracking-wide mt-0.5">
                    Direct & Personalized Student Service
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-[#766a75] leading-relaxed mb-6">
                Ready to own a piece of handmade Filipina art? Follow these quick steps to order via our official social pages:
              </p>

              {/* Order Steps List */}
              <ol className="space-y-3.5 mb-8">
                {orderSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-[13px] text-[#766a75] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#f2dce5] text-[#583e61] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Official Order Links Buttons (Replaces direct cart drawer trigger) */}
            <div className="pt-4 border-t border-[#e6dce1] space-y-2.5">
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 bg-[#1877F2] text-white text-xs sm:text-sm font-semibold tracking-wide rounded-sm hover:bg-[#166fe5] transition-colors shadow-sm flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  <span>Click to Order on Facebook (MAYUMI)</span>
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs sm:text-sm font-semibold tracking-wide rounded-sm hover:opacity-95 transition-opacity shadow-sm flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  <span>Click to Order via Instagram DM</span>
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-6 bg-[#29232b] text-white text-xs font-medium rounded-sm hover:bg-[#3d3440] transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#d989a5]" />
                  <span>Watch & Inquire on TikTok</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#e5b6cc]" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
