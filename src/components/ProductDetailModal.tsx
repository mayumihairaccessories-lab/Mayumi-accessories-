import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Sparkles, ExternalLink, Copy, Facebook, Instagram, Video, Edit3, Camera, Play, Film, Image as ImageIcon } from 'lucide-react';
import { Product, ProductSize, TeamMember } from '../types/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  activeMember?: TeamMember | null;
  onEditProduct?: (product: Product) => void;
  onAddToCart?: (product: Product, size: ProductSize) => void;
  initialMediaMode?: 'photo' | 'video';
}

function getEmbedUrl(url?: string): string {
  if (!url) return '';
  try {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
    }
    if (url.includes('youtube.com/shorts/')) {
      const id = url.split('youtube.com/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
    }
  } catch {
    // fallback
  }
  return url;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  activeMember,
  onEditProduct,
  initialMediaMode = 'photo',
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.size === 'Both Sizes Available' ? 'Gamay (Small · 3.2 cm)' : product.size
  );
  const [activePhoto, setActivePhoto] = useState<string>(product.image);
  const [mediaMode, setMediaMode] = useState<'photo' | 'video'>(
    initialMediaMode === 'video' && product.video ? 'video' : 'photo'
  );
  const [copied, setCopied] = useState(false);

  // Sync active photo and media mode when product changes
  useEffect(() => {
    if (product) {
      setActivePhoto(product.image);
      if (initialMediaMode === 'video' && product.video) {
        setMediaMode('video');
      } else {
        setMediaMode('photo');
      }
    }
  }, [product?.id, product?.image, initialMediaMode]);

  const allPhotos = [product.image, ...(product.images || [])].filter(
    (url, idx, arr) => Boolean(url) && arr.indexOf(url) === idx
  );

  const fbOrderUrl = 'https://www.facebook.com/profile.php?id=61568215620941';
  const igOrderUrl = 'https://www.instagram.com/mayumihairaccessories/';
  const tiktokUrl = 'https://www.tiktok.com/@mayumihairaccessories';

  const orderMessageText = `Hi MAYUMI! I'd like to order: "${product.name}" in ${selectedSize} (₱${product.price}). Is this available?`;

  const handleCopyDetails = () => {
    navigator.clipboard.writeText(orderMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-[#fbf7f1] w-full max-w-3xl rounded-xl border border-[#e6dce1] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#e6dce1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#8c657f] font-bold uppercase">
              Handcrafted Product Details
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeMember && onEditProduct && (
              <button
                onClick={() => {
                  onClose();
                  onEditProduct(product);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors"
                title="Edit this product details, pictures & video"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#d989a5]" />
                <span>Edit & Media</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#766a75] hover:text-[#29232b] rounded-full hover:bg-slate-100"
              aria-label="Close product details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* Product Media Frame (Photos & Video) */}
          <div className="flex flex-col gap-3">
            
            {/* Media Mode Tabs Switcher (when product has video) */}
            {product.video && (
              <div className="flex items-center gap-1 p-1 bg-white border border-[#e6dce1] rounded-lg shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMediaMode('photo')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    mediaMode === 'photo'
                      ? 'bg-[#583e61] text-white shadow-xs'
                      : 'text-[#766a75] hover:text-[#29232b] hover:bg-[#f2dce5]/50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photos ({allPhotos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode('video')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    mediaMode === 'video'
                      ? 'bg-[#583e61] text-white shadow-xs'
                      : 'text-[#583e61] hover:bg-[#f2dce5]/50 font-bold'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#d989a5]" />
                  <span>Video Showcase</span>
                </button>
              </div>
            )}

            {/* Main Visual Display Frame */}
            <div className="relative rounded-lg overflow-hidden bg-[#eadde7] border border-[#e6dce1] shadow-xs flex items-center justify-center min-h-[300px] sm:min-h-[380px]">
              
              {mediaMode === 'video' && product.video ? (
                /* Video Player */
                <div className="w-full h-full min-h-[320px] bg-black flex flex-col items-center justify-center">
                  {product.video.includes('youtube.com') || product.video.includes('youtu.be') ? (
                    <iframe
                      src={getEmbedUrl(product.video)}
                      title={`${product.name} Video Showcase`}
                      className="w-full h-[360px] sm:h-[400px] border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={product.video}
                      controls
                      autoPlay
                      playsInline
                      loop
                      className="w-full h-full max-h-[420px] object-contain"
                    />
                  )}

                  {product.videoTitle && (
                    <div className="w-full bg-[#29232b] text-white text-[11px] py-1.5 px-3 text-center truncate font-medium">
                      🎥 {product.videoTitle}
                    </div>
                  )}
                </div>
              ) : (
                /* Main Photo */
                <>
                  <img
                    src={activePhoto}
                    alt={product.name}
                    className="w-full h-full object-cover object-center max-h-[420px] transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero-product.jpg';
                    }}
                  />
                  {product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#583e61] text-[#fff7fb] text-[10px] font-bold px-2.5 py-1 rounded-xs tracking-wider">
                      FEATURED DESIGN
                    </span>
                  )}

                  {/* If product has video, show quick play badge over image */}
                  {product.video && (
                    <button
                      type="button"
                      onClick={() => setMediaMode('video')}
                      className="absolute top-3 right-3 bg-[#583e61]/90 hover:bg-[#583e61] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-transform hover:scale-105"
                    >
                      <Play className="w-3 h-3 fill-current text-[#d989a5]" />
                      <span>Watch Video</span>
                    </button>
                  )}

                  {/* Collaborator Quick Photo Edit Badge */}
                  {activeMember && onEditProduct && (
                    <button
                      onClick={() => {
                        onClose();
                        onEditProduct(product);
                      }}
                      className="absolute bottom-3 right-3 bg-[#29232b]/80 hover:bg-[#29232b] text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-colors"
                      title="Change or add pictures for this product"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#d989a5]" />
                      <span>Edit Media</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Row (Photos + Video thumbnail) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allPhotos.map((photoUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActivePhoto(photoUrl);
                    setMediaMode('photo');
                  }}
                  className={`w-14 h-14 rounded-sm overflow-hidden border-2 shrink-0 transition-all ${
                    mediaMode === 'photo' && activePhoto === photoUrl
                      ? 'border-[#583e61] ring-2 ring-[#d989a5]'
                      : 'border-[#e6dce1] opacity-70 hover:opacity-100'
                  }`}
                  title={`View photo ${idx + 1}`}
                >
                  <img
                    src={photoUrl}
                    alt={`${product.name} angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}

              {/* Video Thumbnail Button */}
              {product.video && (
                <button
                  type="button"
                  onClick={() => setMediaMode('video')}
                  className={`w-14 h-14 rounded-sm overflow-hidden border-2 shrink-0 transition-all bg-[#583e61] text-white flex flex-col items-center justify-center gap-0.5 ${
                    mediaMode === 'video'
                      ? 'border-[#bd7896] ring-2 ring-[#d989a5]'
                      : 'border-[#583e61] opacity-85 hover:opacity-100'
                  }`}
                  title="Play Product Video Showcase"
                >
                  <Play className="w-4 h-4 fill-current text-[#d989a5]" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Details & Ordering Links */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-[#8c657f] tracking-wider uppercase block mb-1">
                Category: {product.category}
              </span>

              <h2 className="font-serif text-3xl font-medium text-[#29232b] leading-tight">
                {product.name}
              </h2>

              <p className="text-xs text-[#766a75] mt-1 italic">
                "{product.tagline}"
              </p>

              <div className="font-serif text-3xl text-[#bd7896] font-normal my-4">
                ₱{product.price}
              </div>

              <p className="text-xs sm:text-[13px] text-[#645965] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Size Selector */}
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-semibold text-[#29232b]">
                  Choose Clip Size to Inquire:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSize('Gamay (Small · 3.2 cm)')}
                    className={`p-2.5 text-xs text-left rounded-sm border transition-all ${
                      selectedSize === 'Gamay (Small · 3.2 cm)'
                        ? 'border-[#583e61] bg-[#583e61] text-white font-medium'
                        : 'border-[#e6dce1] bg-white text-[#29232b] hover:border-[#d989a5]'
                    }`}
                  >
                    <strong>Gamay (3.2cm)</strong>
                    <span className="block text-[10px] opacity-80">Subtle / Everyday</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSize('Dako (Big · 5.5 cm)')}
                    className={`p-2.5 text-xs text-left rounded-sm border transition-all ${
                      selectedSize === 'Dako (Big · 5.5 cm)'
                        ? 'border-[#583e61] bg-[#583e61] text-white font-medium'
                        : 'border-[#e6dce1] bg-white text-[#29232b] hover:border-[#d989a5]'
                    }`}
                  >
                    <strong>Dako (5.5cm)</strong>
                    <span className="block text-[10px] opacity-80">Statement / Thicker Hair</span>
                  </button>
                </div>
              </div>

              {/* Quality Badges */}
              <div className="border-t border-[#e6dce1] pt-4 space-y-2 text-[11px] text-[#766a75]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Non-toxic, lightweight Filipino clay recipe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#bd7896]" />
                  <span>Coated with water-resistant protective sealant</span>
                </div>
              </div>
            </div>

            {/* Direct Social Ordering Links */}
            <div className="pt-4 border-t border-[#e6dce1] space-y-3">
              <div className="text-xs text-[#583e61] font-semibold flex items-center justify-between">
                <span>How to Order This Piece:</span>
                <span className="text-[11px] text-[#8c657f] font-normal">Click your preferred page below:</span>
              </div>

              {/* Primary Link: Facebook Page */}
              <a
                href={fbOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#1877F2] text-white text-xs sm:text-sm font-semibold rounded-sm hover:bg-[#166fe5] transition-all flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  <span>Order on Facebook Page (MAYUMI)</span>
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Secondary Link: Instagram DM */}
              <a
                href={igOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs sm:text-sm font-semibold rounded-sm hover:opacity-95 transition-all flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  <span>Order via Instagram DM (@mayumihairaccessories)</span>
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Copy message helper */}
              <button
                type="button"
                onClick={handleCopyDetails}
                className="w-full py-2 px-3 bg-white border border-[#cdb9c8] text-[#583e61] text-xs font-medium rounded-sm hover:bg-[#f2dce5]/40 transition-colors flex items-center justify-center gap-2"
                title="Copy order inquiry text to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied! Paste into your chat message.</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#bd7896]" />
                    <span>Copy inquiry: "{product.name} ({selectedSize})"</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
