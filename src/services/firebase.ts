import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must pass firestoreDatabaseId as required by AI Studio Firestore configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration or network status.');
    }
  }
}

// Google Sign-in for collaborators
export async function signInWithGoogle(): Promise<User> {
  try {
    const popupPromise = signInWithPopup(auth, googleProvider);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sign-in popup timed out or was blocked by browser. Please use the Collaborator Password form below.')), 25000);
    });
    const result = await Promise.race([popupPromise, timeoutPromise]);
    return result.user;
  } catch (err: any) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

// Collaborator PIN session registration in Firestore
export async function authenticateCollaboratorSession(email: string, name: string): Promise<User | null> {
  try {
    let currentUser = auth.currentUser;
    if (!currentUser) {
      try {
        const userCred = await signInAnonymously(auth);
        currentUser = userCred.user;
      } catch (authErr) {
        console.warn('Anonymous auth note (proceeding with session):', authErr);
      }
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, 'admins', currentUser.uid), {
          uid: currentUser.uid,
          email,
          name,
          role: 'Collaborator',
          signedInAt: new Date().toISOString()
        }, { merge: true });
      } catch (adminDocErr) {
        console.warn('Admin record write note:', adminDocErr);
      }
    }
    return currentUser;
  } catch (err) {
    console.warn('Collaborator authentication session note:', err);
    return auth.currentUser;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged, signInAnonymously };

