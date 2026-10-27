import React from 'react';
import { SiteContent } from '../types/store';

interface QuoteBandProps {
  content: SiteContent;
}

export const QuoteBand: React.FC<QuoteBandProps> = ({ content }) => {
  const { quote } = content;

  return (
    <section className="bg-[#d7c7e5] text-[#4e3c57] py-16 sm:py-20 text-center px-4 border-y border-[#c5b2d6]">
      <div className="max-w-4xl mx-auto">
        <span className="text-3xl sm:text-4xl text-[#bd7896] block mb-3 animate-bounce">
          ✿
        </span>
        <p className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight text-[#4e3c57] mb-4">
          {quote.text} <br className="hidden sm:inline" />
          <em className="text-[#a85c82] font-normal italic">{quote.emphasis}</em>
        </p>
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.14em] uppercase text-[#614b6d] block">
          {quote.sub}
        </span>
      </div>
    </section>
  );
};
