import React from 'react';

export const TickerBar: React.FC = () => {
  const items = [
    'HULMA NG SINING',
    'LIKHA NG FILIPINA',
    'MADE WITH HEART',
    'HANDMADE IN SJDM BULACAN',
    'WEARABLE CLAY ART',
    'STUDENT-OWNED BUSINESS',
    'HULMA NG SINING',
    'LIKHA NG FILIPINA',
    'MADE WITH HEART',
    'HANDMADE IN SJDM BULACAN'
  ];

  return (
    <div className="bg-[#f0e3ec] text-[#71586f] py-4 overflow-hidden border-y border-[#e6dce1] select-none">
      <div className="flex items-center gap-8 text-[11px] sm:text-xs font-bold tracking-[0.22em] whitespace-nowrap animate-marquee">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <span>{item}</span>
            <span className="text-[#c17c9a] text-base">✳</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
