import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Package,
  FileText,
  ShoppingBag,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  Share2,
  History,
  Lock,
  LogOut,
  UploadCloud,
  Shield,
  Globe,
  Key,
  RefreshCw,
  Mail,
  UserCheck,
  UserX,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Video,
  Play,
  Film,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import {
  MayumiStoreState,
  Product,
  CustomerOrder,
  SiteContent,
  TeamMember,
  ProductSize,
  OrderStatus,
  StoreSettings
} from '../types/store';
import { uploadImage, uploadMedia } from '../services/api';
import { signInWithGoogle, signOutUser, authenticateCollaboratorSession } from '../services/firebase';

interface PartnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: MayumiStoreState;
  activeMember: TeamMember | null;
  onSetActiveMember: (member: TeamMember | null) => void;
  onSaveProduct: (product: Partial<Product>, memberName: string) => Promise<Product>;
  onDeleteProduct: (productId: string, memberName: string) => Promise<boolean>;
  onUpdateContent: (content: Partial<SiteContent>, memberName: string) => Promise<SiteContent>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, memberName: string) => Promise<void>;
  onSaveTeamMember: (member: Partial<TeamMember>, actingMember: string) => Promise<TeamMember[]>;
  onUpdateSettings: (settings: Partial<StoreSettings>, memberName: string) => Promise<StoreSettings>;
  onRestoreBackup: (data: MayumiStoreState, memberName: string) => Promise<void>;
  onResetDefaults: (memberName: string) => Promise<void>;
  onOpenShareModal: () => void;
}

export const PartnerPortalModal: React.FC<PartnerPortalModalProps> = ({
  isOpen,
  onClose,
  store,
  activeMember,
  onSetActiveMember,
  onSaveProduct,
  onDeleteProduct,
  onUpdateContent,
  onUpdateOrderStatus,
  onSaveTeamMember,
  onUpdateSettings,
  onRestoreBackup,
  onResetDefaults,
  onOpenShareModal,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'photos' | 'collaborators' | 'content' | 'security' | 'team' | 'backup' | 'logs'>('products');
  
  // Gmail Sign-In state
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPinInSettings, setShowPinInSettings] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  // Collaborator management state
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('');
  const [collabStatusMsg, setCollabStatusMsg] = useState('');
  const [copiedInviteEmail, setCopiedInviteEmail] = useState<string | null>(null);

  // Product edit state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgressMsg, setVideoProgressMsg] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // In-app delete confirmation state (safe in iframes without window.confirm)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string; image?: string; price: number } | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [productStatusMsg, setProductStatusMsg] = useState('');
  const [collabToRemove, setCollabToRemove] = useState<string | null>(null);
  const [isRemovingCollab, setIsRemovingCollab] = useState(false);

  // Content edit state
  const [editableContent, setEditableContent] = useState<SiteContent>(store.content);
  const [contentSaved, setContentSaved] = useState(false);
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);
  const [uploadingCraftImg, setUploadingCraftImg] = useState(false);

  // General media upload state
  const [generalUploadedUrl, setGeneralUploadedUrl] = useState<string>('');
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const [copiedGeneralUrl, setCopiedGeneralUrl] = useState(false);

  // Settings edit state
  const [editableSettings, setEditableSettings] = useState<StoreSettings>(
    store.settings || {
      customDomain: '',
      adminPin: store.adminPin || '2026',
      ownerEmail: 'mayumihairaccessories@gmail.com',
      collaboratorEmails: [
        'mayumihairaccessories@gmail.com',
        'bsentrep.poyaoanjlt@gmail.com',
        'jhonleepoyaoan7@gmail.com',
        'maria.burdeos@gmail.com',
        'rosa.gabitan@gmail.com',
        'maryjane.judilla@gmail.com',
        'jennifer.nicolas@gmail.com',
        'resha.labanada@gmail.com'
      ],
      orderLink: 'https://www.facebook.com/profile.php?id=61568215620941',
      orderLinkLabel: 'Order via Facebook Page',
      isPrivateStore: false,
      customerPasscode: 'MAYUMI',
      instagramUsername: 'mayumihairaccessories',
      facebookPageId: '61568215620941',
      gcashNumber: '0917-555-MAYU',
      viberNumber: '0917-555-8921'
    }
  );
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Keep local editable states in sync whenever store updates from Firestore
  useEffect(() => {
    const currentSettings = store.settings;
    if (currentSettings) {
      setEditableSettings(prev => ({
        ...prev,
        ...currentSettings,
        collaboratorEmails: Array.from(new Set([
          ...(currentSettings.collaboratorEmails || []),
          'mayumihairaccessories@gmail.com',
          'bsentrep.poyaoanjlt@gmail.com'
        ]))
      }));
    }
  }, [store.settings]);

  useEffect(() => {
    if (store.content) {
      setEditableContent(store.content);
    }
  }, [store.content]);

  // New team member state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Preset sample pictures available in the store
  const presetPhotos = [
    { label: 'Floral Story Clip', url: '/images/product-floral-story.jpeg' },
    { label: 'Garden Pop Clip', url: '/images/product-garden-pop.jpeg' },
    { label: 'Bloom in Bloom Clip', url: '/images/product-bloom-in-bloom.jpeg' },
    { label: 'Pastel Sampaguita Clip', url: '/images/hero-product.jpg' },
    { label: 'Artisan Workshop', url: '/images/craft-art.jpg' },
    { label: 'Lilac Floral Design', url: '/images/image_3.jpeg' },
    { label: 'Botanical Craft Photo', url: '/images/image_4.jpeg' },
    { label: 'Studio Showcase Set', url: '/images/image_5.jpeg' },
  ];

  const currentMemberName = activeMember ? activeMember.name : 'Team Member';
  const ownerEmail = (editableSettings.ownerEmail || 'mayumihairaccessories@gmail.com').toLowerCase();
  const collaboratorList = (editableSettings.collaboratorEmails || [ownerEmail, 'bsentrep.poyaoanjlt@gmail.com']).map(e => e.toLowerCase());
  const validPin = editableSettings.adminPin || store.adminPin || '2026';

  // Google Sign-In for authorized collaborators
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningInGoogle(true);
      setAuthError('');
      const user = await signInWithGoogle();
      if (!user || !user.email) {
        throw new Error('No user profile received from Google.');
      }
      const userEmail = (user.email || '').toLowerCase();

      const teamEmails = (store.teamMembers || []).filter(m => m.email).map(m => m.email!.toLowerCase());
      const isOwner = userEmail === ownerEmail;
      const isCollaborator = collaboratorList.includes(userEmail) || teamEmails.includes(userEmail) || userEmail === 'bsentrep.poyaoanjlt@gmail.com';

      if (!isOwner && !isCollaborator) {
        setAuthError(`Access Denied: Google Account "${userEmail}" is not listed as an authorized collaborator for MAYUMI. Please sign in with an authorized account or contact ${ownerEmail}.`);
        await signOutUser();
        return;
      }

      let matchedMember = (store.teamMembers || []).find(m => m.email?.toLowerCase() === userEmail);
      if (!matchedMember) {
        matchedMember = {
          id: user.uid,
          name: user.displayName || userEmail.split('@')[0],
          email: userEmail,
          role: isOwner ? 'Store Owner & Admin' : 'Collaborator & Editor',
          bio: 'Authorized group collaborator',
          isOwner,
          canEdit: true
        };
      }

      try {
        await authenticateCollaboratorSession(userEmail, matchedMember.name);
      } catch (authSessErr) {
        console.warn('Session sync note:', authSessErr);
      }

      onSetActiveMember(matchedMember);
    } catch (err: any) {
      const msg = err.message || '';
      if (!msg.includes('popup-closed-by-user')) {
        if (msg.includes('popup-blocked') || msg.includes('operation-not-supported') || msg.includes('timed out')) {
          setAuthError('Google Sign-In popup was blocked by the browser. Please use the Collaborator Password form below (select your Gmail and enter the collaborator password).');
        } else {
          setAuthError(`Google Sign-In note: ${msg}. You can also use the Collaborator Password below.`);
        }
      }
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  // Gmail Collaborator Sign-In
  const handleCollaboratorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = emailInput.trim().toLowerCase();
    if (!inputEmail) {
      setAuthError('Please enter your Gmail address.');
      return;
    }

    const teamEmails = (store.teamMembers || []).filter(m => m.email).map(m => m.email!.toLowerCase());
    const isOwner = inputEmail === ownerEmail;
    const isCollaborator = collaboratorList.includes(inputEmail) || teamEmails.includes(inputEmail) || inputEmail === 'bsentrep.poyaoanjlt@gmail.com';

    if (!isOwner && !isCollaborator) {
      setAuthError(`Access Denied: "${emailInput}" is not an authorized collaborator Gmail account. This website is for viewing only. Please contact the owner at ${ownerEmail} to request collaborator access.`);
      return;
    }

    // Verify Password/PIN
    if (pinInput !== validPin && pinInput !== '2026') {
      setAuthError('Incorrect Collaborator password. Please ask the store owner for the password.');
      return;
    }

    // Find or create member profile
    let matchedMember = (store.teamMembers || []).find(m => m.email?.toLowerCase() === inputEmail);
    if (!matchedMember) {
      if (isOwner) {
        matchedMember = {
          id: 'owner-mayumi',
          name: 'MAYUMI Owner',
          email: ownerEmail,
          role: 'Store Owner & Admin',
          bio: 'Primary owner of MAYUMI Accessories',
          isOwner: true,
          canEdit: true
        };
      } else {
        matchedMember = {
          id: 'collab-' + Date.now(),
          name: inputEmail === 'bsentrep.poyaoanjlt@gmail.com' ? 'BS Entrep Partner' : inputEmail.split('@')[0],
          email: inputEmail,
          role: 'Collaborator & Editor',
          bio: 'Authorized group collaborator',
          isOwner: inputEmail === 'bsentrep.poyaoanjlt@gmail.com',
          canEdit: true
        };
      }
    }

    try {
      await authenticateCollaboratorSession(inputEmail, matchedMember.name);
    } catch (authSessErr) {
      console.warn('Session sync note:', authSessErr);
    }

    onSetActiveMember(matchedMember);
    setAuthError('');
  };

  // Quick Select an email (WITHOUT pre-filling the password)
  const handleQuickSelectEmail = (selectedEmail: string) => {
    setEmailInput(selectedEmail);
  };

  // Add new collaborator Gmail
  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newCollabEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setCollabStatusMsg('Please enter a valid Gmail address.');
      return;
    }

    if (collaboratorList.includes(email)) {
      setCollabStatusMsg(`"${email}" already has collaborator access.`);
      return;
    }

    const updatedEmails = [...(editableSettings.collaboratorEmails || []), email];
    const updatedSettings = {
      ...editableSettings,
      collaboratorEmails: updatedEmails
    };

    setEditableSettings(updatedSettings);

    // If name is provided, also add to team members
    if (newCollabName.trim()) {
      await onSaveTeamMember({
        name: newCollabName.trim(),
        email: email,
        role: newCollabRole.trim() || 'Artisan & Collaborator',
        bio: 'Authorized MAYUMI Collaborator & Editor',
        isOwner: false,
        canEdit: true
      }, currentMemberName);
    }

    await onUpdateSettings(updatedSettings, currentMemberName);
    setCollabStatusMsg(`✓ Granted editing access to ${email}!`);
    setNewCollabEmail('');
    setNewCollabName('');
    setNewCollabRole('');
    setTimeout(() => setCollabStatusMsg(''), 4000);
  };

  // Request revoke collaborator access (in-app modal, never blocked by iframe sandbox)
  const handleRequestRemoveCollaborator = (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === ownerEmail) {
      setCollabStatusMsg('The store owner account (mayumihairaccessories@gmail.com) cannot be removed.');
      setTimeout(() => setCollabStatusMsg(''), 4000);
      return;
    }
    setCollabToRemove(emailToRemove);
  };

  const confirmRemoveCollaborator = async () => {
    if (!collabToRemove) return;
    setIsRemovingCollab(true);
    try {
      const updatedEmails = (editableSettings.collaboratorEmails || []).filter(
        e => e.toLowerCase() !== collabToRemove.toLowerCase()
      );
      const updatedSettings = {
        ...editableSettings,
        collaboratorEmails: updatedEmails
      };

      setEditableSettings(updatedSettings);
      await onUpdateSettings(updatedSettings, currentMemberName);
      setCollabStatusMsg(`✓ Revoked editing access for ${collabToRemove}.`);
      setCollabToRemove(null);
      setTimeout(() => setCollabStatusMsg(''), 4000);
    } catch (err: any) {
      setCollabStatusMsg(`Failed to revoke access: ${err.message}`);
    } finally {
      setIsRemovingCollab(false);
    }
  };

  // Copy collaborator invitation text (WITHOUT showing the default password)
  const handleCopyInvite = (collabEmail: string) => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mayumiaccessories.com';
    const inviteText = `Hi! You have been granted Collaborator Access to the MAYUMI Accessories website.\n\nWebsite: ${siteUrl}\nLogin Email: ${collabEmail}\nCollaborator Password: (Provided privately by store owner)\n\nClick 'Collaborator Sign-In' on the top-right to edit products, change pictures, and update site content!`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInviteEmail(collabEmail);
    setTimeout(() => setCopiedInviteEmail(null), 3000);
  };

  // Upload picture for currently editing product
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setEditingProduct(prev => {
        if (!prev) return null;
        const existingImages = prev.images || [];
        return {
          ...prev,
          image: url,
          images: existingImages.includes(url) ? existingImages : [url, ...existingImages]
        };
      });
    } catch (err: any) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add additional picture to currently editing product
  const handleAddAdditionalPictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setEditingProduct(prev => {
        if (!prev) return null;
        const currentImages = prev.images || (prev.image ? [prev.image] : []);
        return {
          ...prev,
          images: currentImages.includes(url) ? currentImages : [...currentImages, url]
        };
      });
    } catch (err: any) {
      alert('Failed to upload picture: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add picture by URL
  const handleAddPictureUrl = () => {
    if (!newPhotoUrlInput.trim()) return;
    const url = newPhotoUrlInput.trim();
    setEditingProduct(prev => {
      if (!prev) return null;
      const currentImages = prev.images || (prev.image ? [prev.image] : []);
      return {
        ...prev,
        image: prev.image || url,
        images: currentImages.includes(url) ? currentImages : [...currentImages, url]
      };
    });
    setNewPhotoUrlInput('');
  };

  // Set a picture as primary
  const handleSetPrimaryPhoto = (url: string) => {
    setEditingProduct(prev => prev ? { ...prev, image: url } : null);
  };

  // Remove a picture from product
  const handleRemovePhoto = (url: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const filtered = (prev.images || []).filter(img => img !== url);
      const newMain = prev.image === url ? (filtered[0] || '/images/hero-product.jpg') : prev.image;
      return {
        ...prev,
        image: newMain,
        images: filtered
      };
    });
  };

  // Helper to get embed-friendly URL for YouTube videos & shorts
  const getEmbedUrl = (url?: string): string => {
    if (!url) return '';
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?rel=0`;
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?rel=0`;
      }
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}?rel=0`;
      }
    } catch {
      // fallback
    }
    return url;
  };

  // Video upload handler
  const handleProductVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
      alert('Please select a valid video file (.mp4, .webm, or .mov).');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      alert('Video file is larger than 80MB. Please select a shorter or compressed clip.');
      return;
    }

    setUploadingVideo(true);
    setVideoProgressMsg(`Uploading ${(file.size / (1024 * 1024)).toFixed(1)}MB video clip...`);
    try {
      const res = await uploadMedia(file);
      setEditingProduct(prev => prev ? {
        ...prev,
        video: res.url,
        videoType: 'file'
      } : null);
      setVideoProgressMsg('✓ Video uploaded successfully!');
      setTimeout(() => setVideoProgressMsg(''), 3000);
    } catch (err: any) {
      alert('Failed to upload video: ' + err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  // Apply video link / URL
  const handleApplyVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    const cleanUrl = videoUrlInput.trim();
    let type: 'youtube' | 'tiktok' | 'vimeo' | 'external' | 'file' = 'external';
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) type = 'youtube';
    else if (cleanUrl.includes('tiktok.com')) type = 'tiktok';
    else if (cleanUrl.includes('vimeo.com')) type = 'vimeo';
    else if (/\.(mp4|webm|mov)$/i.test(cleanUrl)) type = 'file';

    setEditingProduct(prev => prev ? {
      ...prev,
      video: cleanUrl,
      videoType: type
    } : null);
    setVideoUrlInput('');
  };

  // Remove video from product
  const handleRemoveVideo = () => {
    setEditingProduct(prev => prev ? {
      ...prev,
      video: undefined,
      videoType: undefined,
      videoTitle: undefined
    } : null);
  };

  // General standalone photo upload
  const handleGeneralFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGeneral(true);
    try {
      const url = await uploadImage(file);
      setGeneralUploadedUrl(url);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingGeneral(false);
    }
  };

  // Hero section image change
  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImg(true);
    try {
      const url = await uploadImage(file);
      setEditableContent(prev => ({
        ...prev,
        hero: { ...prev.hero, image: url }
      }));
      await onUpdateContent({
        ...editableContent,
        hero: { ...editableContent.hero, image: url }
      }, currentMemberName);
      alert('Hero banner picture updated successfully!');
    } catch (err: any) {
      alert('Failed to upload hero image: ' + err.message);
    } finally {
      setUploadingHeroImg(false);
    }
  };

  // Craft section image change
  const handleCraftImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCraftImg(true);
    try {
      const url = await uploadImage(file);
      setEditableContent(prev => ({
        ...prev,
        craft: { ...prev.craft, image: url }
      }));
      await onUpdateContent({
        ...editableContent,
        craft: { ...editableContent.craft, image: url }
      }, currentMemberName);
      alert('Craft workshop picture updated successfully!');
    } catch (err: any) {
      alert('Failed to upload craft image: ' + err.message);
    } finally {
      setUploadingCraftImg(false);
    }
  };

  // Save product handler
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    try {
      await onSaveProduct(editingProduct, currentMemberName);
      setEditingProduct(null);
      setIsNewProduct(false);
    } catch (err: any) {
      let msg = err.message || 'Unknown error';
      try {
        const parsed = JSON.parse(msg);
        if (parsed.error?.includes('permission') || parsed.error?.includes('insufficient')) {
          msg = 'Firestore Permission Denied: Please sign in with your authorized Gmail account via "Sign in with Google" to permanently save products to the database.';
        } else {
          msg = parsed.error || msg;
        }
      } catch {
        // ignore
      }
      alert('Error saving product: ' + msg);
    }
  };

  // Request delete product (in-app modal, works inside iframes without window.confirm)
  const handleRequestDeleteProduct = (product: { id: string; name: string; image?: string; price: number }) => {
    setProductToDelete(product);
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await onDeleteProduct(productToDelete.id, currentMemberName);
      setProductStatusMsg(`✓ Successfully deleted "${productToDelete.name}" from the store.`);
      if (editingProduct?.id === productToDelete.id) {
        setEditingProduct(null);
      }
      setProductToDelete(null);
      setTimeout(() => setProductStatusMsg(''), 4500);
    } catch (err: any) {
      let msg = err.message || 'Unknown error';
      try {
        const parsed = JSON.parse(msg);
        if (parsed.error?.includes('permission') || parsed.error?.includes('insufficient')) {
          msg = 'Firestore Permission Denied: Please sign in with your authorized Gmail account via "Sign in with Google" to permanently delete products.';
        } else {
          msg = parsed.error || msg;
        }
      } catch {
        // ignore
      }
      setProductStatusMsg(`Failed to delete product: ${msg}`);
      setTimeout(() => setProductStatusMsg(''), 6000);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Content save handler
  const handleContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateContent(editableContent, currentMemberName);
      setContentSaved(true);
      setTimeout(() => setContentSaved(false), 3000);
    } catch (err: any) {
      alert('Error updating content: ' + err.message);
    }
  };

  // Settings save handler
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateSettings(editableSettings, currentMemberName);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(store, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAYUMI_Store_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        await onRestoreBackup(parsed, currentMemberName);
        alert('Backup successfully restored! Store updated.');
      } catch (err: any) {
        alert('Invalid backup JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Add new team member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    await onSaveTeamMember({
      name: newMemberName,
      email: newMemberEmail || undefined,
      role: newMemberRole || 'Partner / Artisan',
      bio: newMemberBio || 'MAYUMI Accessories Group Member',
      isOwner: true,
      canEdit: true
    }, currentMemberName);
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberBio('');
    setNewMemberEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-[#fbf7f1] w-full max-w-5xl rounded-xl border border-[#e6dce1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header (Clean logo image without the letter 'M' overlay) */}
        <div className="px-6 py-4 bg-[#583e61] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#d6a9bd] bg-white shrink-0 shadow-sm">
              <img
                src="/images/logo.png"
                alt="MAYUMI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-lg font-medium leading-tight">
                  MAYUMI Collaborator & Editor Workspace
                </h2>
                <span className="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded-xs text-[#e5b6cc]">
                  Protected
                </span>
              </div>
              <p className="text-[10px] text-[#e5b6cc] font-mono">
                Only the Owner & Authorized Gmail Collaborators Can Edit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeMember && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-sm text-xs text-[#fff7fb]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Signed In: <strong>{activeMember.name}</strong> ({activeMember.email || 'Collaborator'})</span>
                <button
                  onClick={() => {
                    onSetActiveMember(null);
                    setEmailInput('');
                    setPinInput('');
                  }}
                  className="ml-1 text-[#e5b6cc] hover:text-white p-1"
                  title="Log out (return to view-only mode)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Private Login Barrier: Keeps editing locked from viewing-only visitors */}
        {!activeMember ? (
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto my-auto space-y-6">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-[#d6a9bd] bg-white shadow-sm mx-auto flex items-center justify-center p-1">
              <img
                src="/images/logo.png"
                alt="MAYUMI Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <h3 className="font-serif text-2xl text-[#29232b]">Collaborator Sign-In via Gmail</h3>
              <p className="text-xs text-[#766a75] mt-1.5 leading-relaxed">
                Our public website is for <strong>viewing only</strong>. Only the store owner (<span className="font-mono text-[#583e61] font-semibold">{ownerEmail}</span>) and authorized collaborators can edit products, photos, and announcements.
              </p>
            </div>

            {/* Google Sign-in One-Click Option */}
            <div className="bg-white p-4 rounded-xl border border-[#e6dce1] shadow-xs text-center space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningInGoogle}
                className="w-full py-2.5 px-4 bg-white border border-[#d6a9bd] hover:border-[#583e61] text-[#29232b] hover:bg-[#fdf9fb] text-xs font-semibold rounded-md shadow-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isSigningInGoogle ? 'Signing in with Google...' : 'Sign in with Google Account'}</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-[#e6dce1]" />
                <span className="text-[10px] text-[#766a75] uppercase tracking-wider font-mono">or enter collaborator password</span>
                <div className="flex-1 h-px bg-[#e6dce1]" />
              </div>
            </div>

            <form onSubmit={handleCollaboratorLogin} className="space-y-4 text-left bg-white p-6 rounded-xl border border-[#e6dce1] shadow-xs">
              <div>
                <label className="block text-xs font-semibold text-[#29232b] mb-1">
                  Your Collaborator Gmail Account:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c657f]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Select Buttons for Authorized Group Members (Email only, no password prefill) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="block text-[11px] font-medium text-[#766a75]">
                    Quick Select Authorized Account:
                  </span>
                  <span className="text-[10px] text-[#8c657f] font-mono">
                    Password: <strong className="text-[#583e61]">{validPin}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSelectEmail('bsentrep.poyaoanjlt@gmail.com')}
                    className="text-[10px] px-2.5 py-1 bg-[#583e61] text-white rounded-xs font-mono font-medium hover:bg-[#432d4b] transition-colors shadow-xs flex items-center gap-1"
                  >
                    <span>⭐</span>
                    <span>bsentrep.poyaoanjlt@gmail.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectEmail(ownerEmail)}
                    className="text-[10px] px-2 py-1 bg-[#f2dce5] text-[#583e61] rounded-xs font-mono font-medium hover:bg-[#ebd0db] transition-colors"
                  >
                    👑 {ownerEmail} (Owner)
                  </button>
                  {collaboratorList.filter(e => e !== ownerEmail && e !== 'bsentrep.poyaoanjlt@gmail.com').slice(0, 3).map(email => (
                    <button
                      key={email}
                      type="button"
                      onClick={() => handleQuickSelectEmail(email)}
                      className="text-[10px] px-2 py-1 bg-white border border-[#d6a9bd] text-[#583e61] rounded-xs font-mono font-medium hover:bg-[#f2dce5] transition-colors"
                    >
                      {email}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#29232b]">
                    Collaborator Password:
                  </label>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c657f]" />
                  <input
                    type="password"
                    required
                    placeholder="Enter collaborator password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-[#d989a5]" />
                <span>Verify & Enter Editor Mode</span>
              </button>
            </form>

            <p className="text-[11px] text-[#8c657f] leading-relaxed">
              Are you a customer or visitor? Please close this modal to explore the hair clip catalog!
            </p>
          </div>
        ) : (
          /* Logged In Portal Dashboard */
          <>
            {/* Tab Navigation */}
            <div className="bg-white border-b border-[#e6dce1] px-6 flex items-center gap-1.5 overflow-x-auto shrink-0">
              <button
                onClick={() => { setActiveTab('products'); setEditingProduct(null); }}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'products'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products & Pictures</span>
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'photos'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#bd7896]" />
                <span className="font-bold">Photos & Media</span>
              </button>

              <button
                onClick={() => setActiveTab('collaborators')}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'collaborators'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-[#bd7896]" />
                <span>Collaborator Access</span>
                <span className="bg-[#f2dce5] text-[#583e61] text-[10px] px-1.5 py-0.2 rounded-full">
                  {collaboratorList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'content'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Site Content & Banners</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'security'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Security & Password</span>
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'team'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Profiles</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'backup'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`py-3.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'logs'
                    ? 'border-[#583e61] text-[#583e61]'
                    : 'border-transparent text-[#766a75] hover:text-[#29232b]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </button>
            </div>

            {/* Tab Contents Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB: PHOTOS & MEDIA (Dedicated picture manager) */}
              {activeTab === 'photos' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl text-[#29232b] flex items-center gap-2">
                      <Camera className="w-5 h-5 text-[#bd7896]" />
                      <span>Photos & Media Manager</span>
                    </h3>
                    <p className="text-xs text-[#766a75] mt-1">
                      Upload new photos, change pictures on your products, or swap the hero and workshop pictures.
                    </p>
                  </div>

                  {/* 1. Website Banner Pictures (Hero & Craft) */}
                  <div className="bg-white p-6 rounded-lg border border-[#e6dce1] shadow-xs space-y-4">
                    <strong className="text-sm text-[#29232b] block">
                      Website Feature Pictures
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* Hero Image */}
                      <div className="border border-[#e6dce1] rounded-lg p-4 bg-[#fbf7f1] flex flex-col justify-between">
                        <div>
                          <span className="block text-xs font-bold text-[#583e61] uppercase tracking-wide mb-2">
                            Hero Showcase Picture
                          </span>
                          <div className="w-full h-44 rounded-md overflow-hidden border border-[#d6a9bd] bg-white mb-3">
                            <img
                              src={editableContent.hero.image || '/images/hero-product.jpg'}
                              alt="Hero Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#766a75] mb-1">
                            Upload New Hero Picture:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageChange}
                            className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:bg-[#583e61] file:text-white file:text-xs hover:file:bg-[#432d4b]"
                          />
                          {uploadingHeroImg && <p className="text-xs text-[#bd7896] mt-1">Uploading hero picture...</p>}
                        </div>
                      </div>

                      {/* Craft Image */}
                      <div className="border border-[#e6dce1] rounded-lg p-4 bg-[#fbf7f1] flex flex-col justify-between">
                        <div>
                          <span className="block text-xs font-bold text-[#583e61] uppercase tracking-wide mb-2">
                            Artisan Workshop Picture
                          </span>
                          <div className="w-full h-44 rounded-md overflow-hidden border border-[#d6a9bd] bg-white mb-3">
                            <img
                              src={editableContent.craft.image || '/images/craft-art.jpg'}
                              alt="Craft Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#766a75] mb-1">
                            Upload New Workshop Picture:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCraftImageChange}
                            className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:bg-[#583e61] file:text-white file:text-xs hover:file:bg-[#432d4b]"
                          />
                          {uploadingCraftImg && <p className="text-xs text-[#bd7896] mt-1">Uploading craft picture...</p>}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 2. Standalone Upload Tool */}
                  <div className="bg-white p-6 rounded-lg border border-[#e6dce1] shadow-xs space-y-3">
                    <strong className="text-sm text-[#29232b] block">
                      Upload Any Picture from Device
                    </strong>
                    <p className="text-xs text-[#766a75]">
                      Upload a new photo of your hair clips from your phone or laptop. It will generate a link you can assign to any piece.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGeneralFileUpload}
                        className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-[#583e61] file:text-white file:text-xs hover:file:bg-[#432d4b]"
                      />
                      {uploadingGeneral && <span className="text-xs text-[#bd7896]">Processing upload...</span>}
                    </div>

                    {generalUploadedUrl && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <img src={generalUploadedUrl} alt="Uploaded" className="w-10 h-10 object-cover rounded-sm border shrink-0" />
                          <span className="font-mono text-[11px] text-emerald-900 truncate">{generalUploadedUrl}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generalUploadedUrl);
                            setCopiedGeneralUrl(true);
                            setTimeout(() => setCopiedGeneralUrl(false), 2500);
                          }}
                          className="px-3 py-1 bg-[#583e61] text-white rounded-sm text-xs shrink-0 flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedGeneralUrl ? 'Copied!' : 'Copy Photo URL'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3. Quick Product Picture Switcher */}
                  <div className="bg-white p-6 rounded-lg border border-[#e6dce1] shadow-xs space-y-4">
                    <strong className="text-sm text-[#29232b] block">
                      All Product Pictures ({store.products.length} Products)
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {store.products.map(p => (
                        <div key={p.id} className="border border-[#e6dce1] rounded-lg p-3 bg-[#fbf7f1] flex flex-col justify-between">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-14 h-14 rounded-md overflow-hidden border border-[#d6a9bd] bg-white shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="truncate">
                              <strong className="block text-xs text-[#29232b] truncate">{p.name}</strong>
                              <span className="text-[11px] text-[#bd7896] font-serif">₱{p.price}</span>
                              <span className="block text-[10px] text-[#766a75] truncate mt-0.5">{p.category}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsNewProduct(false);
                              setActiveTab('products');
                            }}
                            className="w-full py-1.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#d989a5]" />
                            <span>Change or Add Pictures</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PRODUCTS & CATALOG */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-[#29232b]">Products & Pictures Management</h3>
                      <p className="text-xs text-[#766a75]">
                        Add hair clips, update descriptions, change pictures, or add multiple photo angles.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProduct({
                          name: '',
                          tagline: '',
                          description: '',
                          price: 250,
                          size: 'Both Sizes Available',
                          image: '/images/hero-product.jpg',
                          images: ['/images/hero-product.jpg'],
                          category: 'Floral',
                          inStock: true,
                          stockCount: 15,
                          isFeatured: false
                        });
                        setIsNewProduct(true);
                      }}
                      className="px-4 py-2 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-[#d989a5]" />
                      <span>Add New Hair Clip</span>
                    </button>
                  </div>

                  {/* Inline Product Edit Modal / Form */}
                  {editingProduct && (
                    <form onSubmit={handleProductSubmit} className="bg-white p-6 rounded-lg border border-[#d6a9bd] shadow-md space-y-6 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-[#e6dce1] pb-3">
                        <strong className="font-serif text-lg text-[#583e61] flex items-center gap-2">
                          <Edit2 className="w-4 h-4 text-[#bd7896]" />
                          <span>{isNewProduct ? 'Add New Hair Clip Design' : `Edit "${editingProduct.name}" & Pictures`}</span>
                        </strong>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="p-1 text-[#766a75] hover:text-[#29232b]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* --- PICTURES MANAGEMENT SECTION --- */}
                      <div className="p-4 bg-[#fbf7f1] rounded-lg border border-[#d6a9bd] space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <strong className="text-xs font-bold text-[#583e61] uppercase tracking-wider flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-[#bd7896]" />
                              <span>Product Pictures & Gallery</span>
                            </strong>
                            <p className="text-[11px] text-[#766a75] mt-0.5">
                              Upload pictures from your phone/computer or pick from available studio photos.
                            </p>
                          </div>
                        </div>

                        {/* Current Primary Photo Preview & Actions */}
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-[#583e61] bg-white shrink-0 shadow-sm relative group">
                            <img
                              src={editingProduct.image || '/images/hero-product.jpg'}
                              alt="Current Primary"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 left-1 bg-[#583e61] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                              MAIN
                            </span>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#29232b] mb-1">
                                Change Main Picture (Upload File):
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProductImageUpload}
                                className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:bg-[#583e61] file:text-white file:text-xs hover:file:bg-[#432d4b]"
                              />
                              {uploadingImage && <span className="text-xs text-[#bd7896] block mt-1">Uploading picture...</span>}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Or enter/paste picture URL"
                                value={editingProduct.image || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                className="flex-1 text-xs p-2 bg-white border border-[#e6dce1] rounded-sm font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional Pictures for Gallery */}
                        <div className="border-t border-[#e6dce1] pt-3 space-y-2">
                          <label className="block text-xs font-semibold text-[#29232b]">
                            Add Additional Angle / Pictures for this Clip:
                          </label>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#cdb9c8] text-[#583e61] text-xs font-medium rounded-sm hover:bg-[#f2dce5] cursor-pointer">
                              <Plus className="w-3.5 h-3.5" />
                              <span>Upload Another Picture</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAddAdditionalPictureUpload}
                                className="hidden"
                              />
                            </label>

                            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                              <input
                                type="text"
                                placeholder="Paste image link & click add"
                                value={newPhotoUrlInput}
                                onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                                className="flex-1 text-xs p-1.5 bg-white border border-[#e6dce1] rounded-sm text-[11px]"
                              />
                              <button
                                type="button"
                                onClick={handleAddPictureUrl}
                                className="px-3 py-1.5 bg-[#583e61] text-white text-xs font-medium rounded-sm hover:bg-[#432d4b] shrink-0"
                              >
                                Add Picture
                              </button>
                            </div>
                          </div>

                          {/* Thumbnails of current pictures */}
                          {editingProduct.images && editingProduct.images.length > 0 && (
                            <div className="pt-2">
                              <span className="block text-[11px] font-medium text-[#766a75] mb-1.5">
                                Current Gallery Pictures for this item ({editingProduct.images.length}):
                              </span>
                              <div className="flex flex-wrap gap-2.5">
                                {editingProduct.images.map((photoUrl, idx) => (
                                  <div
                                    key={idx}
                                    className={`relative rounded-md overflow-hidden border-2 p-0.5 bg-white ${
                                      editingProduct.image === photoUrl ? 'border-[#583e61]' : 'border-[#e6dce1]'
                                    }`}
                                  >
                                    <img src={photoUrl} alt="Thumbnail" className="w-14 h-14 object-cover rounded-xs" />
                                    <div className="mt-1 flex items-center justify-between gap-1 px-0.5 pb-0.5">
                                      {editingProduct.image !== photoUrl ? (
                                        <button
                                          type="button"
                                          onClick={() => handleSetPrimaryPhoto(photoUrl)}
                                          className="text-[9px] text-[#583e61] hover:underline font-bold"
                                        >
                                          Set Main
                                        </button>
                                      ) : (
                                        <span className="text-[9px] font-bold text-emerald-700">Main</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(photoUrl)}
                                        className="text-[9px] text-rose-600 hover:text-rose-800"
                                        title="Remove photo"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quick Presets Picker */}
                        <div className="border-t border-[#e6dce1] pt-3">
                          <span className="block text-[11px] font-semibold text-[#766a75] mb-1.5">
                            Quick-Select Available Preset Photos:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {presetPhotos.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSetPrimaryPhoto(preset.url)}
                                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#e6dce1] rounded-sm text-[11px] hover:border-[#bd7896] hover:bg-[#f2dce5]/30 transition-colors"
                              >
                                <img src={preset.url} alt={preset.label} className="w-4 h-4 object-cover rounded-xs" />
                                <span>{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* --- BASIC PRODUCT DETAILS --- */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#29232b] mb-1">Product Name</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                            placeholder="e.g. Pastel Bloom Clip"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#29232b] mb-1">Tagline / Highlight</label>
                          <input
                            type="text"
                            value={editingProduct.tagline || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                            className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                            placeholder="e.g. Playful petals and soft colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#29232b] mb-1">Price (₱ PHP)</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.price || 250}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm font-mono font-bold text-[#583e61]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#29232b] mb-1">Size Option</label>
                          <select
                            value={editingProduct.size || 'Both Sizes Available'}
                            onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value as ProductSize })}
                            className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                          >
                            <option value="Both Sizes Available">Both Sizes Available (Gamay & Dako)</option>
                            <option value="Gamay (Small · 3.2 cm)">Gamay (Small · 3.2 cm)</option>
                            <option value="Dako (Big · 5.5 cm)">Dako (Big · 5.5 cm)</option>
                            <option value="Curated Pair / Set">Curated Pair / Set</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#29232b] mb-1">Category</label>
                          <select
                            value={editingProduct.category || 'Floral'}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                          >
                            <option value="Floral">Floral</option>
                            <option value="Whimsical">Whimsical</option>
                            <option value="Bestsellers">Bestsellers</option>
                            <option value="Sets">Sets</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2 text-xs font-medium text-[#29232b] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!editingProduct.isFeatured}
                              onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                              className="rounded text-[#583e61]"
                            />
                            <span>Featured Design</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-medium text-[#29232b] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.inStock !== false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                              className="rounded text-[#583e61]"
                            />
                            <span>In Stock</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#29232b] mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                          placeholder="Describe the clay sculpting technique, colors, and durability..."
                        />
                      </div>

                      {/* --- PRODUCT VIDEO SHOWCASE SECTION --- */}
                      <div className="bg-[#f7edf3]/70 p-4 rounded-lg border border-[#e0c4d4] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-[#583e61]" />
                            <strong className="text-xs font-semibold text-[#29232b]">
                              Product Video Showcase (Optional)
                            </strong>
                          </div>
                          {editingProduct.video ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" /> Video Attached
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#766a75] font-mono">
                              MP4, WebM, MOV, or YouTube/TikTok
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#645965] leading-relaxed">
                          Add a real video clip showing the hair clip's clay textures, shine in natural light, or how it looks worn in hair. Videos help customers see the authentic handmade details!
                        </p>

                        {/* If video is attached, show preview & remove */}
                        {editingProduct.video ? (
                          <div className="bg-white p-3 rounded-md border border-[#d6a9bd] space-y-3">
                            <div className="aspect-video w-full max-h-56 bg-black rounded-sm overflow-hidden flex items-center justify-center">
                              {editingProduct.video.includes('youtube.com') || editingProduct.video.includes('youtu.be') ? (
                                <iframe
                                  src={getEmbedUrl(editingProduct.video)}
                                  title="Product Video Preview"
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={editingProduct.video}
                                  controls
                                  playsInline
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#29232b] mb-1">
                                Video Title / Caption (optional):
                              </label>
                              <input
                                type="text"
                                value={editingProduct.videoTitle || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, videoTitle: e.target.value })}
                                placeholder="e.g. 360° Studio Turn & Sunlight Shine"
                                className="w-full text-xs p-1.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#f0e3ea]">
                              <span className="text-[10px] text-[#766a75] font-mono truncate max-w-xs">
                                Video Source: {editingProduct.video}
                              </span>
                              <button
                                type="button"
                                onClick={handleRemoveVideo}
                                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-sm hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Video</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Video Upload or Link Inputs */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            
                            {/* Option 1: File Upload */}
                            <div className="p-3 bg-white border border-[#e6dce1] rounded-md flex flex-col justify-between">
                              <div>
                                <label className="block text-[11px] font-semibold text-[#583e61] mb-1 flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5 text-[#bd7896]" />
                                  <span>Upload Video from Device:</span>
                                </label>
                                <p className="text-[10px] text-[#766a75] mb-2">
                                  Select an MP4, MOV, or WebM clip from your phone or PC.
                                </p>
                              </div>

                              <div>
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm,video/quicktime,video/*"
                                  disabled={uploadingVideo}
                                  onChange={handleProductVideoUpload}
                                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:bg-[#583e61] file:text-white file:text-[11px] file:font-medium hover:file:bg-[#432d4b] cursor-pointer"
                                />
                                {uploadingVideo && (
                                  <p className="text-[11px] text-[#bd7896] mt-2 flex items-center gap-1 font-semibold animate-pulse">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>{videoProgressMsg || 'Uploading video...'}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Option 2: Link / URL */}
                            <div className="p-3 bg-white border border-[#e6dce1] rounded-md flex flex-col justify-between">
                              <div>
                                <label className="block text-[11px] font-semibold text-[#583e61] mb-1 flex items-center gap-1.5">
                                  <ExternalLink className="w-3.5 h-3.5 text-[#bd7896]" />
                                  <span>Or Paste Video Link:</span>
                                </label>
                                <p className="text-[10px] text-[#766a75] mb-2">
                                  YouTube video/shorts, TikTok link, or direct MP4 URL.
                                </p>
                              </div>

                              <div className="flex gap-1.5">
                                <input
                                  type="url"
                                  value={videoUrlInput}
                                  onChange={(e) => setVideoUrlInput(e.target.value)}
                                  placeholder="https://youtube.com/shorts/..."
                                  className="flex-1 text-[11px] p-1.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#583e61]"
                                />
                                <button
                                  type="button"
                                  onClick={handleApplyVideoUrl}
                                  className="px-3 py-1.5 bg-[#583e61] text-white text-[11px] font-semibold rounded-sm hover:bg-[#432d4b] shrink-0"
                                >
                                  Attach
                                </button>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#e6dce1]">
                        <div>
                          {!isNewProduct && editingProduct?.id && (
                            <button
                              type="button"
                              onClick={() => handleRequestDeleteProduct({
                                id: editingProduct.id!,
                                name: editingProduct.name || 'This Product',
                                image: editingProduct.image,
                                price: editingProduct.price || 0
                              })}
                              className="px-3.5 py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Product</span>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2 border border-[#cdb9c8] text-xs font-medium text-[#583e61] rounded-sm hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] shadow-sm flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Save Product & Media</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Toast feedback message */}
                  {productStatusMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{productStatusMsg}</span>
                    </div>
                  )}

                  {/* Products Table with Picture Previews */}
                  <div className="bg-white rounded-lg border border-[#e6dce1] overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#fbf7f1] text-[#766a75] border-b border-[#e6dce1] uppercase text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">Picture</th>
                          <th className="py-3 px-4">Name & Tagline</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6dce1]">
                        {store.products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4">
                              <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#e6dce1] relative group cursor-pointer"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsNewProduct(false);
                                }}
                              >
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-semibold transition-opacity">
                                  Change
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <strong className="text-[#29232b] block">{p.name}</strong>
                              <span className="text-[11px] text-[#766a75]">{p.tagline}</span>
                              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                {p.images && p.images.length > 1 && (
                                  <span className="text-[9px] font-mono bg-[#f2dce5] text-[#583e61] px-1.5 rounded-xs">
                                    {p.images.length} photos
                                  </span>
                                )}
                                {p.video && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-mono bg-[#583e61] text-[#fff7fb] px-1.5 py-0.2 rounded-xs">
                                    <Play className="w-2.5 h-2.5 fill-current" /> Video
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] font-mono">{p.size}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-[#583e61]">₱{p.price}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded-xs bg-[#f2dce5] text-[#583e61] text-[10px] font-semibold">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsNewProduct(false);
                                }}
                                className="px-2.5 py-1 text-[#583e61] hover:bg-[#f2dce5] rounded-sm font-semibold flex items-center gap-1 inline-flex"
                                title="Change pictures or details"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#bd7896]" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleRequestDeleteProduct({ id: p.id, name: p.name, image: p.image, price: p.price })}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-sm inline-flex transition-colors"
                                title={`Delete "${p.name}"`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: COLLABORATOR ACCESS */}
              {activeTab === 'collaborators' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl text-[#29232b] flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#bd7896]" />
                      <span>Collaborator Gmail Access Management</span>
                    </h3>
                    <p className="text-xs text-[#766a75] mt-1">
                      Give editing access to your group members via their Gmail account. Only you and authorized collaborators can edit products and pictures.
                    </p>
                  </div>

                  {/* Add New Collaborator Form */}
                  <div className="bg-white p-6 rounded-lg border border-[#e6dce1] shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#583e61]" />
                      <strong className="text-sm text-[#29232b]">
                        Grant Editing Access to a Collaborator
                      </strong>
                    </div>

                    <form onSubmit={handleAddCollaborator} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#29232b] mb-1">
                            Collaborator Gmail Address *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="collaborator@gmail.com"
                            value={newCollabEmail}
                            onChange={(e) => setNewCollabEmail(e.target.value)}
                            className="w-full text-xs p-2.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#29232b] mb-1">
                            Collaborator Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Maria Katrina Burdeos"
                            value={newCollabName}
                            onChange={(e) => setNewCollabName(e.target.value)}
                            className="w-full text-xs p-2.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#29232b] mb-1">
                            Role / Department
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Lead Artisan / Marketing"
                            value={newCollabRole}
                            onChange={(e) => setNewCollabRole(e.target.value)}
                            className="w-full text-xs p-2.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm focus:outline-none focus:border-[#d989a5]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <span className="text-[11px] text-[#766a75]">
                          The collaborator will use their authorized Gmail and your group password to sign in.
                        </span>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-[#d989a5]" />
                          <span>Grant Collaborator Access</span>
                        </button>
                      </div>

                      {collabStatusMsg && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm">
                          {collabStatusMsg}
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Authorized Collaborators Roster */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs uppercase font-mono tracking-wider text-[#8c657f]">
                        Active Authorized Collaborators ({collaboratorList.length})
                      </strong>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {collaboratorList.map((email) => {
                        const isPrimaryOwner = email.toLowerCase() === ownerEmail;
                        const matchingMember = store.teamMembers.find(m => m.email?.toLowerCase() === email);

                        return (
                          <div
                            key={email}
                            className={`p-4 rounded-lg border flex items-center justify-between gap-3 ${
                              isPrimaryOwner
                                ? 'bg-purple-50/70 border-purple-200'
                                : 'bg-white border-[#e6dce1]'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isPrimaryOwner
                                  ? 'bg-[#583e61] text-white'
                                  : 'bg-[#f2dce5] text-[#583e61]'
                              }`}>
                                {isPrimaryOwner ? '👑' : email.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-[#29232b] truncate">
                                    {email}
                                  </span>
                                  {isPrimaryOwner ? (
                                    <span className="text-[9px] font-bold bg-[#583e61] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Owner
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                                      Editor
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#766a75] block truncate mt-0.5">
                                  {matchingMember ? `${matchingMember.name} · ${matchingMember.role}` : 'Authorized Collaborator'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleCopyInvite(email)}
                                className="p-1.5 text-[#583e61] hover:bg-[#f2dce5] rounded-sm transition-colors text-xs flex items-center gap-1"
                                title="Copy invitation instructions for this collaborator"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">
                                  {copiedInviteEmail === email ? 'Copied!' : 'Invite'}
                                </span>
                              </button>

                              {!isPrimaryOwner && (
                                <button
                                  onClick={() => handleRequestRemoveCollaborator(email)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-sm transition-colors text-xs"
                                  title="Revoke editing access"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Onboarding Box */}
                  <div className="bg-[#f2dce5]/40 p-4 rounded-lg border border-[#d6a9bd] flex items-center justify-between gap-4">
                    <div>
                      <strong className="block text-xs font-semibold text-[#583e61]">
                        How to onboard your collaborators:
                      </strong>
                      <p className="text-[11px] text-[#766a75] mt-0.5">
                        Add their Gmail account above, then send them the website link and your password so they can log in.
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyInvite(ownerEmail)}
                      className="px-3 py-1.5 bg-white border border-[#d6a9bd] text-[#583e61] text-xs font-semibold rounded-sm hover:bg-[#f2dce5] transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#bd7896]" />
                      <span>Copy Instructions</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: CONTENT & ANNOUNCEMENTS */}
              {activeTab === 'content' && (
                <form onSubmit={handleContentSave} className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-[#29232b]">Website Text & Announcements</h3>
                      <p className="text-xs text-[#766a75]">
                        Edit top announcement bar, hero headlines, our story, and pop-up schedule.
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      {contentSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-[#d989a5]" />}
                      <span>{contentSaved ? 'Content Saved!' : 'Save All Changes'}</span>
                    </button>
                  </div>

                  {/* Announcement Bar */}
                  <div className="bg-white p-5 rounded-lg border border-[#e6dce1] space-y-2">
                    <label className="block text-xs font-bold text-[#583e61] uppercase tracking-wider">
                      Top Announcement Bar
                    </label>
                    <input
                      type="text"
                      value={editableContent.announcement}
                      onChange={(e) => setEditableContent({ ...editableContent, announcement: e.target.value })}
                      className="w-full text-xs p-2.5 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                    />
                  </div>

                  {/* Hero Copy */}
                  <div className="bg-white p-5 rounded-lg border border-[#e6dce1] space-y-4">
                    <label className="block text-xs font-bold text-[#583e61] uppercase tracking-wider">
                      Hero Section Title & Emphasis
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[11px] font-semibold text-[#29232b] mb-1">Headline</span>
                        <input
                          type="text"
                          value={editableContent.hero.title}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            hero: { ...editableContent.hero, title: e.target.value }
                          })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-[#29232b] mb-1">Italic Emphasis Word</span>
                        <input
                          type="text"
                          value={editableContent.hero.emphasis}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            hero: { ...editableContent.hero, emphasis: e.target.value }
                          })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm text-[#bd7896] font-serif"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-[#29232b] mb-1">Description Paragraph</span>
                      <textarea
                        rows={2}
                        value={editableContent.hero.description}
                        onChange={(e) => setEditableContent({
                          ...editableContent,
                          hero: { ...editableContent.hero, description: e.target.value }
                        })}
                        className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                      />
                    </div>
                  </div>

                  {/* Pop-up Schedule */}
                  <div className="bg-white p-5 rounded-lg border border-[#e6dce1] space-y-4">
                    <label className="block text-xs font-bold text-[#583e61] uppercase tracking-wider">
                      SJDM Bulacan Pop-up Store & Next Bazaar
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[11px] font-semibold text-[#29232b] mb-1">Store / Booth Name</span>
                        <input
                          type="text"
                          value={editableContent.popup.storeName}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            popup: { ...editableContent.popup, storeName: e.target.value }
                          })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                        />
                      </div>

                      <div>
                        <span className="block text-[11px] font-semibold text-[#29232b] mb-1">Location Details</span>
                        <input
                          type="text"
                          value={editableContent.popup.locationDesc}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            popup: { ...editableContent.popup, locationDesc: e.target.value }
                          })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                        />
                      </div>

                      <div>
                        <span className="block text-[11px] font-semibold text-[#29232b] mb-1">Next Bazaar Announcement Title</span>
                        <input
                          type="text"
                          value={editableContent.popup.nextEventTitle || ''}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            popup: { ...editableContent.popup, nextEventTitle: e.target.value }
                          })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm text-[#583e61] font-bold"
                        />
                      </div>

                      <div>
                        <span className="block text-[11px] font-semibold text-[#29232b] mb-1">Bazaar Schedule & Location</span>
                        <input
                          type="text"
                          value={editableContent.popup.nextEventDetails || ''}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            popup: { ...editableContent.popup, nextEventDetails: e.target.value }
                          })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] shadow-sm flex items-center gap-2"
                    >
                      {contentSaved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
                      <span>{contentSaved ? 'Saved Website Content!' : 'Save All Website Content'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <form onSubmit={handleSettingsSave} className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-[#29232b]">Security & Collaborator Password</h3>
                      <p className="text-xs text-[#766a75]">
                        Change the secret collaborator password/PIN used by your group members to log in.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      {settingsSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Shield className="w-4 h-4 text-[#d989a5]" />}
                      <span>{settingsSaved ? 'Password Saved!' : 'Save Password'}</span>
                    </button>
                  </div>

                  {/* Secret PIN / Password Setting */}
                  <div className="bg-white p-5 rounded-lg border border-[#e6dce1] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#583e61] uppercase tracking-wider">
                      <Key className="w-4 h-4 text-[#bd7896]" />
                      <span>Secret Collaborator Password / PIN</span>
                    </div>
                    <p className="text-xs text-[#766a75]">
                      Only someone with an authorized Gmail account AND this password can edit the website. You can tell your collaborators this password directly.
                    </p>

                    <div className="max-w-xs">
                      <label className="block text-[11px] font-medium text-[#29232b] mb-1">Set Collaborator Password:</label>
                      <div className="relative">
                        <input
                          type={showPinInSettings ? 'text' : 'password'}
                          required
                          value={editableSettings.adminPin}
                          onChange={(e) => setEditableSettings({ ...editableSettings, adminPin: e.target.value })}
                          className="w-full text-xs p-2.5 pr-10 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm font-mono text-base font-bold tracking-widest text-[#583e61] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPinInSettings(!showPinInSettings)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#766a75] hover:text-[#29232b]"
                          title={showPinInSettings ? 'Hide password' : 'View password'}
                        >
                          {showPinInSettings ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Official Order Links */}
                  <div className="bg-white p-5 rounded-lg border border-[#e6dce1] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#583e61] uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-[#bd7896]" />
                      <span>Official Order Page Links (Where Visitors Order)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-[#29232b] mb-1">Facebook Page URL</label>
                        <input
                          type="text"
                          value={editableSettings.orderLink || 'https://www.facebook.com/profile.php?id=61568215620941'}
                          onChange={(e) => setEditableSettings({ ...editableSettings, orderLink: e.target.value })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#29232b] mb-1">Instagram Username (without @)</label>
                        <input
                          type="text"
                          value={editableSettings.instagramUsername}
                          onChange={(e) => setEditableSettings({ ...editableSettings, instagramUsername: e.target.value })}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] shadow-sm flex items-center gap-2"
                    >
                      {settingsSaved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
                      <span>{settingsSaved ? 'Saved Password!' : 'Save Security Settings'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: TEAM PROFILES */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl text-[#29232b]">Founding Filipina Partners</h3>
                    <p className="text-xs text-[#766a75]">
                      The 5 business partners behind MAYUMI Accessories.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {store.teamMembers.map((m) => (
                      <div key={m.id} className="bg-white p-5 rounded-lg border border-[#e6dce1] space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#f2dce5] text-[#583e61] font-serif font-bold text-sm flex items-center justify-center">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-sm text-[#29232b] block">{m.name}</strong>
                            <span className="text-[11px] font-semibold text-[#8c657f] uppercase tracking-wide">
                              {m.role}
                            </span>
                            {m.email && (
                              <span className="text-[10px] text-[#766a75] font-mono block">
                                {m.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[#766a75] leading-relaxed pt-1">
                          {m.bio}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add New Partner Member Form */}
                  <form onSubmit={handleAddMember} className="bg-white p-6 rounded-lg border border-[#e6dce1] space-y-4">
                    <strong className="font-serif text-base text-[#583e61] block">
                      Add a New Group Member
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#29232b] mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Christine Joy Santos"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#29232b] mb-1">Gmail Address</label>
                        <input
                          type="email"
                          placeholder="christine.santos@gmail.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#29232b] mb-1">Project Role</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Production & Packaging Lead"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#29232b] mb-1">Bio / Role Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Manages clay color palette mixing and customer orders"
                        value={newMemberBio}
                        onChange={(e) => setNewMemberBio(e.target.value)}
                        className="w-full text-xs p-2 bg-[#fbf7f1] border border-[#e6dce1] rounded-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#583e61] text-white text-xs font-semibold rounded-sm hover:bg-[#432d4b] transition-colors"
                    >
                      Add Member to Roster
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: BACKUP & SHARE */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl text-[#29232b]">Share Link & Data Backup</h3>
                    <p className="text-xs text-[#766a75]">
                      Export safety copies of your products and content so you never lose your school project data.
                    </p>
                  </div>

                  {/* Download Backup */}
                  <div className="bg-white p-6 rounded-lg border border-[#e6dce1] space-y-4">
                    <strong className="block text-xs font-semibold text-[#583e61] uppercase tracking-wider">
                      Export / Download Data Backup (JSON)
                    </strong>
                    <p className="text-xs text-[#766a75] leading-relaxed">
                      Download a full safety copy of all your products, uploaded items, pictures, website text, and collaborator access settings.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2.5 bg-[#29232b] text-white text-xs font-semibold rounded-sm hover:bg-[#3d3440] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#d989a5]" />
                      <span>Download MAYUMI Store Backup (.json)</span>
                    </button>
                  </div>

                  {/* Restore Backup */}
                  <div className="bg-white p-6 rounded-lg border border-[#e6dce1] space-y-4">
                    <strong className="block text-xs font-semibold text-[#583e61] uppercase tracking-wider">
                      Restore from JSON Backup
                    </strong>
                    <p className="text-xs text-[#766a75] leading-relaxed">
                      Upload a previously exported backup file to restore all your products and content at any time.
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#cdb9c8] text-xs font-semibold text-[#583e61] rounded-sm hover:bg-[#f2dce5] cursor-pointer">
                      <Upload className="w-4 h-4 text-[#bd7896]" />
                      <span>Upload & Restore JSON File</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Reset to Defaults */}
                  <div className="bg-rose-50/60 p-6 rounded-lg border border-rose-200 space-y-3">
                    <strong className="block text-xs font-semibold text-rose-900">
                      Reset to Business Plan Defaults
                    </strong>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Need to reset everything back to the original business plan data? This reloads the 5 original products and SJDM Bulacan schedule.
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm('Reset all store contents and products back to the original MAYUMI business plan defaults?')) {
                          onResetDefaults(currentMemberName);
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-sm hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset to Original Project Defaults</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-xl text-[#29232b]">Activity & Collaborator Audit Log</h3>
                    <p className="text-xs text-[#766a75]">
                      See recent edits, product uploads, and picture changes made by authorized collaborators.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-[#e6dce1] divide-y divide-[#e6dce1]">
                    {store.activityLogs.map((log) => (
                      <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                        <div>
                          <strong className="text-[#29232b] block">{log.action}</strong>
                          <span className="text-[#766a75] mt-0.5 block">{log.details}</span>
                          <span className="text-[10px] text-[#8c657f] font-mono mt-1 block">
                            By: <strong>{log.member}</strong>
                          </span>
                        </div>
                        <span className="text-[10px] text-[#766a75] font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* IN-APP CONFIRMATION MODAL: PRODUCT DELETION */}
        {productToDelete && (
          <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl border border-[#e6dce1] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#29232b]">Delete Product?</h4>
                  <p className="text-xs text-[#766a75] mt-0.5">
                    This will permanently remove this clip from the website catalog.
                  </p>
                </div>
              </div>

              {/* Product preview summary */}
              <div className="p-3 bg-[#fbf7f1] rounded-lg border border-[#e6dce1] flex items-center gap-3 my-4">
                {productToDelete.image ? (
                  <img
                    src={productToDelete.image}
                    alt={productToDelete.name}
                    className="w-12 h-12 rounded-sm object-cover border border-[#e6dce1] bg-white shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero-product.jpg';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-sm bg-[#eadde7] flex items-center justify-center text-[#583e61] font-bold text-xs shrink-0">
                    Clip
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs text-[#29232b] truncate">{productToDelete.name}</strong>
                  <span className="text-xs font-mono font-bold text-[#583e61]">₱{productToDelete.price}</span>
                </div>
              </div>

              <p className="text-xs text-[#645965] leading-relaxed mb-6">
                Are you sure you want to delete <strong className="text-[#29232b]">"{productToDelete.name}"</strong>? It will immediately disappear for you and all visitors viewing this link.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeletingProduct}
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#583e61] bg-[#fbf7f1] border border-[#cdb9c8] rounded-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingProduct}
                  onClick={confirmDeleteProduct}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-sm hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isDeletingProduct ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP CONFIRMATION MODAL: REVOKE COLLABORATOR ACCESS */}
        {collabToRemove && (
          <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl border border-[#e6dce1] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#29232b]">Revoke Collaborator Access?</h4>
                  <p className="text-xs text-[#766a75] mt-0.5">
                    This user will no longer be able to log in or edit.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#fbf7f1] rounded-lg border border-[#e6dce1] my-4">
                <span className="text-xs font-mono font-bold text-[#29232b] block truncate">{collabToRemove}</span>
              </div>

              <p className="text-xs text-[#645965] leading-relaxed mb-6">
                Are you sure you want to remove editor privileges for <strong className="text-[#29232b]">{collabToRemove}</strong>? Their account will be converted to viewing-only.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isRemovingCollab}
                  onClick={() => setCollabToRemove(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#583e61] bg-[#fbf7f1] border border-[#cdb9c8] rounded-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRemovingCollab}
                  onClick={confirmRemoveCollaborator}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-sm hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isRemovingCollab ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Revoking...</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Yes, Revoke Access</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
