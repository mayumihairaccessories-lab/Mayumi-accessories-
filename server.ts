import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialStoreData } from './src/data/defaultData.ts';
import type { MayumiStoreState, Product, CustomerOrder, SiteContent, TeamMember } from './src/types/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'mayumi-store.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize store if not present
function loadStore(): MayumiStoreState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.settings) {
        parsed.settings = initialStoreData.settings;
      }
      parsed.settings.ownerEmail = 'mayumihairaccessories@gmail.com';
      if (!parsed.settings.collaboratorEmails || parsed.settings.collaboratorEmails.length === 0) {
        parsed.settings.collaboratorEmails = initialStoreData.settings?.collaboratorEmails || ['mayumihairaccessories@gmail.com'];
      }
      if (!parsed.settings.orderLink) {
        parsed.settings.orderLink = 'https://www.facebook.com/profile.php?id=61568215620941';
        parsed.settings.orderLinkLabel = 'Order via Facebook Page';
      }
      saveStore(parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Error reading store file, fallback to initial data:', err);
  }
  saveStore(initialStoreData);
  return initialStoreData;
}

let storeVersion = 1;

function saveStore(data: MayumiStoreState) {
  try {
    storeVersion += 1;
    data.version = storeVersion;
    data.lastUpdated = new Date().toISOString();
    
    // Atomic write to prevent file corruption
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

let store: MayumiStoreState = loadStore();
storeVersion = store.version || 1;

// Allow large payloads (up to 100MB) for high-resolution photos and product video clips
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Never cache API responses: ensure any collaborator edit is immediately visible to other visitors
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve uploaded photos and videos with support for range requests
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
  }
}));

// API: Get entire store state (always returns latest data)
app.get('/api/store', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      store = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error refreshing store from disk:', err);
  }
  res.json(store);
});

// API: Check store version for low-overhead client live polling
app.get('/api/store/version', (req, res) => {
  res.json({
    version: store.version || storeVersion,
    lastUpdated: store.lastUpdated || store.activityLogs?.[0]?.timestamp || new Date().toISOString()
  });
});

// API: Add Product
app.post('/api/products', (req, res) => {
  try {
    const newProduct: Product = {
      ...req.body,
      id: req.body.id && !req.body.id.startsWith('temp-') ? req.body.id : 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
      inStock: req.body.inStock !== false,
      stockCount: Number(req.body.stockCount) || 10,
      price: Number(req.body.price) || 250,
      video: req.body.video || undefined,
      videoType: req.body.videoType || undefined,
      videoTitle: req.body.videoTitle || undefined
    };
    store.products.unshift(newProduct);
    
    // Log activity
    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: req.body.updatedBy || 'Team Member',
      action: 'Added New Product',
      details: `Added "${newProduct.name}" (₱${newProduct.price})${newProduct.video ? ' with Product Video' : ''}`
    });

    saveStore(store);
    res.status(201).json({ success: true, product: newProduct, version: store.version });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Product
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    store.products[index] = {
      ...store.products[index],
      ...req.body,
      price: Number(req.body.price) || store.products[index].price,
      stockCount: Number(req.body.stockCount) ?? store.products[index].stockCount
    };

    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: req.body.updatedBy || 'Team Member',
      action: 'Updated Product',
      details: `Edited details for "${store.products[index].name}"`
    });

    saveStore(store);
    res.json({ success: true, product: store.products[index] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete Product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const member = (req.query.member as string) || 'Team Member';
    const prod = store.products.find(p => p.id === id);
    store.products = store.products.filter(p => p.id !== id);

    if (prod) {
      store.activityLogs.unshift({
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        member,
        action: 'Removed Product',
        details: `Deleted "${prod.name}"`
      });
    }

    saveStore(store);
    res.json({ success: true, message: 'Product deleted', version: store.version, products: store.products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Site Content
app.put('/api/content', (req, res) => {
  try {
    const { content, member } = req.body;
    store.content = {
      ...store.content,
      ...content
    };

    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: member || 'Team Member',
      action: 'Updated Website Content',
      details: 'Modified text, banners, or pop-up schedule'
    });

    saveStore(store);
    res.json({ success: true, content: store.content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Store Settings (Domain, PIN, Security, Messaging)
app.put('/api/settings', (req, res) => {
  try {
    const { settings, member } = req.body;
    store.settings = {
      ...(store.settings || initialStoreData.settings!),
      ...settings
    };
    if (settings.adminPin) {
      store.adminPin = settings.adminPin;
    }

    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: member || 'Admin',
      action: 'Updated Store Security & Domain Settings',
      details: `Custom Domain: ${store.settings?.customDomain || 'custom'}, Collab PIN updated`
    });

    saveStore(store);
    res.json({ success: true, settings: store.settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Place Order
app.post('/api/orders', (req, res) => {
  try {
    const newOrder: CustomerOrder = {
      ...req.body,
      id: 'MYM-' + (Math.floor(1000 + Math.random() * 9000)),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    store.orders.unshift(newOrder);

    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: 'Customer Web Checkout',
      action: 'New Order Received',
      details: `Order #${newOrder.id} by ${newOrder.customerName} (₱${newOrder.totalAmount})`
    });

    saveStore(store);
    res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Order Status
app.put('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, managedBy, notes } = req.body;
    const order = store.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status || order.status;
    if (managedBy) order.managedBy = managedBy;
    if (notes) order.notes = notes;
    order.updatedAt = new Date().toISOString();

    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: managedBy || 'Team Member',
      action: `Order #${id} marked as ${status}`,
      details: `Customer: ${order.customerName}`
    });

    saveStore(store);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Manage Team Members
app.post('/api/members', (req, res) => {
  try {
    const { member, actingMember } = req.body;
    if (!member.id) {
      member.id = 'partner-' + Date.now();
    }
    const idx = store.teamMembers.findIndex(m => m.id === member.id);
    if (idx >= 0) {
      store.teamMembers[idx] = { ...store.teamMembers[idx], ...member };
    } else {
      store.teamMembers.push(member);
    }

    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: actingMember || 'Admin',
      action: idx >= 0 ? 'Updated Partner Role' : 'Added New Partner Member',
      details: `${member.name} (${member.role})`
    });

    saveStore(store);
    res.json({ success: true, members: store.teamMembers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Upload media (photos and videos up to 100MB)
app.post('/api/upload', (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No media data provided' });
    }

    // Extract mime type (image or video) and payload
    const matches = base64Data.match(/^data:(image|video)\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!matches || matches.length !== 4) {
      return res.status(400).json({ error: 'Invalid media format. Supported formats: images (JPG, PNG, WEBP, GIF) and videos (MP4, WEBM, MOV).' });
    }

    const mediaType = matches[1]; // 'image' | 'video'
    let ext = matches[2].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'quicktime') ext = 'mov';
    if (ext === 'x-matroska') ext = 'mkv';
    if (ext === 'svg+xml') ext = 'svg';

    const cleanBaseName = filename
      ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30)
      : (mediaType === 'video' ? 'clip-video' : 'clip-photo');

    const safeName = `${cleanBaseName}-${Date.now()}.${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(targetPath, Buffer.from(matches[3], 'base64'));
    const publicUrl = '/uploads/' + safeName;
    res.json({
      success: true,
      url: publicUrl,
      mediaType,
      filename: safeName
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to process media upload' });
  }
});

// API: Restore Backup or Reset
app.post('/api/backup/restore', (req, res) => {
  try {
    const { data, member } = req.body;
    if (!data || !data.products || !data.content) {
      return res.status(400).json({ error: 'Invalid backup structure' });
    }
    store = {
      ...data,
      adminPin: data.adminPin || '2026'
    };

    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: member || 'Admin',
      action: 'Restored Store State from Backup',
      details: `${store.products.length} products, ${store.orders.length} orders loaded`
    });

    saveStore(store);
    res.json({ success: true, store });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Reset to initial project defaults
app.post('/api/backup/reset-defaults', (req, res) => {
  try {
    const { member } = req.body;
    store = JSON.parse(JSON.stringify(initialStoreData));
    store.activityLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      member: member || 'Admin',
      action: 'Reset to Business Plan Defaults',
      details: 'All default products and Bulacan pop-up schedule reloaded'
    });
    saveStore(store);
    res.json({ success: true, store });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Production vs Development Setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAYUMI Accessories server running at http://localhost:${PORT}`);
  });
}

startServer();
