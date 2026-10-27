import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Globe, Shield, HelpCircle, ArrowRight } from 'lucide-react';
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
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedCloudRun, setCopiedCloudRun] = useState(false);
  const [showDnsGuide, setShowDnsGuide] = useState(false);

  if (!isOpen) return null;

  const customDomain = settings?.customDomain || 'www.mayumiaccessories.com';
  const customDomainUrl = customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
  const cloudRunLiveUrl = 'https://ais-pre-u3wcxkfwqwxz6p2xh7o2s7-52688120511.asia-east1.run.app';

  const handleCopyCustom = () => {
    navigator.clipboard.writeText(customDomainUrl);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 3000);
  };

  const handleCopyCloudRun = () => {
    navigator.clipboard.writeText(cloudRunLiveUrl);
    setCopiedCloudRun(true);
    setTimeout(() => setCopiedCloudRun(false), 3000);
  };

  // QR code API url targeting the custom domain URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    customDomainUrl
  )}&color=583e61&bgcolor=fbf7f1`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#fbf7f1] w-full max-w-2xl rounded-xl border border-[#e6dce1] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#e6dce1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#bd7896]" />
            <h2 className="font-serif text-lg font-medium text-[#29232b]">
              Your .com Domain & Free Live Website Link
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#766a75] hover:text-[#29232b] rounded-full hover:bg-slate-100"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Custom .com Domain Box */}
          <div className="bg-white p-5 rounded-xl border-2 border-[#583e61] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#8c657f] uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#bd7896]" />
                Official Business Domain (.com)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-xs">
                BRANDED URL
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-sm sm:text-base font-bold text-[#583e61] bg-[#fbf7f1] px-3.5 py-2.5 rounded-sm border border-[#e6dce1] truncate">
                {customDomain}
              </div>
              <button
                onClick={handleCopyCustom}
                className="px-4 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedDomain ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#d989a5]" />}
                <span>{copiedDomain ? 'Copied .com!' : 'Copy .com'}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#766a75] leading-relaxed">
              Use <strong>{customDomain}</strong> on all your business cards, packaging stickers, school project proposals, and Instagram bio.
            </p>
          </div>

          {/* Active Free Cloud Run Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#29232b]">
              Direct Cloud Run Live Link (Free 24/7 Hosting):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={cloudRunLiveUrl}
                className="flex-1 text-xs font-mono p-2.5 bg-white border border-[#e6dce1] rounded-sm text-[#583e61] select-all focus:outline-none"
              />
              <button
                onClick={handleCopyCloudRun}
                className="px-3.5 py-2.5 bg-white border border-[#cdb9c8] text-[#583e61] text-xs font-semibold rounded-sm hover:bg-[#f2dce5] transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedCloudRun ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#bd7896]" />}
                <span>{copiedCloudRun ? 'Copied Link' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-[#8c657f]">
              This link is hosted for free by Google Cloud Run. You don't pay any server or hosting fees.
            </p>
          </div>

          {/* QR Code Section */}
          <div className="p-5 bg-white rounded-lg border border-[#e6dce1] flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-[#fbf7f1] p-2 border border-[#d6a9bd] rounded-md shrink-0 flex items-center justify-center">
              <img
                src={qrCodeUrl}
                alt="MAYUMI Accessories QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#583e61]">
                <QrCode className="w-4 h-4 text-[#bd7896]" />
                <span>Printable QR Code for Your Pop-Up Booth</span>
              </div>
              <p className="text-xs text-[#766a75] leading-relaxed">
                Scan with any smartphone camera to open <strong>{customDomain}</strong>. Perfect for placing on your table in Minuyan SJDM Bulacan or school presentation boards!
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDnsGuide(!showDnsGuide)}
                  className="text-xs font-semibold text-[#bd7896] hover:text-[#583e61] underline inline-flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showDnsGuide ? 'Hide .com Domain Setup Guide' : 'How to connect your own purchased .com domain'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step-by-Step .com Setup Guide Accordion */}
          {showDnsGuide && (
            <div className="bg-white p-5 rounded-lg border border-[#d6a9bd] space-y-3 text-xs text-[#29232b] animate-in fade-in">
              <strong className="block text-sm font-serif text-[#583e61]">
                How to Connect a Purchased .com (e.g. mayumiaccessories.com)
              </strong>
              <p className="text-[11px] text-[#766a75] leading-relaxed">
                Web browsers require an Internet Domain Registrar (like Namecheap, GoDaddy, or Google Domains) to route <code>.com</code> traffic to a web server. Here are the 2 easiest free options:
              </p>

              <div className="space-y-2.5 pt-1 text-[11px]">
                <div className="p-3 bg-[#fbf7f1] rounded-sm border border-[#e6dce1]">
                  <strong>Option A: Free Domain Forwarding (Recommended for Student Projects)</strong>
                  <p className="text-[#766a75] mt-1">
                    When you buy <code>mayumiaccessories.com</code>, go to your domain settings and enable <strong>URL Redirect / Forwarding</strong> pointing to <code>{cloudRunLiveUrl}</code>. When anyone types <code>mayumiaccessories.com</code>, it automatically opens your live site!
                  </p>
                </div>

                <div className="p-3 bg-[#fbf7f1] rounded-sm border border-[#e6dce1]">
                  <strong>Option B: Cloudflare Free SSL Proxy</strong>
                  <p className="text-[#766a75] mt-1">
                    Add your domain to a free Cloudflare account, set a <code>CNAME</code> record pointing <code>@</code> and <code>www</code> to your Cloud Run host, with automatic free HTTPS encryption.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Collab Friends Note */}
          <div className="p-3.5 bg-[#f2e7ec]/70 rounded-md border border-[#e6dce1] flex items-start gap-2.5 text-xs text-[#583e61]">
            <Shield className="w-4 h-4 text-[#bd7896] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Your Collab Access is Protected:</strong> Public visitors cannot edit your products or access your private partner portal. Only you and your 5 collab friends with the Secret PIN can upload clips and update content.
            </p>
          </div>

          <div className="text-right">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#29232b] text-white text-xs font-semibold rounded-sm hover:bg-[#3d3440]"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
