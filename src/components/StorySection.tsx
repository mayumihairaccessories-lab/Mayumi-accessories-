import React from 'react';
import { SiteContent, TeamMember } from '../types/store';
import { ArrowRight, Heart } from 'lucide-react';

interface StorySectionProps {
  content: SiteContent;
  teamMembers: TeamMember[];
}

export const StorySection: React.FC<StorySectionProps> = ({ content, teamMembers }) => {
  const { story } = content;

  return (
    <section id="story" className="py-20 sm:py-24 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Kicker */}
      <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8c657f] mb-4">
        {story.kicker}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">
        <div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-normal leading-[1.12] tracking-[-0.035em] text-[#29232b]">
            {story.heading} <br />
            <em className="text-[#bd7896] italic font-normal">{story.emphasis}</em>
          </h2>
        </div>

        <div className="text-[#766a75] text-[13px] sm:text-sm leading-relaxed space-y-4">
          <p>{story.paragraph1}</p>
          <p>{story.paragraph2}</p>
          <div className="pt-2">
            <a
              href="#craft"
              className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-[#29232b] border-b border-[#bd9cad] pb-1 hover:text-[#b25e80] hover:border-[#b25e80] transition-colors"
            >
              <span>A closer look at our craft</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 3 Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#e6dce1]">
        {story.values.map((val, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <span className="text-3xl text-[#bf7898] leading-none shrink-0 font-serif">
              {val.icon}
            </span>
            <div>
              <strong className="block text-xs sm:text-sm font-semibold text-[#29232b] mb-1">
                {val.title}
              </strong>
              <p className="text-[11px] sm:text-xs text-[#766a75] leading-relaxed">
                {val.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 5 Filipina Partners Showcase */}
      <div className="mt-16 p-6 sm:p-8 bg-[#f2e7ec]/60 rounded-xl border border-[#e6dce1]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#bd7896]" />
            <h3 className="font-serif text-lg sm:text-xl font-medium text-[#29232b]">
              The 5 Filipina Partners Behind MAYUMI
            </h3>
          </div>
          <span className="text-xs text-[#766a75]">
            Student Business Project · SJDM Bulacan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-lg border border-[#e6dce1]/80 shadow-xs hover:border-[#d989a5] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#f2dce5] text-[#583e61] font-serif font-bold text-sm flex items-center justify-center mb-2.5">
                {member.name.charAt(0)}
              </div>
              <h4 className="font-medium text-xs text-[#29232b] leading-tight mb-1">
                {member.name}
              </h4>
              <p className="text-[10px] font-semibold text-[#8c657f] uppercase tracking-wider mb-1.5">
                {member.role}
              </p>
              <p className="text-[11px] text-[#766a75] leading-snug line-clamp-3">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
