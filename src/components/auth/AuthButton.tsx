import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export const AuthButton: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Firebase Auth sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Firebase Auth sign-out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Syncing Auth...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-teal-50 dark:bg-slate-800 border border-teal-200/80 dark:border-slate-700 px-2.5 py-1 rounded-xl shadow-2xs">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-5 h-5 rounded-full object-cover border border-teal-300 dark:border-teal-600"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
              {user.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <span className="text-xs font-bold text-teal-950 dark:text-teal-200 max-w-[90px] truncate hidden sm:inline">
            {user.displayName?.split(' ')[0] || 'User'}
          </span>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95 shadow-2xs"
      title="Sign in with Google to sync saved medicines across devices"
    >
      {isSigningIn ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
      ) : (
        <LogIn className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
      )}
      <span>Sign In</span>
    </button>
  );
};
