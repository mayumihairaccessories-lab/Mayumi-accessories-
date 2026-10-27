export type ProductSize = 
  | 'Gamay (Small · 3.2 cm)' 
  | 'Dako (Big · 5.5 cm)' 
  | 'Both Sizes Available' 
  | 'Curated Pair / Set';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  size: ProductSize;
  image: string;
  images?: string[];
  video?: string;
  videoType?: 'file' | 'youtube' | 'tiktok' | 'vimeo' | 'external';
  videoTitle?: string;
  category: string;
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedBy?: string;
}

export interface ValueItem {
  icon: string;
  title: string;
  desc: string;
}

export interface CraftStep {
  num: string;
  title: string;
  desc: string;
}

export interface FeaturePillar {
  title: string;
  desc: string;
}

export interface PopUpHour {
  days: string;
  time: string;
}

export interface SiteContent {
  announcement: string;
  hero: {
    eyebrow: string;
    title: string;
    emphasis: string;
    description: string;
    noteTitle: string;
    noteSubtitle: string;
    stickerTitle: string;
    stickerSub: string;
    image?: string;
  };
  story: {
    kicker: string;
    heading: string;
    emphasis: string;
    paragraph1: string;
    paragraph2: string;
    values: ValueItem[];
  };
  craft: {
    kicker: string;
    heading: string;
    emphasis: string;
    description: string;
    badgeTitle: string;
    badgeSub: string;
    steps: CraftStep[];
    note: string;
    image?: string;
  };
  pricing: {
    title: string;
    emphasis: string;
    lead: string;
    basePrice: number;
    gamayTitle: string;
    gamaySub: string;
    gamayDesc: string;
    dakoTitle: string;
    dakoSub: string;
    dakoDesc: string;
    note: string;
    features: FeaturePillar[];
  };
  popup: {
    kicker: string;
    heading: string;
    emphasis: string;
    storeName: string;
    locationDesc: string;
    hoursNote: string;
    hours: PopUpHour[];
    nextEventTitle?: string;
    nextEventDetails?: string;
    orderSteps: string[];
  };
  quote: {
    text: string;
    emphasis: string;
    sub: string;
  };
  contact: {
    kicker: string;
    heading: string;
    emphasis: string;
    description: string;
    email: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    footnote: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  bio: string;
  isOwner: boolean;
  canEdit?: boolean;
  avatarColor?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  contactNumber: string;
  socialHandle?: string;
  email?: string;
  fulfillmentType: 'popup-pickup' | 'local-meetup' | 'courier-delivery';
  preferredDate?: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  paymentMethod: 'GCash / Maya' | 'Cash on Pickup / Meet-up' | 'Bank Transfer';
  createdAt: string;
  updatedAt?: string;
  managedBy?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  member: string;
  action: string;
  details?: string;
}

export interface StoreSettings {
  customDomain: string;
  adminPin: string;
  ownerEmail: string;
  collaboratorEmails?: string[];
  orderLink?: string;
  orderLinkLabel?: string;
  isPrivateStore: boolean;
  customerPasscode: string;
  instagramUsername: string;
  facebookPageId: string;
  gcashNumber: string;
  viberNumber: string;
}

export interface MayumiStoreState {
  products: Product[];
  content: SiteContent;
  teamMembers: TeamMember[];
  orders: CustomerOrder[];
  activityLogs: ActivityLogItem[];
  adminPin: string;
  settings?: StoreSettings;
  version?: number;
  lastUpdated?: string;
}

