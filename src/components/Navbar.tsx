import React, { useState, useEffect } from 'react';
import { Menu, X, CalendarCheck, ArrowRight, LogIn, User, Compass } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { ModalKey } from '../types';

interface NavbarProps {
  onOpenModal: (key: ModalKey) => void;
  onOpenAuth: () => void;
  isLoggedIn?: boolean;
  userName?: string;
}

export default function Navbar({ onOpenModal, onOpenAuth, isLoggedIn, userName }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);

      // Section scroll spy
      const sections = [
        { id: 'home', offset: 0 },
        { id: 'about', offset: 250 },
        { id: 'how-it-works', offset: 250 },
        { id: 'consultation', offset: 250 },
        { id: 'contact', offset: 350 },
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top - 100) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home', modal: null },
    { name: 'How It Works', href: '#how-it-works', id: 'how-it-works', modal: 'how-it-works' as ModalKey },
    { name: 'Consultation', href: '#consultation', id: 'consultation', modal: 'consultation' as ModalKey },
    { name: 'About', href: '#about', id: 'about', modal: 'about-us' as ModalKey },
    { name: 'Contact', href: '#contact', id: 'contact', modal: 'contact' as ModalKey },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navigation"
      className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 pointer-events-none"
    >
      {/* Scroll Progress Line */}
      <motion.div
        className="h-[2px] bg-gradient-to-r from-brand-gold via-[#e8c887] to-brand-gold origin-left w-full pointer-events-auto"
        style={{ scaleX }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div 
          className={`pointer-events-auto w-full transition-all duration-300 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 ${
            isScrolled
              ? 'glass-nav shadow-[0_16px_50px_rgba(0,0,0,0.7)]'
              : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-lg'
          }`}
        >
          {/* Brand Logo */}
          <a 
            href="#home" 
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-2.5 group cursor-pointer flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-gold via-[#10B981] to-[#047857] flex items-center justify-center font-bold text-[#06110D] text-sm shadow-[0_4px_16px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform flex-shrink-0 border border-white/30">
              <Compass size={18} className="text-[#06110D] transform group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-brand-text leading-tight whitespace-nowrap">
                Build<span className="text-brand-gold">Sync</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-brand-text/45 font-mono -mt-0.5 hidden xs:block">
                Coordination OS
              </span>
            </div>
          </a>

          {/* Desktop Navigation Segmented Glass Controls */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.05] border border-white/15 px-2 py-1 rounded-full backdrop-blur-xl flex-shrink-0 relative shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap z-10 ${
                    isActive ? 'text-brand-bg font-bold' : 'text-brand-text/75 hover:text-brand-text'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-gradient-to-r from-brand-gold to-[#d4b374] rounded-full -z-10 shadow-[0_2px_12px_rgba(197,160,89,0.4)] border border-white/30"
                    />
                  )}
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Action Group */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Consultation Trigger */}
            <button
              onClick={() => onOpenModal('consultation')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-text/80 hover:text-brand-gold px-3.5 py-2 rounded-full border border-white/15 hover:border-brand-gold/50 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md transition-all whitespace-nowrap cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(197,160,89,0.2)]"
            >
              <CalendarCheck size={14} className="text-brand-gold" />
              <span>Consultation</span>
            </button>

            {/* Primary Client Login / Portal Button */}
            <button
              onClick={onOpenAuth}
              className="bg-gradient-to-r from-brand-gold via-[#d4b374] to-brand-gold hover:from-brand-gold-hover hover:to-brand-gold text-brand-bg px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(197,160,89,0.35)] hover:shadow-[0_4px_25px_rgba(197,160,89,0.5)] active:scale-95 whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-sans border border-white/30"
              title={isLoggedIn ? "Open Client Dashboard" : "Sign in to Client Portal"}
            >
              {isLoggedIn ? (
                <>
                  <Compass size={14} className="text-brand-bg animate-pulse" />
                  <span>Dashboard</span>
                </>
              ) : (
                <>
                  <LogIn size={14} className="text-brand-bg" />
                  <span>Client Login</span>
                </>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              className="lg:hidden p-2 text-brand-text hover:text-brand-gold rounded-full hover:bg-white/10 transition-colors flex-shrink-0 border border-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 lg:hidden"
          >
            <div className="bg-[#12151c]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 shadow-2xl space-y-3">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <div 
                      key={link.name} 
                      className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                        isActive ? 'bg-brand-gold/15 text-brand-gold' : 'hover:bg-white/5 text-brand-text'
                      }`}
                    >
                      <a
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className="text-sm font-medium block flex-1"
                      >
                        {link.name}
                      </a>
                      {link.modal && (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenModal(link.modal);
                          }}
                          className="text-[11px] uppercase tracking-wider text-brand-gold/90 hover:text-brand-gold px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenModal('consultation');
                  }}
                  className="w-full bg-white/5 border border-white/15 text-brand-text px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2"
                >
                  <CalendarCheck size={15} className="text-brand-gold" />
                  <span>Book a Consultation</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full bg-brand-gold text-brand-bg px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-gold-hover transition-all text-center font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 cursor-pointer"
                >
                  {isLoggedIn ? (
                    <>
                      <Compass size={15} className="text-brand-bg" />
                      <span>Open Dashboard</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={15} className="text-brand-bg" />
                      <span>Client Login</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

