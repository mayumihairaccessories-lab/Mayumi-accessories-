import React from 'react';
import { SiteContent } from '../types/store';
import { Sparkles, HelpCircle } from 'lucide-react';

interface PricesAndSizesSectionProps {
  content: SiteContent;
  onOpenSizeGuide: () => void;
}

export const PricesAndSizesSection: React.FC<PricesAndSizesSectionProps> = ({
  content,
  onOpenSizeGuide,
}) => {
  const { pricing } = content;

  return (
    <section id="prices" className="py-20 sm:py-24 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Kicker */}
      <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8c657f] mb-4">
        PRICES & SIZES
      </div>

      {/* Main Grid: Header & Price Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16">
        <div>
          <h2 className="font-serif text-4xl sm:text-5xl font-normal leading-[1.14] text-[#29232b]">
            {pricing.title} <br />
            <em className="text-[#bd7896] italic font-normal">{pricing.emphasis}</em>
          </h2>
          <p className="text-xs sm:text-sm text-[#766a75] mt-5 max-w-md leading-relaxed">
            {pricing.lead}
          </p>

          <div className="mt-6">
            <button
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#583e61] hover:text-[#b25e80] transition-colors border-b border-[#cdb9c8] pb-0.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#d989a5]" />
              <span>Which size should I pick? (Gamay vs Dako Guide)</span>
            </button>
          </div>
        </div>

        {/* Highlight Price Card */}
        <div className="bg-white border border-[#e6dce1] p-6 sm:p-9 shadow-sm rounded-lg">
          <div className="flex items-baseline gap-3.5 flex-wrap">
            <span className="font-serif text-5xl sm:text-6xl text-[#bd7896] font-normal leading-none">
              ₱{pricing.basePrice}
            </span>
            <span className="text-xs sm:text-sm text-[#766a75] font-medium">
              per handmade clay hair clip
            </span>
          </div>

          {/* Size Comparison Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 py-6 border-y border-[#e6dce1]">
            <div>
              <strong className="font-serif text-xl font-normal block text-[#29232b]">
                {pricing.gamayTitle}
              </strong>
              <span className="text-[11px] text-[#8c657f] font-mono tracking-wider">
                {pricing.gamaySub}
              </span>
              <p className="text-xs text-[#766a75] mt-1.5 leading-relaxed">
                {pricing.gamayDesc}
              </p>
            </div>

            <div>
              <strong className="font-serif text-xl font-normal block text-[#29232b]">
                {pricing.dakoTitle}
              </strong>
              <span className="text-[11px] text-[#8c657f] font-mono tracking-wider">
                {pricing.dakoSub}
              </span>
              <p className="text-xs text-[#766a75] mt-1.5 leading-relaxed">
                {pricing.dakoDesc}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#766a75] leading-relaxed">
            {pricing.note}
          </p>
        </div>
      </div>

      {/* 4 Feature Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-[#e6dce1]">
        {pricing.features.map((feat, idx) => (
          <div key={idx} className="bg-[#fbf7f1] p-4 rounded-md">
            <strong className="block text-xs sm:text-sm font-semibold text-[#29232b] mb-1">
              {feat.title}
            </strong>
            <p className="text-[11px] sm:text-xs text-[#766a75] leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
