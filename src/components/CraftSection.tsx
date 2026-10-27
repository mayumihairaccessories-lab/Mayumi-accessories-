import React from 'react';
import { SiteContent } from '../types/store';

interface CraftSectionProps {
  content: SiteContent;
}

export const CraftSection: React.FC<CraftSectionProps> = ({ content }) => {
  const { craft } = content;

  return (
    <section id="craft" className="py-20 sm:py-24 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Artisan Photography Frame */}
        <div className="relative order-2 lg:order-1 flex items-center justify-center min-h-[360px] sm:min-h-[440px]">
          <div className="w-[88%] sm:w-[82%] h-[360px] sm:h-[430px] rounded-sm overflow-hidden border border-[#e6dce1] shadow-lg bg-[#eadde7]">
            <img
              src={craft.image || "/images/craft-art.jpg"}
              alt="Artisan sculpting handmade clay hair clip"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Overlapping Badge Stamp */}
          <div className="absolute right-2 sm:right-6 bottom-4 sm:bottom-8 bg-[#d6c6e5] text-[#4d3d58] w-28 h-28 sm:w-34 sm:h-34 rounded-full flex flex-col items-center justify-center text-center font-serif text-sm sm:text-base leading-tight rotate-9 shadow-md border-2 border-white">
            <span>{craft.badgeTitle}</span>
            <span>{craft.badgeSub}</span>
          </div>
        </div>

        {/* Craft Narrative Copy */}
        <div className="order-1 lg:order-2 max-w-xl">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8c657f] mb-3">
            {craft.kicker}
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl font-normal leading-tight text-[#29232b] mb-6">
            {craft.heading} <br />
            <em className="text-[#bd7896] italic font-normal">{craft.emphasis}</em>
          </h2>

          <p className="text-xs sm:text-sm text-[#766a75] leading-relaxed mb-8">
            {craft.description}
          </p>

          {/* 3 Step Sequence */}
          <div className="border-t border-[#e6dce1] mb-6">
            {craft.steps.map((st) => (
              <div
                key={st.num}
                className="py-3.5 border-b border-[#e6dce1] flex items-baseline gap-4 text-xs sm:text-[13px]"
              >
                <span className="font-mono text-[10px] font-bold text-[#bd7896] tracking-widest shrink-0">
                  {st.num}
                </span>
                <div>
                  <strong className="text-[#29232b] font-medium mr-2">{st.title}:</strong>
                  <span className="text-[#766a75]">{st.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] sm:text-[11px] text-[#887784] italic leading-relaxed">
            {craft.note}
          </p>
        </div>

      </div>
    </section>
  );
};
