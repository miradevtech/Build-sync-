import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhatIsBuildSync from './components/WhatIsBuildSync';
import HowItWorks from './components/HowItWorks';
import Consultation from './components/Consultation';
import WhyBuildSync from './components/WhyBuildSync';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import InfoDrawer from './components/InfoDrawer';
import AuthView from './components/app/AuthView';
import BuildSyncApp from './components/app/BuildSyncApp';
import { auth as fbAuth, onAuthStateChanged, fbSignOut, db, doc, getDoc, updateDoc } from './lib/firebase';
import { ModalKey, UserRole } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('buildsync_user_name') || '';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('buildsync_user_email') || '';
  });
  const [userAvatar, setUserAvatar] = useState<string | null>(() => {
    return localStorage.getItem('buildsync_user_avatar') || null;
  });
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  React.useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribeFb = onAuthStateChanged(fbAuth, async (fbUser) => {
      if (fbUser) {
        const email = fbUser.email || '';
        let finalName = fbUser.displayName || (email ? email.split('@')[0] : 'Client');
        let finalRole: UserRole = 'client';
        let finalAvatar: string | null = fbUser.photoURL || null;

        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.fullName) finalName = data.fullName;
            if (data.role) finalRole = data.role as UserRole;
          }
        } catch (e) {
          console.warn('Firebase user doc read notice:', e);
        }

        setUserEmail(email);
        setUserName(finalName);
        setUserRole(finalRole);
        if (finalAvatar) setUserAvatar(finalAvatar);
        if (email) localStorage.setItem('buildsync_user_email', email);
        localStorage.setItem('buildsync_user_name', finalName);


      } else {
        setUserEmail('');
        setUserName('');
        setUserAvatar(null);
        localStorage.removeItem('buildsync_user_name');
        localStorage.removeItem('buildsync_user_email');
        localStorage.removeItem('buildsync_user_avatar');
        sessionStorage.removeItem('buildsync_active_portal');
      }
      setIsAuthenticating(false);
    });

    return () => {
      unsubscribeFb();
    };
  }, []);

  const handleLogout = async () => {
    try { await fbSignOut(fbAuth); } catch {}
    sessionStorage.removeItem('buildsync_active_portal');
    setUserEmail('');
    setUserName('');
    setUserAvatar(null);
    localStorage.removeItem('buildsync_user_name');
    localStorage.removeItem('buildsync_user_email');
    localStorage.removeItem('buildsync_user_avatar');
    setIsAuthenticating(false);
    setCurrentView('landing');
  };

  const handleUpdateProfileName = async (newName: string) => {
    setUserName(newName);
    localStorage.setItem('buildsync_user_name', newName);
    if (fbAuth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', fbAuth.currentUser.uid), {
          fullName: newName
        });
      } catch (err) {
        console.warn('Update Firebase profile error:', err);
      }
    }
  };

  const handleOpenModal = (key: ModalKey) => {
    setActiveModal(key);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleOpenAuth = () => {
    setUserRole('client');
    setCurrentView('auth');
  };

  const handleLogin = (role: UserRole = 'client', name?: string, email?: string) => {
    setUserRole(role);
    if (name) {
      setUserName(name);
      localStorage.setItem('buildsync_user_name', name);
    }
    if (email) {
      setUserEmail(email);
      localStorage.setItem('buildsync_user_email', email);
    }
    sessionStorage.setItem('buildsync_active_portal', 'true');
    setCurrentView('app');
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#050E0A] flex flex-col items-center justify-center text-white px-4 relative z-50">
        <div className="flex flex-col items-center max-w-sm text-center gap-5 p-8 rounded-2xl bg-[#081510] border border-emerald-500/20 shadow-2xl">
          <div className="w-12 h-12 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-wide">Signing in to BuildSync</h3>
            <p className="text-sm text-slate-300">Loading your account and client portal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthView 
        initialRole="client"
        onLogin={handleLogin} 
        onBack={() => setCurrentView('landing')} 
      />
    );
  }

  if (currentView === 'app') {
    return (
      <BuildSyncApp 
        initialRole={userRole}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        onLogout={handleLogout} 
        onReturnHome={() => setCurrentView('landing')}
        onUpdateProfileName={handleUpdateProfileName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-brand-text overflow-x-hidden relative selection:bg-brand-gold selection:text-brand-bg">
      {/* High-Performance Hardware-Accelerated Architectural Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050E0A]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-80 contrast-[1.12] brightness-[1.02] saturate-[1.08] transform-gpu"
        >
          <source src="https://res.cloudinary.com/nmizpaiu/video/upload/v1/Animate_futuristic_construction___202608132345.mp4" type="video/mp4" />
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Subtle Architectural Blueprint Grid */}
        <div className="absolute inset-0 arch-grid opacity-20 pointer-events-none" />

        {/* Lightweight Native CSS Radial Glows */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 transition-all duration-700 bg-[radial-gradient(circle,#10B981_0%,transparent_70%)]"
        />
        <div 
          className="absolute top-[30%] -right-[15%] w-[650px] h-[650px] rounded-full pointer-events-none opacity-15 transition-all duration-700 bg-[radial-gradient(circle,#34D399_0%,transparent_70%)]"
        />
        <div 
          className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] rounded-full pointer-events-none opacity-15 transition-all duration-700 bg-[radial-gradient(circle,#10B981_0%,transparent_70%)]"
        />

        {/* Crisp Architectural Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050E0A]/40 via-[#06110D]/30 to-[#050E0A]/80 pointer-events-none" />
      </div>

      <Navbar 
        onOpenModal={handleOpenModal} 
        onOpenAuth={handleOpenAuth} 
      />
      
      <main className="relative z-10">
        <Hero 
          onOpenModal={handleOpenModal} 
          onOpenAuth={handleOpenAuth} 
        />
        <WhatIsBuildSync />
        <HowItWorks onOpenModal={handleOpenModal} />
        <Consultation onOpenModal={handleOpenModal} />
        <WhyBuildSync />
        <CallToAction onOpenModal={handleOpenModal} />
      </main>

      <Footer onOpenModal={handleOpenModal} onOpenAuth={handleOpenAuth} />

      {/* Interactive Lower Pop-Up / Bottom Drawer Modal */}
      <InfoDrawer
        activeModal={activeModal}
        onClose={handleCloseModal}
        onSelectModal={handleOpenModal}
      />
    </div>
  );
}
