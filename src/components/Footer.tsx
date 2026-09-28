import React from 'react';
import { Mail, MapPin, Shield, FileText, ArrowUpRight, HardHat } from 'lucide-react';
import { ModalKey } from '../types';

interface FooterProps {
  onOpenModal: (key: ModalKey) => void;
  onOpenAuth?: () => void;
}

export default function Footer({ onOpenModal, onOpenAuth }: FooterProps) {
  return (
    <footer id="contact" className="bg-[#0b0e14]/90 backdrop-blur-2xl text-brand-text border-t border-white/10 pt-16 pb-12 relative z-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-gold flex items-center justify-center rounded-lg font-bold text-brand-bg text-sm shadow-[0_0_15px_rgba(197,160,89,0.35)]">
                B
              </div>
              <span className="text-xl font-semibold tracking-tight text-brand-text">
                Build<span className="text-brand-gold">Sync</span>
              </span>
            </div>
            <p className="text-brand-text/60 text-sm leading-relaxed mb-4">
              The high-precision coordination and consultation platform for commercial developers, architects, and forward-thinking builders.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-brand-text/60">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
              <span>Direct Coordination Network</span>
            </div>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="text-brand-text font-semibold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-brand-text/65">
              <li>
                <button
                  onClick={() => onOpenAuth ? onOpenAuth() : onOpenModal('get-started')}
                  className="text-brand-gold font-semibold hover:underline transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>Client Sign Up</span>
                  <ArrowUpRight size={14} className="opacity-70 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('how-it-works')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>How it Works</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('features')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>Features & Integrations</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('consultation')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>Expert Consultation</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('get-started')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>Project Onboarding</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
            </ul>
          </div>

          {/* Company Col */}
          <div>
            <h4 className="text-brand-text font-semibold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
              Company
            </h4>
            <ul className="space-y-3 text-sm text-brand-text/65">
              <li>
                <button
                  onClick={() => onOpenModal('about-us')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>About Us</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('careers')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>Careers</span>
                  <span className="text-[10px] glass-gold-pill text-brand-gold px-2 py-0.5 rounded font-mono font-bold">HIRING</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('blog')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>Industry Insights (Blog)</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('contact')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span>Contact Representative</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-gold" />
                </button>
              </li>
            </ul>
          </div>

          {/* Verified Contact Info Col */}
          <div>
            <h4 className="text-brand-text font-semibold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm text-brand-text/70">
              {/* Sole Email Address */}
              <div className="p-3.5 rounded-2xl glass-card border border-brand-gold/30 shadow-lg">
                <span className="text-[11px] text-brand-text/50 uppercase tracking-wider block mb-1">
                  Primary Contact Email
                </span>
                <a
                  href="mailto:johnharrissimons@gmail.com"
                  className="text-brand-gold font-mono font-bold text-xs hover:underline flex items-center gap-1.5 break-all"
                >
                  <Mail size={14} className="flex-shrink-0" />
                  <span>johnharrissimons@gmail.com</span>
                </a>
              </div>

              {/* Suggested Location */}
              <div className="p-3.5 rounded-2xl glass-card border border-white/10 shadow-lg">
                <span className="text-[11px] text-brand-text/50 uppercase tracking-wider block mb-1">
                  Suggested HQ Location
                </span>
                <div className="flex items-start gap-2 text-xs text-brand-text/80">
                  <MapPin size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    100 Congress Avenue, Suite 2000<br />
                    Austin, TX 78701
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Bar: Copyright, Terms & Privacy */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-brand-text/45">
          <p>&copy; {new Date().getFullYear()} BuildSync Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-6 font-semibold uppercase tracking-wider">
            <button
              onClick={() => onOpenModal('privacy')}
              className="hover:text-brand-gold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield size={12} className="text-brand-gold" />
              <span>Privacy Policy</span>
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenModal('terms')}
              className="hover:text-brand-gold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText size={12} className="text-brand-gold" />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
