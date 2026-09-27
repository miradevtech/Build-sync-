import React, { useState } from 'react';
import { Compass, ArrowLeft, Mail, Lock, ArrowRight, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';
import { 
  auth as fbAuth, 
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
      return 'Email/Password sign-in is not yet enabled in your Firebase Console (Authentication → Sign-in method → Email/Password). Tap Demo Mode below to enter immediately.';
    }

    if (code === 'auth/email-already-in-use' || raw.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please switch to "Sign In" below.';
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
        
        // Save profile in Firestore in the background without blocking the UI
        setDoc(doc(db, 'users', cred.user.uid), {
          id: cred.user.uid,
          fullName: targetName,
          email: targetEmail,
          role: 'client',
          createdAt: new Date().toISOString()
        }, { merge: true }).catch((profileErr) => {
          console.warn('Firestore profile write notice:', profileErr);
        });

        localStorage.setItem('buildsync_user_name', targetName);
        localStorage.setItem('buildsync_user_email', targetEmail);
        sessionStorage.setItem('buildsync_active_portal', 'true');
        
        // Instant direct transition to portal dashboard
        onLogin('client', targetName, targetEmail);
      } else {
        await signInWithEmailAndPassword(fbAuth, targetEmail, password);
        localStorage.setItem('buildsync_user_name', targetName);
        localStorage.setItem('buildsync_user_email', targetEmail);
        sessionStorage.setItem('buildsync_active_portal', 'true');
        
        // Instant direct transition to portal dashboard
        onLogin('client', targetName, targetEmail);
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
    sessionStorage.setItem('buildsync_active_portal', 'true');
    onLogin('client', resolvedName, resolvedEmail);
  };

  return (
    <div className="min-h-screen bg-[#050E0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-[#E5E4E0]">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
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
