import React, { useState, useMemo } from 'react';
import { Product, ProductSize, TeamMember } from '../types/store';
import { Search, Eye, Edit3, Plus, Sparkles, ExternalLink, Info, Play, Video } from 'lucide-react';

interface CollectionSectionProps {
  products: Product[];
  activeMember: TeamMember | null;
  onQuickView: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onAddNewProduct: () => void;
  onAddToCart?: (product: Product, selectedSize?: ProductSize) => void;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  products,
  activeMember,
  onQuickView,
  onEditProduct,
  onAddNewProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Floral', 'Whimsical', 'Bestsellers', 'Sets'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // Size filter
      if (selectedSizeFilter === 'Gamay' && !p.size.includes('Gamay') && !p.size.includes('Both')) {
        return false;
      }
      if (selectedSizeFilter === 'Dako' && !p.size.includes('Dako') && !p.size.includes('Both')) {
        return false;
      }
      if (selectedSizeFilter === 'Sets' && !p.size.includes('Set')) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesTag = p.tagline.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesName && !matchesTag && !matchesDesc) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedSizeFilter, searchQuery]);

  return (
    <section id="collection" className="bg-[#f2e7ec] py-20 sm:py-24 lg:py-28 border-y border-[#e6dce1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Viewing-Only Catalog Notice Banner */}
        <div className="mb-10 p-4 sm:p-5 bg-white/90 border border-[#d6a9bd] rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#f2dce5] text-[#583e61] shrink-0">
              <Sparkles className="w-5 h-5 text-[#bd7896]" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-semibold text-[#29232b]">
                Handmade Clay Hair Clips Collection
              </strong>
              <p className="text-[11px] sm:text-xs text-[#766a75] mt-0.5">
                Browse our handcrafted clay hair clips below. To place an order, click any piece to message our Facebook or Instagram page!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeMember ? (
              <button
                onClick={onAddNewProduct}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#d989a5]" />
                <span>Upload New Product</span>
              </button>
            ) : (
              <a
                href="#visit"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#fbf7f1] border border-[#cdb9c8] text-[#583e61] hover:text-[#b25e80] text-xs font-semibold rounded-sm transition-colors"
              >
                <span>How to Order</span>
                <span className="text-xs">↓</span>
              </a>
            )}
          </div>
        </div>

        {/* Header & Description */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8c657f] mb-3">
              02 — THE COLLECTION
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal leading-tight text-[#29232b]">
              Small details, <br />
              <em className="text-[#bd7896] italic font-normal">big personality.</em>
            </h2>
          </div>

          <div className="max-w-sm">
            <p className="text-xs sm:text-sm text-[#766a75] leading-relaxed">
              Discover handmade clay hair clips with playful colors, charming botanical details, and Filipino sisterhood.
            </p>
            {activeMember && (
              <p className="text-[11px] text-emerald-700 font-medium mt-2 bg-emerald-50 px-2 py-1 rounded-sm border border-emerald-200">
                ✓ Editor Mode Active: Click the pencil icon on any piece to update details or photos.
              </p>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-[#e6dce1] mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#583e61] text-white shadow-xs'
                    : 'text-[#645965] hover:text-[#b25e80] hover:bg-[#f2dce5]/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Size Filter & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Size Dropdown Filter */}
            <select
              value={selectedSizeFilter}
              onChange={(e) => setSelectedSizeFilter(e.target.value)}
              className="text-xs bg-[#fbf7f1] border border-[#e6dce1] rounded-sm px-3 py-1.5 text-[#29232b] focus:outline-none focus:border-[#d989a5]"
              aria-label="Filter by clip size"
            >
              <option value="All">All Sizes</option>
              <option value="Gamay">Gamay (3.2cm)</option>
              <option value="Dako">Dako (5.5cm)</option>
              <option value="Sets">Curated Sets</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c657f]" />
              <input
                type="text"
                placeholder="Search clips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm text-[#29232b] placeholder-[#8c657f]/60 focus:outline-none focus:border-[#d989a5]"
              />
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-xl border border-dashed border-[#d6a9bd]">
            <p className="font-serif text-lg text-[#583e61] mb-1">No hair clips found</p>
            <p className="text-xs text-[#766a75] mb-4">Try clearing your filters or search keywords.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSizeFilter('All');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-[#b25e80] underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {filteredProducts.map((product, idx) => {
              const isOffset = idx % 3 === 1;
              const isTall = idx % 2 === 0;

              return (
                <article
                  key={product.id}
                  className={`group relative flex flex-col bg-transparent ${isOffset ? 'lg:mt-10' : ''}`}
                >
                  {/* Product Image Frame */}
                  <div
                    className={`relative w-full ${
                      isTall ? 'h-[360px] sm:h-[400px]' : 'h-[340px] sm:h-[370px]'
                    } bg-[#eadde7] overflow-hidden rounded-sm border border-[#e6dce1] shadow-xs cursor-pointer`}
                    onClick={() => onQuickView(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/hero-product.jpg';
                      }}
                    />

                    {/* Product Index Tag */}
                    <div className="absolute top-3.5 left-3.5 bg-[#fff9f5]/90 backdrop-blur-xs px-2.5 py-1 text-[9px] font-mono tracking-widest text-[#29232b] shadow-xs">
                      M / 0{idx + 1}
                    </div>

                    {/* Stock, Video & Feature Status */}
                    <div className="absolute top-3.5 right-3.5 flex flex-col items-end gap-1">
                      {product.isFeatured && (
                        <span className="bg-[#583e61] text-[#fff7fb] text-[9px] font-bold px-2 py-0.5 rounded-xs tracking-wider">
                          FEATURED
                        </span>
                      )}
                      {product.video && (
                        <span className="bg-[#583e61]/90 backdrop-blur-xs text-[#fff7fb] text-[9px] font-bold px-2 py-0.5 rounded-xs tracking-wider flex items-center gap-1 shadow-xs border border-[#d6a9bd]/40">
                          <Play className="w-2.5 h-2.5 fill-current text-[#d989a5]" />
                          <span>VIDEO</span>
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="bg-[#b25e80] text-white text-[9px] font-bold px-2 py-0.5 rounded-xs tracking-wider">
                          PRE-ORDER
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay Buttons: View Details & Order via Socials (No direct cart add) */}
                    <div className="absolute inset-0 bg-[#29232b]/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="px-4 py-2 bg-white text-[#29232b] text-xs font-semibold rounded-full shadow-md hover:bg-[#f2dce5] transition-colors flex items-center gap-1.5"
                        title="View Clip Details & Order Links"
                        aria-label={`View details for ${product.name}`}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#583e61]" />
                        <span>View Details</span>
                      </button>

                      {/* Only Collaborator & Owner can edit */}
                      {activeMember && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProduct(product);
                          }}
                          className="p-2 bg-[#583e61] text-white rounded-full shadow-md hover:bg-[#432d4b] transition-colors"
                          title="Edit this Product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit3 className="w-4 h-4 text-[#d989a5]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product Metadata Footer */}
                  <div className="pt-3.5 px-0.5 flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3
                        onClick={() => onQuickView(product)}
                        className="font-serif text-lg sm:text-xl font-medium text-[#29232b] leading-snug cursor-pointer hover:text-[#b25e80] transition-colors"
                      >
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-[#766a75] mt-0.5 line-clamp-1">
                        {product.tagline}
                      </p>
                      <span className="inline-block text-[9px] text-[#8c657f] font-mono tracking-wider mt-1">
                        {product.size}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-serif text-base sm:text-lg font-medium text-[#bd7896]">
                        ₱{product.price}
                      </span>
                      <button
                        onClick={() => onQuickView(product)}
                        className="block text-[10px] font-semibold text-[#583e61] hover:text-[#b25e80] mt-1 underline underline-offset-2"
                      >
                        Order on Pages ↗
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Note */}
        <p className="text-[10px] sm:text-[11px] text-[#887784] mt-12 sm:mt-16 text-center max-w-2xl mx-auto leading-relaxed">
          🌸 Handcrafted with care by MAYUMI Accessories. To order, click on any design to open our official Facebook, Instagram, or TikTok links.
        </p>

      </div>
    </section>
  );
};
