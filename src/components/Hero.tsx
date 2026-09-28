import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Compass, PenTool, Layout, ArrowRight, Activity, CheckCircle2, LogIn, CalendarCheck } from 'lucide-react';
import { ModalKey } from '../types';

interface HeroProps {
  onOpenModal: (key: ModalKey) => void;
  onOpenAuth: () => void;
}

export default function Hero({ onOpenModal, onOpenAuth }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  // Smooth springs for high quality parallax
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  // Parallax transform values
  const midgroundY = useTransform(smoothProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(smoothProgress, [0, 1], ['0%', '40%']);
  const textOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);
  const textScale = useTransform(smoothProgress, [0, 0.7], [1, 0.94]);
  
  // Floating architectural elements moving independently on scroll
  const blueprintX = useTransform(smoothProgress, [0, 1], ['0%', '-25%']);
  const blueprintRotate = useTransform(smoothProgress, [0, 1], [0, -18]);
  
  const blueprint2X = useTransform(smoothProgress, [0, 1], ['0%', '25%']);
  const blueprint2Rotate = useTransform(smoothProgress, [0, 1], [0, 24]);

  const floatBadge1Y = useTransform(smoothProgress, [0, 1], ['0%', '-60%']);
  const floatBadge2Y = useTransform(smoothProgress, [0, 1], ['0%', '-40%']);

  return (
    <section 
      id="home" 
      ref={containerRef}
      className="relative min-h-[90vh] lg:min-h-[96vh] flex items-center justify-center overflow-hidden bg-transparent arch-grid pt-24 pb-12"
    >
      {/* Dynamic Ambient Glow (GPU-optimized subtle radial gradient) */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-3xl pointer-events-none z-10 transform-gpu" />
      <div className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-10 transform-gpu" />

      {/* Midground: Floating Line Art / Blueprint CAD wireframes */}
      <motion.div 
        style={{ y: midgroundY }}
        className="absolute inset-0 z-10 pointer-events-none opacity-25 transform-gpu"
      >
        <motion.div 
          style={{ x: blueprintX, rotate: blueprintRotate }} 
          className="absolute top-1/4 left-6 xl:left-16 hidden lg:block"
        >
          <div className="p-4 rounded-2xl border border-dashed border-brand-gold/40 backdrop-blur-xs">
            <Layout size={160} strokeWidth={0.6} className="text-brand-gold" />
            <div className="text-[10px] font-mono text-brand-gold/60 mt-2 text-center">GRID // AXIS 04-B</div>
          </div>
        </motion.div>

        <motion.div 
          style={{ x: blueprint2X, rotate: blueprint2Rotate }} 
          className="absolute bottom-1/4 right-6 xl:right-16 hidden lg:block"
        >
          <div className="p-4 rounded-2xl border border-dashed border-white/20 backdrop-blur-xs">
            <Compass size={180} strokeWidth={0.5} className="text-white" />
            <div className="text-[10px] font-mono text-white/50 mt-2 text-center">AZIMUTH 142.8°</div>
          </div>
        </motion.div>

        <div className="absolute top-1/3 right-1/4 opacity-40 hidden md:block">
          <PenTool size={90} strokeWidth={0.5} className="text-brand-gold transform rotate-45" />
        </div>
      </motion.div>

      {/* Floating Interactive Metric Badges (Parallax on scroll) */}
      <motion.div
        style={{ y: floatBadge1Y }}
        className="absolute top-1/3 left-8 xl:left-32 z-20 hidden lg:block pointer-events-none"
      >
        <div className="glass-card px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20">
          <div className="w-9 h-9 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/30">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-brand-text">99.8% Sync Rate</div>
            <div className="text-[10px] text-brand-text/50 font-mono">Real-time CAD & Field Feed</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{ y: floatBadge2Y }}
        className="absolute bottom-1/3 right-8 xl:right-32 z-20 hidden lg:block pointer-events-none"
      >
        <div className="glass-card px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border border-brand-gold/40">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-brand-text">Zero Rework Risk</div>
            <div className="text-[10px] text-brand-text/50 font-mono">Zoning & Permit Compliance</div>
          </div>
        </div>
      </motion.div>

      {/* Foreground Content: Text & CTA */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity, scale: textScale }}
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <div>
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full glass-gold-pill text-brand-gold text-xs font-semibold tracking-wider uppercase mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            <span>Commercial & Residential Project Coordination</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light text-brand-text tracking-tight leading-[1.08] mb-6">
            Connect. Plan.<br />
            Build with <span className="text-brand-gold italic gold-glow inline-block font-normal">Confidence.</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl md:text-2xl text-brand-text/70 max-w-3xl mx-auto font-light leading-relaxed">
            BuildSync unites architects, general contractors, and developers on a single 
            real-time coordination canvas — eliminating budget drifts and scheduling blindspots.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-3.5 justify-center items-center">
            {/* Primary Client Sign Up Button */}
            <button 
              onClick={onOpenAuth}
              className="bg-gradient-to-r from-brand-gold via-emerald-400 to-brand-gold hover:from-brand-gold-hover hover:to-brand-gold text-[#06110D] px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-[0_4px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border border-white/30"
              title="Sign up for Client Portal"
            >
              <LogIn size={16} className="text-[#06110D]" />
              <span>Client Sign Up</span>
              <ArrowRight size={16} />
            </button>

            {/* Consultation trigger */}
            <button 
              onClick={() => onOpenModal('consultation')}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-brand-text border border-white/20 hover:border-brand-gold/50 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-all backdrop-blur-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <CalendarCheck size={16} className="text-brand-gold" />
              <span>Book Consultation</span>
            </button>
          </div>

          {/* Mobile & Tablet Visible Companion Readables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 lg:hidden max-w-xl mx-auto text-left">
            <div className="glass-card px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 backdrop-blur-xl border border-white/15">
              <div className="w-8 h-8 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/30 flex-shrink-0">
                <Activity size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-text">99.8% Sync Rate</div>
                <div className="text-[10px] text-brand-text/60 font-mono">Real-time CAD & Field Feed</div>
              </div>
            </div>

            <div className="glass-card px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 backdrop-blur-xl border border-brand-gold/30">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-text">Zero Rework Risk</div>
                <div className="text-[10px] text-brand-text/60 font-mono">Zoning & Permit Compliance</div>
              </div>
            </div>
          </div>

          {/* Quick trust metrics glass bar */}
          <div className="mt-8 lg:mt-12 p-6 sm:p-8 rounded-3xl glass-card border border-white/15 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left sm:text-center shadow-2xl backdrop-blur-2xl">
            <div>
              <div className="text-2xl sm:text-3xl font-light text-brand-gold font-mono">$1.4B+</div>
              <div className="text-xs text-brand-text/50 mt-0.5">Project Volume Coordinated</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-light text-brand-text font-mono">38%</div>
              <div className="text-xs text-brand-text/50 mt-0.5">Faster RFI & Permit Turnaround</div>
            </div>
            <div className="col-span-2 md:col-span-1 text-center">
              <div className="text-2xl sm:text-3xl font-light text-brand-gold font-mono">100%</div>
              <div className="text-xs text-brand-text/50 mt-0.5">Single-Source Version Control</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

