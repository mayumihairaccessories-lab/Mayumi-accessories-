import React from 'react';
import { X, Sparkles, Scissors, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#fbf7f1] w-full max-w-2xl rounded-xl border border-[#e6dce1] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-white border-b border-[#e6dce1] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8c657f] font-bold uppercase">
              Styling & Measurement Guide
            </span>
            <h2 className="font-serif text-2xl text-[#29232b] mt-0.5">
              Gamay vs. Dako: Which Size Fits You?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#766a75] hover:text-[#29232b] rounded-full hover:bg-slate-100"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Gamay Card */}
            <div className="bg-white p-5 rounded-lg border-2 border-[#d989a5]/60 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-serif text-2xl text-[#29232b]">Gamay</h3>
                  <span className="font-mono text-xs font-bold text-[#bd7896] bg-[#f2dce5] px-2 py-0.5 rounded-xs">
                    3.2 cm length
                  </span>
                </div>
                <p className="text-xs text-[#766a75] mb-4">
                  "Gamay" is the Cebuano/Visayan word for small. Crafted for light, subtle, everyday touches.
                </p>

                <div className="space-y-2 text-xs text-[#645965] border-t border-[#e6dce1] pt-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Side-swept bangs & front face-framing hair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fine to medium hair textures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Pairs great in sets of two or three</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-dashed border-[#e6dce1] text-[11px] text-[#8c657f] italic">
                Best for: Classroom, school uniform, casual cafe dates
              </div>
            </div>

            {/* Dako Card */}
            <div className="bg-white p-5 rounded-lg border-2 border-[#583e61]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-serif text-2xl text-[#29232b]">Dako</h3>
                  <span className="font-mono text-xs font-bold text-[#583e61] bg-[#d9c9e9]/50 px-2 py-0.5 rounded-xs">
                    5.5 cm length
                  </span>
                </div>
                <p className="text-xs text-[#766a75] mb-4">
                  "Dako" means big. A statement piece designed to secure thicker sections of hair with artistic flair.
                </p>

                <div className="space-y-2 text-xs text-[#645965] border-t border-[#e6dce1] pt-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Half-up hair twists & messy low buns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Medium to thick/wavy hair volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Stronger spring grip for all-day hold</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-dashed border-[#e6dce1] text-[11px] text-[#8c657f] italic">
                Best for: Special events, photo shoots, bold OOTDs
              </div>
            </div>

          </div>

          {/* Quick Tip Banner */}
          <div className="bg-[#f0e3ec] p-4 rounded-lg border border-[#d6a9bd] flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#bd7896] shrink-0 mt-0.5" />
            <div className="text-xs text-[#583e61]">
              <strong>Still not sure?</strong> Most students and customers order our <em>Curated Duo Set</em> or choose "Both Sizes" to mix and match Gamay on the side with Dako on a half-up bun!
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#29232b] text-white text-xs font-semibold rounded-sm hover:bg-[#3d3440] transition-colors"
            >
              Got it, thanks!
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
