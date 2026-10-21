import React from 'react';
import { X, LogIn, LogOut, ShieldCheck, UserCheck, Cloud, AlertCircle } from 'lucide-react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loading, authError, loginWithGoogle, logout } = useFirebaseAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-5 py-4 bg-[#0a1622]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white tracking-wide text-sm">
                Pharmacist Authentication
              </h3>
              <p className="text-[11px] text-teal-400">
                Firebase Auth & Cloud Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {authError && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {user ? (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Pharmacist'}
                    className="w-16 h-16 rounded-full border-2 border-teal-500/40 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xl">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {user.displayName || 'Authorized Pharmacist'}
                  </h4>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#1b344d] bg-[#0b1622] p-3 text-xs text-left space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Role:</span>
                  <span className="text-teal-300 font-medium capitalize">Lead Pharmacist</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Firestore Persistence:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" /> Synced & Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Session UID:</span>
                  <span className="font-mono-numbers text-[10px] text-slate-400 truncate max-w-[130px]">
                    {user.uid}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in with your Google Workspace or Clinical credentials to synchronize prescriptions, inventory, and dispensing logs securely to Firebase Firestore.
              </p>

              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-md transition active:scale-95 disabled:opacity-60"
              >
                {/* Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1b344d] p-3 bg-[#0a1622] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-[#142637] hover:bg-[#1a334a] rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
