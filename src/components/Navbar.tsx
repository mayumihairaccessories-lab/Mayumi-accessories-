import React, { useState } from 'react';
import { Lock, UserCheck, Menu, X, ExternalLink } from 'lucide-react';
import { SiteContent, TeamMember, StoreSettings } from '../types/store';

interface NavbarProps {
  content: SiteContent;
  settings?: StoreSettings;
  activeMember: TeamMember | null;
  onOpenPortal: () => void;
  onOpenShareModal?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  content,
  settings,
  activeMember,
  onOpenPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const orderUrl = settings?.orderLink || 'https://www.facebook.com/profile.php?id=61568215620941';

  return (
    <>
      {/* Top Announcement Bar */}
      <aside aria-label="Announcement" className="bg-[#583e61] text-[#fff7fb] text-[11px] sm:text-xs tracking-wide py-2 px-4 text-center font-medium flex items-center justify-between sm:justify-center gap-3 relative z-30">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block text-[#d989a5]">✿</span>
          <span className="truncate">{content.announcement}</span>
          <span className="hidden md:inline text-[#d989a5]">·</span>
          <span className="hidden md:inline text-[#f2dce5] text-[11px]">Order via Our Official Facebook or Instagram Pages</span>
        </div>

        {activeMember && (
          <span className="shrink-0 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Editor Access: {activeMember.name.split(' ')[0]}
          </span>
        )}
      </aside>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-20 bg-[#fbf7f1]/95 backdrop-blur-md border-b border-[#e6dce1] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          
          {/* Brand Logo & Clean Title (Removed 'Catalog', 'Viewing Only', and 'www.mayumiaccessories.com') */}
          <a
            href="#home"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d989a5] rounded-lg p-1"
            aria-label="MAYUMI Accessories Home"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#d6a9bd] shadow-sm bg-white shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/images/logo.png"
                alt="MAYUMI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold tracking-[0.16em] text-base sm:text-lg text-[#29232b] flex items-center gap-1.5">
                <span>MAYUMI</span>
                <span className="text-[#bd7896] text-xs">✳</span>
              </div>
              <small className="block text-[8px] sm:text-[9px] tracking-[0.22em] text-[#766a75] font-semibold uppercase -mt-0.5">
                Handmade Clay Hair Clips
              </small>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] text-[#645965] font-medium" aria-label="Main Navigation">
            <a href="#story" className="hover:text-[#b25e80] transition-colors py-1">Our Story</a>
            <a href="#collection" className="hover:text-[#b25e80] transition-colors py-1">Collection</a>
            <a href="#prices" className="hover:text-[#b25e80] transition-colors py-1">Prices & Sizes</a>
            <a href="#visit" className="hover:text-[#b25e80] transition-colors py-1">How to Order</a>
            <a href="#craft" className="hover:text-[#b25e80] transition-colors py-1">Our Craft</a>
            <a href="#contact" className="hover:text-[#b25e80] transition-colors py-1 border border-[#cdb9c8] px-3.5 py-1.5 rounded-sm hover:border-[#b25e80] hover:bg-[#f2dce5]/40 flex items-center gap-1.5">
              Official Pages <span className="text-xs">↗</span>
            </a>
          </nav>

          {/* Action Buttons: Order via Socials & Collaborator Gmail Login (Removed .com Link button) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Link to Order on Pages */}
            <a
              href="#visit"
              className="px-3.5 py-2 sm:px-4 sm:py-2 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-all flex items-center gap-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d989a5]"
            >
              <span>Order on Our Pages</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#e5b6cc]" />
            </a>

            {/* Collaborator Gmail Access Button: Owner & Collaborators only can edit */}
            <button
              onClick={onOpenPortal}
              title={activeMember ? `Logged in as ${activeMember.name} (Click to manage catalog & collaborators)` : "Collaborator Sign-In via Gmail Account"}
              className={`p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-sm transition-all flex items-center gap-1.5 border ${
                activeMember
                  ? 'bg-[#29232b] text-white border-[#29232b] shadow-xs hover:bg-[#3d3440]'
                  : 'bg-white text-[#583e61] border-[#d6a9bd] hover:border-[#583e61] hover:bg-[#f2dce5]/50'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d989a5]`}
              aria-label="Collaborator Gmail sign-in"
            >
              {activeMember ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">
                    Editor: {activeMember.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#bd7896] shrink-0" />
                  <span className="text-[11px]">
                    Collaborator Sign-In
                  </span>
                </>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#29232b] hover:text-[#b25e80] focus-visible:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="lg:hidden bg-[#fbf7f1] border-b border-[#e6dce1] px-6 py-5 flex flex-col gap-4 text-sm font-medium animate-in fade-in slide-in-from-top-2" aria-label="Mobile Navigation">
            <a
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#e6dce1]/60 text-[#645965] hover:text-[#b25e80]"
            >
              Our Story
            </a>
            <a
              href="#collection"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#e6dce1]/60 text-[#645965] hover:text-[#b25e80]"
            >
              Collection
            </a>
            <a
              href="#prices"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#e6dce1]/60 text-[#645965] hover:text-[#b25e80]"
            >
              Prices & Sizes
            </a>
            <a
              href="#visit"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#e6dce1]/60 text-[#645965] hover:text-[#b25e80]"
            >
              How to Order (Social Links & SJDM)
            </a>
            <a
              href="#craft"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#e6dce1]/60 text-[#645965] hover:text-[#b25e80]"
            >
              Our Craft
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-[#583e61] font-semibold hover:text-[#b25e80] flex items-center justify-between"
            >
              <span>Our Official Pages (FB & IG)</span>
              <span>↗</span>
            </a>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 text-center text-xs font-semibold bg-[#583e61] text-white rounded-sm flex items-center justify-center gap-2"
              >
                <span>Message on Facebook Page to Order</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#e5b6cc]" />
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortal();
                }}
                className="w-full py-2.5 px-3 text-center text-xs font-semibold bg-white border border-[#cdb9c8] text-[#583e61] rounded-sm flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-[#d989a5]" />
                <span>{activeMember ? `Editor: ${activeMember.name}` : 'Collaborator Sign-In via Gmail'}</span>
              </button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};
