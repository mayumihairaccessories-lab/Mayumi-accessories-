import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testConnection } from './firebase';
import { MayumiStoreState, Product, CustomerOrder, SiteContent, TeamMember, StoreSettings } from '../types/store';
import { initialStoreData } from '../data/defaultData';

const LOCAL_STORAGE_KEY = 'mayumi_store_cache_v3';
const BOOTSTRAP_DOC_ID = 'seed_status';

// Test connection on boot
testConnection();

// Cross-tab synchronization broadcast channel
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('mayumi_store_sync');
  }
} catch {
  // ignore
}

export function broadcastStoreChange() {
  try {
    syncChannel?.postMessage({ type: 'STORE_UPDATED', timestamp: Date.now() });
  } catch {
    // ignore
  }
}

/**
 * Bootstraps initial products into Firestore on first app launch if database is fresh.
 * Once bootstrapped, deletions are permanent and will NEVER be re-seeded.
 */
async function ensureFirestoreInitialized(): Promise<void> {
  try {
    const bootstrapRef = doc(db, 'settings', BOOTSTRAP_DOC_ID);
    const bootstrapSnap = await getDoc(bootstrapRef);

    if (bootstrapSnap.exists()) {
      // Already initialized previously. Do not re-seed, respect deleted items!
      return;
    }

    // First time bootstrap: seed default products
    const seedPromises = initialStoreData.products.map(product => {
      return setDoc(doc(db, 'products', product.id), product);
    });

    // Also seed initial content and settings
    seedPromises.push(setDoc(doc(db, 'content', 'main'), { content: initialStoreData.content }));
    seedPromises.push(setDoc(doc(db, 'settings', 'main'), { settings: initialStoreData.settings }));
    seedPromises.push(setDoc(bootstrapRef, {
      seeded: true,
      timestamp: new Date().toISOString()
    }));

    await Promise.all(seedPromises);
    console.log('Firestore initialized with initial MAYUMI product catalog.');
  } catch (err) {
    console.warn('Firestore bootstrap check note:', err);
  }
}

/**
 * Fetch latest store state from Firestore as the primary shared database.
 * If Firestore is temporarily offline, falls back to cache.
 */
export async function fetchStoreData(): Promise<MayumiStoreState> {
  // Check backend server state
  let serverData: MayumiStoreState | null = null;
  try {
    const sResp = await fetch('/api/store');
    if (sResp.ok) {
      serverData = await sResp.json();
    }
  } catch {
    // ignore
  }

  try {
    await ensureFirestoreInitialized();

    // 1. Fetch products from Firestore collection
    const productsPath = 'products';
    let products: Product[] = [];
    try {
      const productsSnapshot = await getDocs(collection(db, productsPath));
      productsSnapshot.forEach(docSnap => {
        const data = docSnap.data() as Product;
        products.push({
          ...data,
          id: docSnap.id
        });
      });
    } catch (err) {
      console.warn('Firestore read products note:', err);
    }

    // If Firestore returned products, sort them
    if (products.length > 0) {
      products.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    } else if (serverData?.products && serverData.products.length > 0) {
      products = serverData.products;
    }

    // 2. Fetch site content
    let content: SiteContent = serverData?.content || initialStoreData.content;
    try {
      const contentSnap = await getDoc(doc(db, 'content', 'main'));
      if (contentSnap.exists() && contentSnap.data().content) {
        content = { ...content, ...contentSnap.data().content };
      }
    } catch {
      // fallback
    }

    // 3. Fetch store settings
    let settings: StoreSettings = serverData?.settings || initialStoreData.settings!;
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'main'));
      if (settingsSnap.exists() && settingsSnap.data().settings) {
        settings = { ...settings, ...settingsSnap.data().settings };
      }
    } catch {
      // fallback
    }

    // 4. Fetch orders
    let orders: CustomerOrder[] = serverData?.orders || [];
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      if (!ordersSnap.empty) {
        orders = [];
        ordersSnap.forEach(docSnap => {
          orders.push({ ...(docSnap.data() as CustomerOrder), id: docSnap.id });
        });
      }
    } catch {
      // fallback
    }

    // Ensure teamMembers ONLY has the 5 Filipina partners
    const fiveFilipinaPartners = (serverData?.teamMembers || initialStoreData.teamMembers).filter(
      m => m.id !== 'partner-bsentrep' && !m.name.toLowerCase().includes('bs entrep')
    );

    const state: MayumiStoreState = {
      ...initialStoreData,
      adminPin: settings.adminPin || '2026',
      products,
      content,
      settings,
      teamMembers: fiveFilipinaPartners,
      orders,
      version: serverData?.version || Date.now()
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }

    return state;
  } catch (err) {
    console.warn('Error reading from Firestore, checking server or local cache:', err);
  }

  // Fallback to server data if available
  if (serverData) {
    return {
      ...serverData,
      teamMembers: (serverData.teamMembers || initialStoreData.teamMembers).filter(
        m => m.id !== 'partner-bsentrep' && !m.name.toLowerCase().includes('bs entrep')
      )
    };
  }

  // Fallback to local storage if network is offline
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      parsed.teamMembers = (parsed.teamMembers || initialStoreData.teamMembers).filter(
        (m: TeamMember) => m.id !== 'partner-bsentrep' && !m.name.toLowerCase().includes('bs entrep')
      );
      return parsed;
    }
  } catch {
    // ignore
  }

  return initialStoreData;
}

/**
 * Lightweight store version check
 */
export async function fetchStoreVersion(): Promise<{ version: number; lastUpdated: string } | null> {
  try {
    const res = await fetch('/api/store/version');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return { version: Date.now(), lastUpdated: new Date().toISOString() };
}

/**
 * Real-time listener for products collection.
 * Triggers instant updates whenever any collaborator adds, edits, or deletes a product.
 */
export function subscribeToProducts(onProductsUpdated: (products: Product[]) => void) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Product;
        products.push({
          ...data,
          id: docSnap.id
        });
      });

      products.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      onProductsUpdated(products);
    },
    (error) => {
      console.warn('Realtime snapshot listener note:', error);
    }
  );
}

/**
 * Permanently delete a product document from Firestore & server database.
 */
export async function deleteProduct(productId: string, memberName: string): Promise<boolean> {
  const path = `products/${productId}`;
  let serverDeleted = false;

  // 1. Delete on Express server
  try {
    const sResp = await fetch(`/api/products/${productId}?member=${encodeURIComponent(memberName)}`, {
      method: 'DELETE'
    });
    if (sResp.ok) {
      serverDeleted = true;
    }
  } catch (err) {
    console.warn('Server delete note:', err);
  }

  // 2. Delete document directly from Cloud Firestore
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    console.warn('Firestore delete note:', err);
    if (!serverDeleted) {
      handleFirestoreError(err, OperationType.DELETE, path);
      return false;
    }
  }

  // 3. Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed: MayumiStoreState = JSON.parse(cached);
      parsed.products = (parsed.products || []).filter(p => p.id !== productId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }

  broadcastStoreChange();
  return true;
}

/**
 * Save or update a product document in Firestore & server database.
 */
export async function saveProduct(product: Partial<Product>, memberName: string): Promise<Product> {
  const isNew = !product.id || product.id.startsWith('temp-');
  const finalId = isNew ? 'prod-' + Date.now() : product.id!;
  const path = `products/${finalId}`;

  const finalProduct: Product = {
    id: finalId,
    name: (product.name || 'Handmade Clay Hair Clip').trim(),
    tagline: (product.tagline || 'Handcrafted with care').trim(),
    description: (product.description || '').trim(),
    price: Math.max(0, Number(product.price) || 250),
    size: product.size || 'Both Sizes Available',
    image: product.image || '/images/hero-product.jpg',
    images: product.images && product.images.length > 0 ? product.images : [product.image || '/images/hero-product.jpg'],
    category: product.category || 'Floral',
    inStock: product.inStock !== false,
    stockCount: Math.max(0, Number(product.stockCount) || 10),
    isFeatured: !!product.isFeatured,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedBy: memberName
  };

  if (product.video && product.video.trim()) {
    finalProduct.video = product.video.trim();
    finalProduct.videoType = product.videoType || 'file';
    if (product.videoTitle && product.videoTitle.trim()) {
      finalProduct.videoTitle = product.videoTitle.trim();
    }
  }

  // 1. Save to Express server API
  let serverSaved = false;
  try {
    const url = isNew ? '/api/products' : `/api/products/${finalId}`;
    const method = isNew ? 'POST' : 'PUT';
    const sResp = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalProduct)
    });
    if (sResp.ok) {
      serverSaved = true;
    }
  } catch (sErr) {
    console.warn('Server API save note:', sErr);
  }

  // 2. Clean undefined properties before writing to Firestore
  // (CRITICAL: Firestore throws "Unsupported field value: undefined" if any field is undefined)
  const cleanFirestorePayload: Record<string, any> = {};
  for (const [k, v] of Object.entries(finalProduct)) {
    if (v !== undefined) {
      cleanFirestorePayload[k] = v;
    }
  }

  try {
    await setDoc(doc(db, 'products', finalId), cleanFirestorePayload, { merge: true });
  } catch (fErr) {
    console.warn('Firestore write note:', fErr);
    if (!serverSaved) {
      handleFirestoreError(fErr, OperationType.WRITE, path);
    }
  }

  // 3. Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed: MayumiStoreState = JSON.parse(cached);
      const existingIdx = (parsed.products || []).findIndex(p => p.id === finalId);
      if (existingIdx >= 0) {
        parsed.products[existingIdx] = finalProduct;
      } else {
        parsed.products = [finalProduct, ...(parsed.products || [])];
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }

  broadcastStoreChange();
  return finalProduct;
}

/**
 * Save website copy and banners in Firestore
 */
export async function updateSiteContent(content: Partial<SiteContent>, memberName: string): Promise<SiteContent> {
  const path = 'content/main';
  let serverSaved = false;

  try {
    const sResp = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, member: memberName })
    });
    if (sResp.ok) serverSaved = true;
  } catch {
    // ignore
  }

  try {
    await setDoc(doc(db, 'content', 'main'), {
      content,
      updatedAt: new Date().toISOString(),
      updatedBy: memberName
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore content save note:', err);
    if (!serverSaved) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  broadcastStoreChange();
  return content as SiteContent;
}

/**
 * Save store settings in Firestore
 */
export async function updateStoreSettings(settings: Partial<StoreSettings>, memberName: string): Promise<StoreSettings> {
  const path = 'settings/main';
  let serverSaved = false;

  try {
    const sResp = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, member: memberName })
    });
    if (sResp.ok) serverSaved = true;
  } catch {
    // ignore
  }

  try {
    await setDoc(doc(db, 'settings', 'main'), {
      settings,
      updatedAt: new Date().toISOString(),
      updatedBy: memberName
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore settings save note:', err);
    if (!serverSaved) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  broadcastStoreChange();
  return settings as StoreSettings;
}

/**
 * Submit customer order to Firestore
 */
export async function submitOrder(orderData: Omit<CustomerOrder, 'id' | 'createdAt' | 'status'>): Promise<CustomerOrder> {
  const newId = 'MYM-' + Math.floor(1000 + Math.random() * 9000);
  const path = `orders/${newId}`;

  const order: CustomerOrder = {
    ...orderData,
    id: newId,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'orders', newId), order);
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      }).catch(() => {});
    } catch {
      // ignore
    }
    broadcastStoreChange();
    return order;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return order;
  }
}

/**
 * Update order status in Firestore
 */
export async function updateOrderStatus(orderId: string, status: CustomerOrder['status'], memberName: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await setDoc(doc(db, 'orders', orderId), {
      status,
      managedBy: memberName,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    broadcastStoreChange();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function saveTeamMember(member: Partial<TeamMember>, actingMember: string): Promise<TeamMember[]> {
  const path = `admins/${member.id || 'admin-' + Date.now()}`;
  try {
    const memberId = member.id || 'admin-' + Date.now();
    await setDoc(doc(db, 'admins', memberId), {
      ...member,
      id: memberId,
      updatedBy: actingMember,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    broadcastStoreChange();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
  return initialStoreData.teamMembers;
}

/**
 * Client-side helper to compress huge phone camera pictures to avoid network slowdowns
 */
async function compressImageIfLarge(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.size < 1.5 * 1024 * 1024 || file.type.includes('svg')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX_DIM = 1800;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

/**
 * Upload image or video.
 * If backend server endpoint is running, uploads to /api/upload.
 * If running on static host (Netlify), safely encodes optimized data URL directly.
 */
export async function uploadMedia(file: File): Promise<{ url: string; mediaType: 'image' | 'video' }> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
  let base64Data: string;

  if (isVideo) {
    base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } else {
    base64Data = await compressImageIfLarge(file);
  }

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, filename: file.name })
    });

    if (res.ok) {
      const data = await res.json();
      return { url: data.url, mediaType: isVideo ? 'video' : 'image' };
    }
  } catch {
    // If backend /api/upload is not running (e.g. static Netlify), use compressed dataUrl directly
  }

  return { url: base64Data, mediaType: isVideo ? 'video' : 'image' };
}

export async function uploadImage(file: File): Promise<string> {
  const res = await uploadMedia(file);
  return res.url;
}
