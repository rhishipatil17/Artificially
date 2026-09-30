import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth, db } from './firebase';

interface AuthContextValue {
  user: User | null;
  /** True until Firebase has restored (or ruled out) a saved session. */
  initializing: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // Bumped when the profile changes in place, so consumers re-read user.displayName.
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setInitializing(false);
      }),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      async signIn(email, password) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      async signUp(name, email, password) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await setDoc(doc(db, 'users', cred.user.uid), {
          displayName: name.trim(),
          email: cred.user.email,
          createdAt: Date.now(),
        });
        // onAuthStateChanged fired before the display name was set.
        setProfileVersion((v) => v + 1);
      },
      async signOut() {
        await firebaseSignOut(auth);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initializing, profileVersion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Turns Firebase auth error codes into messages a user can act on. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return (err as Error)?.message ?? 'Something went wrong.';
  }
}
