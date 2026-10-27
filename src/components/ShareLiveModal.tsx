import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Globe,
  Shield,
  HelpCircle,
  Share2,
  Facebook,
  Send,
  MessageCircle,
  Mail,
  Smartphone,
  Download
} from 'lucide-react';
import { StoreSettings } from '../types/store';

interface ShareLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: StoreSettings;
}

export const ShareLiveModal: React.FC<ShareLiveModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showDnsGuide, setShowDnsGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'qr' | 'domain'>('share');
  const [currentUrl, setCurrentUrl] = useState('https://ais-pre-4ywep3qbnb2pxpiow5qhzx-558681384342.asia-east1.run.app');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      // If we are running on a non-localhost preview URL, use it; otherwise use the shared cloud URL
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        setCurrentUrl(origin);
      }
    }
  }, []);

  if (!isOpen) return null;

  const customDomain = settings?.customDomain || 'www.mayumiaccessories.com';
  const customDomainUrl = customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
  const shareTargetUrl = currentUrl;

  const shareTitle = 'MAYUMI Accessories - Handmade Clay Hair Clips';
  const shareText = 'Check out MAYUMI Accessories! Handmade polymer clay hair clips crafted with Filipino heart in San Jose del Monte, Bulacan.';
  const sharePromoPost = `🌸 Check out MAYUMI Accessories!
Handmade polymer clay hair clips crafted with love and care in San Jose del Monte, Bulacan.
Explore the full collection and order directly on our official pages:
${shareTargetUrl}

#MAYUMIAccessories #HandmadeClayClips #FilipinaCraft`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareTargetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(sharePromoPost);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleCopyCustomDomain = async () => {
    try {
      await navigator.clipboard.writeText(customDomainUrl);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    } catch {
      // fallback
    }
  };

  // Native Web Share API (Mobile Safari, Chrome, etc.)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareTargetUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Direct Social Share URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareTargetUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareTargetUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareTargetUrl}`)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareTargetUrl)}&text=${encodeURIComponent(shareText)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nVisit our website: ${shareTargetUrl}`)}`;

  // QR code image URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    shareTargetUrl
  )}&color=583e61&bgcolor=fbf7f1`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#fbf7f1] w-full max-w-xl rounded-2xl border border-[#e6dce1] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#e6dce1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f2dce5] flex items-center justify-center text-[#583e61]">
              <Share2 className="w-4 h-4 text-[#bd7896]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-[#29232b] leading-tight">
                Share MAYUMI Website
              </h2>
              <p className="text-[11px] text-[#766a75]">
                Share our handcrafted clip catalog with friends, customers & classmates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#766a75] hover:text-[#29232b] rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e6dce1] bg-[#f8f3ed] px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('share')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'share'
                ? 'border-[#583e61] text-[#583e61] font-bold'
                : 'border-transparent text-[#766a75] hover:text-[#29232b]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#bd7896]" />
            <span>Share Link & Socials</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'qr'
                ? 'border-[#583e61] text-[#583e61] font-bold'
                : 'border-transparent text-[#766a75] hover:text-[#29232b]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#bd7896]" />
            <span>Printable QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('domain')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'domain'
                ? 'border-[#583e61] text-[#583e61] font-bold'
                : 'border-transparent text-[#766a75] hover:text-[#29232b]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#bd7896]" />
            <span>Custom .com Domain</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">

          {/* TAB 1: SHARE LINK & SOCIALS */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              
              {/* Primary Website Share Link Card */}
              <div className="bg-white p-5 rounded-xl border border-[#e6dce1] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#766a75] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#bd7896]" />
                    Official Website Link
                  </span>
                  <span className="text-[10px] font-semibold bg-[#e7f7ed] text-[#1c7841] px-2 py-0.5 rounded-full">
                    Live 24/7
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-xs sm:text-sm font-semibold text-[#583e61] bg-[#fbf7f1] px-3.5 py-2.5 rounded-lg border border-[#e6dce1] truncate select-all">
                    {shareTargetUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-lg hover:bg-[#432d4b] transition-all flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#d989a5]" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                {copiedLink && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Website link copied to clipboard! You can paste it anywhere.</span>
                  </p>
                )}
              </div>

              {/* Native Mobile Share Sheet Button */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 bg-[#f2dce5] hover:bg-[#edd0dc] text-[#583e61] border border-[#d6a9bd] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Smartphone className="w-4 h-4 text-[#bd7896]" />
                  <span>Share via Apps (Messenger, Instagram, AirDrop, etc.)</span>
                </button>
              )}

              {/* 1-Click Social Media Sharing Options */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#766a75] block">
                  Quick Share to Social Platforms
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <a
                    href={facebookShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </a>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1c9849] border border-[#25D366]/30 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 bg-[#29232b]/5 hover:bg-[#29232b]/15 text-[#29232b] border border-[#29232b]/20 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
                  >
                    <span className="font-bold text-sm">𝕏</span>
                    <span>Post</span>
                  </a>

                  <a
                    href={telegramShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>

              {/* Ready-to-Post Caption Box for Instagram / FB Story */}
              <div className="bg-white p-4 rounded-xl border border-[#e6dce1] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#766a75]">
                    Ready-to-Post Caption / Message
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="text-[11px] text-[#bd7896] hover:text-[#583e61] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCaption ? 'Copied Post Text!' : 'Copy Caption'}</span>
                  </button>
                </div>
                <div className="p-3 bg-[#fbf7f1] rounded-lg border border-[#e6dce1] text-xs text-[#583e61] font-sans leading-relaxed whitespace-pre-line select-all">
                  {sharePromoPost}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRINTABLE QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-5">
              <div className="p-6 bg-white rounded-xl border border-[#e6dce1] flex flex-col sm:flex-row items-center gap-6 shadow-xs">
                <div className="w-40 h-40 bg-[#fbf7f1] p-3 border-2 border-[#d6a9bd] rounded-xl shrink-0 flex items-center justify-center shadow-inner">
                  <img
                    src={qrCodeUrl}
                    alt="MAYUMI Accessories Website QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-center sm:text-left space-y-2.5">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-serif font-bold text-[#583e61]">
                    <QrCode className="w-4 h-4 text-[#bd7896]" />
                    <span>Scan with Any Smartphone</span>
                  </div>
                  <p className="text-xs text-[#766a75] leading-relaxed">
                    Point any phone camera to instantly open the MAYUMI Accessories store catalog. Perfect for printing and displaying on your table booth in Minuyan SJDM Bulacan or school presentation boards!
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <a
                      href={qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#583e61] text-white text-xs font-semibold rounded-md hover:bg-[#432d4b] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download / Open High-Res QR</span>
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 bg-white border border-[#cdb9c8] text-[#583e61] text-xs font-semibold rounded-md hover:bg-[#f2dce5] transition-colors flex items-center gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#bd7896]" />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM .COM DOMAIN */}
          {activeTab === 'domain' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border-2 border-[#583e61] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#8c657f] uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#bd7896]" />
                    Branded .com Web Address
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-xs">
                    OFFICIAL
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm font-bold text-[#583e61] bg-[#fbf7f1] px-3.5 py-2.5 rounded-md border border-[#e6dce1] truncate select-all">
                    {customDomain}
                  </div>
                  <button
                    onClick={handleCopyCustomDomain}
                    className="px-4 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-md hover:bg-[#432d4b] transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedDomain ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#d989a5]" />}
                    <span>{copiedDomain ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#766a75] leading-relaxed">
                  Use <strong>{customDomain}</strong> on your marketing flyers, business cards, stickers, and Instagram bio.
                </p>
              </div>

              {/* Accordion / Info on Connecting Domain */}
              <div className="p-4 bg-white rounded-lg border border-[#e6dce1] space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDnsGuide(!showDnsGuide)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#583e61] hover:text-[#bd7896]"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#bd7896]" />
                    <span>How to connect your own purchased .com domain</span>
                  </span>
                  <span className="text-xs font-bold">{showDnsGuide ? '−' : '+'}</span>
                </button>

                {showDnsGuide && (
                  <div className="pt-2 text-[11px] text-[#766a75] space-y-2 border-t border-[#e6dce1]/60">
                    <p>
                      <strong>Free Domain Forwarding:</strong> In your domain registrar (GoDaddy, Namecheap, etc.), go to DNS / Forwarding and forward <code>{customDomain}</code> directly to your live app URL <code>{currentUrl}</code>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3.5 bg-[#f2e7ec]/70 rounded-xl border border-[#e6dce1] flex items-start gap-2.5 text-xs text-[#583e61]">
            <Shield className="w-4 h-4 text-[#bd7896] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Safe for Public Sharing:</strong> Visitors accessing this link browse the catalog in view-only mode and order through your official pages. Only team collaborators with authorized credentials can edit content.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#8c657f]">
              MAYUMI Accessories · Bulacan, Philippines
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#29232b] text-white text-xs font-semibold rounded-lg hover:bg-[#3d3440] transition-colors"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
