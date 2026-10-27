import React from 'react';
import { ArrowUp, Lock, Share2 } from 'lucide-react';

interface FooterProps {
  onOpenPortal: () => void;
  onOpenShareModal?: () => void;
  customDomain?: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPortal, onOpenShareModal }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#e6dce1] bg-[#fbf7f1] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#766a75]">
          
          {/* Brand & Motto */}
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-[0.18em] text-[#29232b] text-sm">
              MAYUMI <span className="text-[#bd7896]">✳</span>
            </span>
            <span className="hidden md:inline text-[#e6dce1]">|</span>
            <span className="italic font-serif text-[#8c657f]">
              Hulma ng Sining, Likha ng Filipina.
            </span>
          </div>

          {/* Center Links & Secure Collab Access */}
          <div className="flex items-center gap-4 sm:gap-5 flex-wrap justify-center">
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                title="Share MAYUMI Website Link with friends & customers"
                className="inline-flex items-center gap-1.5 text-xs text-[#766a75] hover:text-[#583e61] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#bd7896]" />
                <span className="font-medium text-[11px]">Share Website</span>
              </button>
            )}

            <button
              onClick={onOpenPortal}
              title="Only for owner and authorized collaborators (Protected with Gmail & PIN)"
              className="inline-flex items-center gap-1.5 text-xs text-[#766a75] hover:text-[#583e61] transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#bd7896]" />
              <span className="font-medium text-[11px]">Collaborator Access</span>
            </button>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[11px] font-mono tracking-widest text-[#29232b] hover:text-[#b25e80] transition-colors uppercase cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#e6dce1]/60 text-center text-[10px] text-[#9a8d98]">
          <p>© {currentYear} MAYUMI Accessories. Handmade with care in San Jose del Monte City, Bulacan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
