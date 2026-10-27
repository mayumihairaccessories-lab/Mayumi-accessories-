import React, { useState, useEffect, useRef } from 'react';
import {
  MayumiStoreState,
  Product,
  ProductSize,
  OrderItem,
  CustomerOrder,
  SiteContent,
  TeamMember,
  OrderStatus,
  StoreSettings
} from './types/store';
import { initialStoreData } from './data/defaultData';
import {
  fetchStoreData,
  fetchStoreVersion,
  subscribeToProducts,
  saveProduct,
  deleteProduct,
  updateSiteContent,
  submitOrder,
  updateOrderStatus,
  saveTeamMember,
  updateStoreSettings
} from './services/api';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TickerBar } from './components/TickerBar';
import { StorySection } from './components/StorySection';
import { CollectionSection } from './components/CollectionSection';
import { PricesAndSizesSection } from './components/PricesAndSizesSection';
import { VisitAndOrderSection } from './components/VisitAndOrderSection';
import { CraftSection } from './components/CraftSection';
import { QuoteBand } from './components/QuoteBand';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

import { OrderDrawer } from './components/OrderDrawer';
import { SizeGuideModal } from './components/SizeGuideModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShareLiveModal } from './components/ShareLiveModal';
import { PartnerPortalModal } from './components/PartnerPortalModal';

export default function App() {
  const [store, setStore] = useState<MayumiStoreState>(initialStoreData);
  const [loading, setLoading] = useState(true);

  // Active logged-in group member (null means customer view)
  const [activeMember, setActiveMember] = useState<TeamMember | null>(() => {
    try {
      const saved = localStorage.getItem('mayumi_active_collaborator');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const handleSetActiveMember = (member: TeamMember | null) => {
    setActiveMember(member);
    try {
      if (member) {
        localStorage.setItem('mayumi_active_collaborator', JSON.stringify(member));
      } else {
        localStorage.removeItem('mayumi_active_collaborator');
      }
    } catch {
      // ignore
    }
  };

  // Cart / Bag state
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Private Store Gate state (if store is set to private invite-only mode)
  const [customerUnlocked, setCustomerUnlocked] = useState(false);
  const [customerCodeInput, setCustomerCodeInput] = useState('');
  const [customerGateError, setCustomerGateError] = useState('');

  // Store version ref for comparison in polling
  const storeVersionRef = useRef<number>(store.version || 0);
  useEffect(() => {
    storeVersionRef.current = store.version || 0;
  }, [store.version]);

  // Load store data on mount + keep in sync with any collaborator edits across all devices via Firestore
  useEffect(() => {
    let mounted = true;

    const syncWithServer = async () => {
      try {
        const fresh = await fetchStoreData();
        if (mounted) {
          setStore(fresh);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    // Initial load from Cloud Firestore
    syncWithServer();

    // Real-time Firestore Snapshot Listener:
    // Any collaborator addition, edit, or deletion reflects instantly across all open visitor tabs and devices
    let unsubscribeProducts: (() => void) | null = null;
    try {
      unsubscribeProducts = subscribeToProducts((freshProducts) => {
        if (mounted) {
          setStore(prev => ({
            ...prev,
            products: freshProducts
          }));
          setLoading(false);
        }
      });
    } catch (err) {
      console.warn('Real-time listener initialization note:', err);
    }

    // Polling fallback: check every 6 seconds if another collaborator made an edit
    const interval = setInterval(async () => {
      if (!mounted) return;
      const ver = await fetchStoreVersion();
      if (ver && typeof ver.version === 'number' && ver.version !== storeVersionRef.current) {
        await syncWithServer();
      }
    }, 6000);

    // Refresh immediately when visitor switches tabs or focuses window
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncWithServer();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // Cross-tab broadcast listener for instant sync
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('mayumi_store_sync');
        bc.onmessage = () => {
          if (mounted) syncWithServer();
        };
      }
    } catch {
      // ignore
    }

    return () => {
      mounted = false;
      unsubscribeProducts?.();
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      bc?.close();
    };
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product, size?: ProductSize) => {
    const finalSize = size || (product.size === 'Both Sizes Available' ? 'Gamay (Small · 3.2 cm)' : product.size);
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id && i.size === finalSize);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id && i.size === finalSize
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          size: finalSize,
          price: product.price,
          quantity: 1,
          image: product.image
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId, size);
      return;
    }
    setCartItems(prev =>
      prev.map(i =>
        i.productId === productId && i.size === size
          ? { ...i, quantity }
          : i
      )
    );
  };

  const handleRemoveCartItem = (productId: string, size: string) => {
    setCartItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order submission
  const handleSubmitOrder = async (orderData: Omit<CustomerOrder, 'id' | 'createdAt' | 'status'>) => {
    const order = await submitOrder(orderData);
    // Refresh store to reflect new order in CMS
    const updated = await fetchStoreData();
    setStore(updated);
    return order;
  };

  // Product mutations from portal
  const handleSaveProduct = async (productData: Partial<Product>, memberName: string) => {
    // Generate optimistic product object so the UI updates instantly
    const isNew = !productData.id || productData.id.startsWith('temp-');
    const finalId = isNew ? 'prod-' + Date.now() : productData.id!;
    const optimisticProd: Product = {
      id: finalId,
      name: (productData.name || 'Handmade Clay Hair Clip').trim(),
      tagline: (productData.tagline || 'Handcrafted with care').trim(),
      description: (productData.description || '').trim(),
      price: Math.max(0, Number(productData.price) || 250),
      size: productData.size || 'Both Sizes Available',
      image: productData.image || '/images/hero-product.jpg',
      images: productData.images && productData.images.length > 0 ? productData.images : [productData.image || '/images/hero-product.jpg'],
      category: productData.category || 'Floral',
      inStock: productData.inStock !== false,
      stockCount: Math.max(0, Number(productData.stockCount) || 10),
      isFeatured: !!productData.isFeatured,
      video: productData.video || undefined,
      videoType: productData.videoType || undefined,
      videoTitle: productData.videoTitle || undefined,
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedBy: memberName
    };

    setStore(prev => {
      const idx = prev.products.findIndex(p => p.id === finalId);
      if (idx >= 0) {
        const next = [...prev.products];
        next[idx] = optimisticProd;
        return { ...prev, products: next };
      }
      return { ...prev, products: [optimisticProd, ...prev.products] };
    });

    const saved = await saveProduct(productData, memberName);
    const updated = await fetchStoreData();
    setStore(updated);
    return saved;
  };

  const handleDeleteProduct = async (productId: string, memberName: string) => {
    // Optimistic UI update: instantly remove from store state
    setStore(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
    // Remove from cart if present
    setCartItems(prev => prev.filter(item => item.productId !== productId));
    if (viewingProduct?.id === productId) {
      setViewingProduct(null);
    }

    const res = await deleteProduct(productId, memberName);
    const updated = await fetchStoreData();
    setStore(updated);
    return res;
  };

  // Content mutations from portal
  const handleUpdateContent = async (contentData: Partial<SiteContent>, memberName: string) => {
    const updatedContent = await updateSiteContent(contentData, memberName);
    setStore(prev => ({ ...prev, content: updatedContent }));
    return updatedContent;
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, memberName: string) => {
    await updateOrderStatus(orderId, status, memberName);
    const updated = await fetchStoreData();
    setStore(updated);
  };

  // Team member update
  const handleSaveTeamMember = async (member: Partial<TeamMember>, actingMember: string) => {
    const members = await saveTeamMember(member, actingMember);
    setStore(prev => ({ ...prev, teamMembers: members }));
    return members;
  };

  // Settings update (.com domain, pin, privacy)
  const handleUpdateSettings = async (settingsData: Partial<StoreSettings>, memberName: string) => {
    const updatedSettings = await updateStoreSettings(settingsData, memberName);
    setStore(prev => ({
      ...prev,
      settings: updatedSettings,
      adminPin: updatedSettings.adminPin || prev.adminPin
    }));
    return updatedSettings;
  };

  // Restore backup
  const handleRestoreBackup = async (data: MayumiStoreState, memberName: string) => {
    try {
      await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, member: memberName })
      });
    } catch {
      // ignore
    }
    setStore(data);
  };

  // Reset defaults
  const handleResetDefaults = async (memberName: string) => {
    try {
      await fetch('/api/backup/reset-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: memberName })
      });
    } catch {
      // ignore
    }
    setStore(JSON.parse(JSON.stringify(initialStoreData)));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if store is set to Private mode and user is locked out
  const isPrivateMode = store.settings?.isPrivateStore && !activeMember && !customerUnlocked;

  return (
    <div className="min-h-screen bg-[#fbf7f1] text-[#29232b] flex flex-col font-sans relative selection:bg-[#f2dce5] selection:text-[#583e61]">
      
      {/* Navbar with Sticky Announcement, .com Brand & Controls */}
      <Navbar
        content={store.content}
        settings={store.settings}
        cartCount={totalCartCount}
        activeMember={activeMember}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Private Customer Access Gate (if enabled in settings) */}
      {isPrivateMode ? (
        <div className="flex-1 flex items-center justify-center p-6 py-20">
          <div className="bg-white p-8 rounded-xl border border-[#d6a9bd] shadow-lg max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#f2dce5] text-[#583e61] flex items-center justify-center mx-auto font-serif text-2xl font-bold">
              M
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#29232b]">Exclusive Customer Access</h2>
              <p className="text-xs text-[#766a75] mt-1.5 leading-relaxed">
                This store catalog is currently in private viewing mode. Enter your visitor passcode to browse and order clips.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const expected = store.settings?.customerPasscode || 'MAYUMI';
                if (customerCodeInput.toUpperCase() === expected.toUpperCase()) {
                  setCustomerUnlocked(true);
                  setCustomerGateError('');
                } else {
                  setCustomerGateError('Incorrect visitor code. Ask the MAYUMI team on Instagram.');
                }
              }}
              className="space-y-4"
            >
              <div>
                <input
                  type="text"
                  placeholder="Enter passcode (e.g. MAYUMI)"
                  value={customerCodeInput}
                  onChange={(e) => setCustomerCodeInput(e.target.value)}
                  className="w-full text-center text-sm p-3 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm font-mono tracking-widest uppercase focus:outline-none focus:border-[#d989a5]"
                  autoFocus
                />
                {customerGateError && <p className="text-[11px] text-rose-600 mt-1 font-medium">{customerGateError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b]"
              >
                Enter Store Catalog
              </button>
            </form>

            <div className="pt-4 border-t border-[#e6dce1] flex items-center justify-between text-xs">
              <a
                href={store.content.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#bd7896] hover:underline"
              >
                Ask code on Instagram
              </a>
              <button
                type="button"
                onClick={() => setIsPortalOpen(true)}
                className="text-[#583e61] font-semibold hover:underline"
              >
                Collab Partner Login
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Main Storefront: Publicly visible for visitors to browse & order */
        <main className="flex-1" id="home">
          <HeroSection
            content={store.content}
            onExploreClick={() => {
              const el = document.getElementById('collection');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <TickerBar />

          <StorySection
            content={store.content}
            teamMembers={store.teamMembers}
          />

          <CollectionSection
            products={store.products}
            activeMember={activeMember}
            onQuickView={(prod) => setViewingProduct(prod)}
            onEditProduct={() => {
              setIsPortalOpen(true);
            }}
            onAddNewProduct={() => {
              setIsPortalOpen(true);
            }}
          />

          <PricesAndSizesSection
            content={store.content}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />

          <VisitAndOrderSection
            content={store.content}
          />

          <CraftSection
            content={store.content}
          />

          <QuoteBand
            content={store.content}
          />

          <ContactSection
            content={store.content}
          />
        </main>
      )}

      {/* Footer */}
      <Footer
        onOpenPortal={() => setIsPortalOpen(true)}
        customDomain={store.settings?.customDomain}
      />

      {/* Size Guide Modal (Gamay vs Dako) */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Product Quick View / Detail Modal (Viewing Only with Direct Order Links to Official Pages) */}
      <ProductDetailModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        activeMember={activeMember}
        onEditProduct={() => {
          setViewingProduct(null);
          setIsPortalOpen(true);
        }}
      />

      {/* Free Share & .com Domain Info Modal */}
      <ShareLiveModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        settings={store.settings}
      />

      {/* Group Member & Partner Management CMS Portal (Protected) */}
      <PartnerPortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        store={store}
        activeMember={activeMember}
        onSetActiveMember={handleSetActiveMember}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateContent={handleUpdateContent}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onSaveTeamMember={handleSaveTeamMember}
        onUpdateSettings={handleUpdateSettings}
        onRestoreBackup={handleRestoreBackup}
        onResetDefaults={handleResetDefaults}
        onOpenShareModal={() => {
          setIsPortalOpen(false);
          setIsShareModalOpen(true);
        }}
      />

      {/* Floating Collaborator Mode Indicator if Logged in */}
      {activeMember && (
        <div className="fixed bottom-4 left-4 z-40 bg-[#583e61] text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Editor Mode: <strong>{activeMember.name.split(' ')[0]}</strong>
          </span>
          <button
            onClick={() => setIsPortalOpen(true)}
            className="text-[#f2dce5] hover:text-white underline font-semibold text-[11px]"
          >
            Manage
          </button>
          <button
            onClick={() => handleSetActiveMember(null)}
            className="text-[#e5b6cc] hover:text-white text-[11px] font-semibold border-l border-white/20 pl-2"
            title="Log out to view-only mode"
          >
            Exit Editor
          </button>
        </div>
      )}
    </div>
  );
}
