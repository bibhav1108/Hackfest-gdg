import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';
import { collection, onSnapshot, setDoc, doc, getDocs } from 'firebase/firestore';
import { Prescription, Medication } from '../types/pharmacy';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      
      // Save or update user profile document in Firestore
      if (loggedUser) {
        const userRef = doc(db, 'users', loggedUser.uid);
        await setDoc(userRef, {
          uid: loggedUser.uid,
          email: loggedUser.email || '',
          displayName: loggedUser.displayName || 'Pharmacist',
          photoURL: loggedUser.photoURL || '',
          role: 'pharmacist',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      return loggedUser;
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
      return null;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  return {
    user,
    loading,
    authError,
    loginWithGoogle,
    logout,
  };
}
