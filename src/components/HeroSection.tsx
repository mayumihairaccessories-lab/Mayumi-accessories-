import React from 'react';
import { SiteContent } from '../types/store';
import { ArrowDownRight } from 'lucide-react';

interface HeroSectionProps {
  content: SiteContent;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, onExploreClick }) => {
  const { hero } = content;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:py-16 md:py-20 lg:py-24 border-b border-[#e6dce1]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Hero Copy Content */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8c657f] mb-4 sm:mb-6">
              <span className="w-8 h-[1.5px] bg-[#d989a5] inline-block" />
              <span>{hero.eyebrow}</span>
            </div>

            {/* Display Heading */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.08] tracking-[-0.035em] text-[#29232b] mb-6">
              {hero.title} <br className="hidden sm:inline" />
              <em className="text-[#bd7896] italic font-normal">{hero.emphasis}</em>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-[#766a75] text-base sm:text-lg leading-relaxed max-w-lg mb-8 sm:mb-10 font-sans">
              {hero.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-5 sm:gap-6 flex-wrap">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-between gap-6 px-5 py-3.5 bg-[#29232b] text-white text-xs sm:text-[13px] font-medium tracking-wide hover:-translate-y-0.5 hover:bg-[#3d3440] transition-all shadow-sm rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d989a5]"
              >
                <span>Explore the collection</span>
                <ArrowDownRight className="w-4 h-4 text-[#d989a5]" />
              </button>

              <a
                href="#story"
                className="text-xs sm:text-[13px] text-[#29232b] border-b border-[#bd9cad] pb-1 hover:text-[#b25e80] hover:border-[#b25e80] transition-colors font-medium"
              >
                Get to know MAYUMI
              </a>
            </div>

            {/* Handcrafted Note with Sparkle */}
            <div className="flex items-center gap-4 mt-12 sm:mt-14 pt-6 border-t border-[#e6dce1]/60 text-xs sm:text-sm text-[#766a75]">
              <span className="text-2xl text-[#d989a5] select-none animate-spin-slow">✳</span>
              <p className="leading-snug">
                <strong className="text-[#29232b] font-semibold">{hero.noteTitle}</strong> <br />
                {hero.noteSubtitle}
              </p>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]">
            {/* Background Decorative Orbits */}
            <div className="absolute w-[92%] h-[82%] border border-[#d6a9bd] rounded-full -rotate-[28deg] pointer-events-none opacity-80" />
            <div className="absolute w-[88%] h-[92%] border border-[#d4c3e3] rounded-full rotate-[35deg] pointer-events-none opacity-80" />

            {/* Rotating / Tilted Sticker Badge */}
            <div className="absolute z-10 left-2 sm:left-4 top-8 sm:top-12 bg-[#d6c6e5] text-[#4d3d58] w-22 h-22 sm:w-26 sm:h-26 rounded-full flex flex-col items-center justify-center text-center text-[10px] sm:text-[11px] font-bold tracking-[0.14em] leading-tight -rotate-12 shadow-sm border border-white/60">
              <span>{hero.stickerTitle}</span>
              <span>{hero.stickerSub}</span>
              <span className="text-base mt-0.5 text-[#583e61]">✦</span>
            </div>

            {/* Primary Clay Clip Image with signature arched frame */}
            <div className="relative z-[5] w-[74%] sm:w-[68%] h-[82%] sm:h-[86%] rounded-t-[180px] rounded-b-sm overflow-hidden shadow-2xl shadow-[#4c3040]/15 border-2 border-white bg-[#eadde7]">
              <img
                src={hero.image || "/images/hero-product.jpg"}
                alt="MAYUMI Handmade Clay Hair Clip"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Bottom Archival Caption */}
            <div className="absolute bottom-1 w-full flex justify-between px-2 text-[9px] sm:text-[10px] tracking-[0.14em] font-mono text-[#8a7a87]">
              <span>01 / HANDCRAFTED</span>
              <span>MADE TO FEEL LIKE YOU</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
