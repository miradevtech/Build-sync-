import React, { useState } from 'react';
import { Compass, ArrowLeft, Mail, Lock, ArrowRight, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';
import { 
  auth as fbAuth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  db, 
  doc, 
  setDoc 
} from '../../lib/firebase';

interface AuthViewProps {
  initialRole?: UserRole;
  onLogin: (role?: UserRole, userName?: string, userEmail?: string) => void;
  onBack: () => void;
}

export default function AuthView({ onLogin, onBack }: AuthViewProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDemoAccess, setShowDemoAccess] = useState(false);

  // Friendly error messages tailored strictly for Firebase Auth
  const getFirebaseErrorMessage = (err: any, isSignUpMode: boolean): string => {
    if (!err) return 'Invalid email or password. Please check your credentials and try again.';
    
    const code = (err.code || '').toLowerCase();
    const raw = (err.message || String(err)).toLowerCase();

    if (code === 'auth/operation-not-allowed' || raw.includes('operation-not-allowed')) {
      setShowDemoAccess(true);
      return 'Email/Password sign-in is not yet enabled in your Firebase Console (Authentication → Sign-in method → Email/Password). Use "Continue with Google" above, or tap Demo Mode below to enter immediately.';
    }

    if (code === 'auth/email-already-in-use' || raw.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please switch to "Sign In" or use "Continue with Google".';
    }

    if (
      code === 'auth/wrong-password' || 
      code === 'auth/invalid-credential' || 
      code === 'auth/user-not-found' ||
      raw.includes('invalid-credential') ||
      raw.includes('wrong-password') ||
      raw.includes('user-not-found')
    ) {
      return isSignUpMode
        ? 'Unable to create account with these credentials. Please check your details.'
        : 'Invalid email or password. If you do not have an account yet, click "Sign Up" below.';
    }

    if (code === 'auth/invalid-email' || raw.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }

    if (code === 'auth/weak-password' || raw.includes('weak-password')) {
      return 'Password must be at least 6 characters long.';
    }

    if (code === 'auth/too-many-requests' || raw.includes('too-many-requests')) {
      return 'Too many failed attempts. Please wait a few moments and try again.';
    }

    if (code === 'auth/network-request-failed' || raw.includes('network-request-failed')) {
      setShowDemoAccess(true);
      return 'Network connection error reaching Firebase. Please check your internet connection or use Demo Mode.';
    }

    if (err.message && typeof err.message === 'string' && err.message.length > 5) {
      return err.message;
    }

    return isSignUpMode
      ? 'Unable to create account. Please check your details and try again.'
      : 'Invalid email or password. Please check your credentials and try again.';
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    setShowDemoAccess(false);
    try {
      // Force Google account chooser so the user can pick from different Google accounts
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(fbAuth, googleProvider);
      const user = result.user;
      const userName = user.displayName || user.email?.split('@')[0] || 'Client User';
      const userEmail = user.email || '';
      
      try {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          fullName: userName,
          email: userEmail,
          role: 'client',
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn('Firestore profile write notice:', firestoreErr);
      }

      localStorage.setItem('buildsync_user_name', userName);
      if (userEmail) localStorage.setItem('buildsync_user_email', userEmail);
      if (user.photoURL) localStorage.setItem('buildsync_user_avatar', user.photoURL);
      sessionStorage.setItem('buildsync_active_portal', 'true');

      setSuccessMsg('Signed in with Google successfully! Entering portal...');
      setTimeout(() => {
        onLogin('client', userName, userEmail);
      }, 300);
    } catch (err: any) {
      const code = (err?.code || '').toLowerCase();
      const msg = (err?.message || String(err)).toLowerCase();
      const isUserClosed = 
        code === 'auth/popup-closed-by-user' || 
        code === 'auth/cancelled-popup-request' ||
        msg.includes('closed-by-user') || 
        msg.includes('popup-closed') ||
        msg.includes('cancelled');

      if (isUserClosed) {
        // User closed or dismissed the popup — normal user behavior, not an error
        return;
      }

      if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        setErrorMsg('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
        return;
      }

      console.warn('Google Sign-in notice:', err);
      setErrorMsg('Google Sign-In: ' + (err.message || 'Unable to connect to Google account.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setShowDemoAccess(false);

    const trimmedInput = emailOrUsername.trim();
    if (!trimmedInput) {
      setErrorMsg('Please enter your email or username.');
      setLoading(false);
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      setLoading(false);
      return;
    }

    const isEmail = trimmedInput.includes('@');
    const targetEmail = isEmail 
      ? trimmedInput.toLowerCase() 
      : `${trimmedInput.toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@buildsync.internal`;
    
    const targetName = isSignUp 
      ? (fullName.trim() || trimmedInput) 
      : (trimmedInput.includes('@') ? trimmedInput.split('@')[0] : trimmedInput);

    if (isSignUp && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(fbAuth, targetEmail, password);
        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            id: cred.user.uid,
            fullName: targetName,
            email: targetEmail,
            role: 'client',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (profileErr) {
          console.warn('Firestore profile write notice:', profileErr);
        }

        localStorage.setItem('buildsync_user_name', targetName);
        localStorage.setItem('buildsync_user_email', targetEmail);
        sessionStorage.setItem('buildsync_active_portal', 'true');
        setSuccessMsg('Account created successfully! Taking you to your portal...');
        setTimeout(() => {
          onLogin('client', targetName, targetEmail);
        }, 400);
      } else {
        await signInWithEmailAndPassword(fbAuth, targetEmail, password);
        localStorage.setItem('buildsync_user_name', targetName);
        localStorage.setItem('buildsync_user_email', targetEmail);
        sessionStorage.setItem('buildsync_active_portal', 'true');
        setSuccessMsg('Signed in successfully! Loading portal...');
        setTimeout(() => {
          onLogin('client', targetName, targetEmail);
        }, 400);
      }
    } catch (err: any) {
      console.warn('Firebase email auth error:', err);
      setErrorMsg(getFirebaseErrorMessage(err, isSignUp));
      setLoading(false);
    }
  };

  const handleDemoContinue = () => {
    const resolvedName = fullName.trim() || (emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername) || 'Client User';
    const resolvedEmail = emailOrUsername.includes('@') ? emailOrUsername.trim() : 'client@buildsync.com';
    localStorage.setItem('buildsync_user_name', resolvedName);
    localStorage.setItem('buildsync_user_email', resolvedEmail);
    onLogin('client', resolvedName, resolvedEmail);
  };

  return (
    <div className="min-h-screen bg-[#050E0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-[#E5E4E0]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#06110D]/90 z-10" />
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none z-10" />
        <div className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] bg-[#059669]/10 rounded-full blur-3xl pointer-events-none z-10" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center cursor-pointer" onClick={onBack}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Compass size={24} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-white tracking-tight">
          {isSignUp ? 'Create an Account' : 'Client Portal'}
        </h2>
        <p className="mt-2 text-center text-sm text-[#A0A0A0]">
          {isSignUp ? 'Sign up to manage your project' : 'Sign in to access your dashboard'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#06110D] py-8 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:rounded-3xl sm:px-10 border border-white/10 backdrop-blur-2xl">
          <button
            onClick={onBack}
            className="flex items-center text-xs text-[#A0A0A0] hover:text-white transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to Website
          </button>
          
          {errorMsg && (
            <div className="mb-5 bg-red-500/10 border border-red-500/40 text-red-300 text-sm p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle size={17} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {showDemoAccess && (
            <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-sm">
                <span>Instant Demo Access Available</span>
              </div>
              <p className="leading-relaxed text-amber-200/90 text-xs">
                To enable email signups on Firebase, open your Firebase Console (Authentication → Sign-in method → Enable Email/Password). Or enter immediately below:
              </p>
              <button
                type="button"
                onClick={handleDemoContinue}
                className="w-full py-2.5 px-3 bg-amber-500/25 hover:bg-amber-500/35 text-amber-100 rounded-lg font-bold border border-amber-500/40 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Enter Portal Now (Instant Access)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-green-500/10 border border-green-500/50 text-green-400 text-sm p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={17} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {fbAuth.currentUser && (
            <div className="mb-5 p-3.5 rounded-xl bg-white/[0.04] border border-[#10B981]/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Active Session</p>
                <p className="text-xs text-emerald-400 font-medium truncate">{fbAuth.currentUser.email || fbAuth.currentUser.displayName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onLogin('client', fbAuth.currentUser?.displayName || '', fbAuth.currentUser?.email || '')}
                  className="text-xs bg-[#10B981] hover:bg-[#059669] text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Enter Portal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try { await fbAuth.signOut(); } catch {}
                    localStorage.removeItem('buildsync_user_name');
                    localStorage.removeItem('buildsync_user_email');
                    localStorage.removeItem('buildsync_user_avatar');
                    sessionStorage.removeItem('buildsync_active_portal');
                    setErrorMsg('');
                    setSuccessMsg('Signed out. Pick another Google account or use email below.');
                  }}
                  className="text-xs text-white/60 hover:text-white underline cursor-pointer px-1 py-1"
                >
                  Switch
                </button>
              </div>
            </div>
          )}

          {/* One-Click Google Sign-In with Account Selection */}
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleSignIn}
            className="w-full mb-2 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/15 bg-white/[0.07] hover:bg-white/[0.12] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.01] disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : (isSignUp ? 'Sign up with Google' : 'Continue with Google')}</span>
          </button>
          <p className="text-[11px] text-white/40 text-center mb-4">Choose from any Google account</p>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-white/40 font-medium">or with email</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  Full Name / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-[#666]" />
                  </div>
                  <input
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all sm:text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                {isSignUp ? 'Email Address' : 'Email or Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-[#666]" />
                </div>
                <input
                  type={isSignUp ? 'email' : 'text'}
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all sm:text-sm"
                  placeholder={isSignUp ? 'client@example.com' : 'client@example.com or username'}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                  Password
                </label>
                {isSignUp && (
                  <span className="text-[11px] text-[#888]">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-[#666]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-all cursor-pointer mt-5 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#A0A0A0]">
            {isSignUp ? (
              <>Already have an account? <button onClick={() => { setIsSignUp(false); setErrorMsg(''); setShowDemoAccess(false); }} className="text-[#10B981] hover:underline font-bold ml-1 cursor-pointer">Sign In</button></>
            ) : (
              <>Don't have an account? <button onClick={() => { setIsSignUp(true); setErrorMsg(''); setShowDemoAccess(false); }} className="text-[#10B981] hover:underline font-bold ml-1 cursor-pointer">Sign Up</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
