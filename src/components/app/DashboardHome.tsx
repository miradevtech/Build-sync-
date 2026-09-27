import React from 'react';
import { Calendar, FileText, CheckCircle, Clock, Activity, MessageSquare, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardHomeProps {
  onNavigate?: (view: string) => void;
  userName?: string;
}

export default function DashboardHome({ onNavigate, userName }: DashboardHomeProps) {
  const stats = [
    { title: 'Active Projects', value: '0', icon: Activity, color: 'text-[#06110D]', bg: 'bg-[#F0EFED]', target: 'projects' },
    { title: 'Upcoming Consultations', value: '0', icon: Calendar, color: 'text-[#10B981]', bg: 'bg-[#FFFFFF]', target: 'consultations' },
    { title: 'Pending Requests', value: '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', target: 'documents' },
    { title: 'Completed Projects', value: '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', target: 'projects' },
  ];

  const recentActivity = [
    { id: 1, action: 'Welcome to BuildSync', details: 'Your account has been created successfully.', time: 'Just now', icon: Compass, target: 'dashboard' },
  ];

  const handleNavigation = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[#06110D]">Welcome back, {userName ? userName.split(' ')[0] : 'Client'}</h1>
        <p className="text-[#666] text-sm">Here is what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            onClick={() => handleNavigation(stat.target)}
            className="bg-white p-4 rounded-xl border border-[#A7F3D0] shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#10B981] transition-all group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
              <stat.icon size={18} strokeWidth={1.5} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[9px] sm:text-[10px] font-bold text-[#666] uppercase tracking-wider truncate">{stat.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-[#06110D] tracking-tight leading-none mt-0.5">{stat.value}</p>
            </div>
            <ArrowRight size={14} className="text-[#A0A0A0] opacity-0 group-hover:opacity-100 group-hover:text-[#10B981] transition-all -translate-x-1 group-hover:translate-x-0 shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#A7F3D0] flex justify-between items-center bg-[#FAFAFA]">
            <h2 className="text-base font-semibold text-[#06110D]">Recent Activity</h2>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-6">
              {recentActivity.map((item, idx) => (
                <div key={item.id} className="flex gap-4 relative group">
                  {idx !== recentActivity.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-[#F0EFED]" />
                  )}
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#F0EFED] flex items-center justify-center z-10 text-[#A0A0A0] shrink-0 group-hover:border-[#10B981] group-hover:text-[#10B981] transition-colors shadow-sm">
                    <item.icon size={16} />
                  </div>
                  <div 
                    onClick={() => handleNavigation(item.target)}
                    className="pt-1.5 cursor-pointer hover:bg-[#FFFFFF] p-3 -mt-3 rounded-xl flex-1 transition-colors border border-transparent hover:border-[#A7F3D0]"
                  >
                    <p className="text-sm font-medium text-[#06110D] group-hover:text-[#10B981] transition-colors">{item.action}</p>
                    <p className="text-sm text-[#666] mt-0.5">{item.details}</p>
                    <p className="text-xs font-medium text-[#A0A0A0] mt-1.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links / Notifications */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden flex-1">
            <div className="px-6 py-5 border-b border-[#A7F3D0] bg-[#FAFAFA]">
              <h2 className="text-base font-semibold text-[#06110D]">Upcoming Tasks</h2>
            </div>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={22} />
              </div>
              <p className="text-sm font-semibold text-[#06110D]">All Caught Up!</p>
              <p className="text-xs text-[#666] mt-1 max-w-[200px] mx-auto leading-relaxed">
                You have no pending approvals, signatures, or permit tasks at this time.
              </p>
              <button
                onClick={() => handleNavigation('consultations')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] hover:text-[#059669] transition-colors"
              >
                <span>Book a Consultation</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
          
          <div className="bg-[#10B981] rounded-2xl p-6 text-white shadow-md relative overflow-hidden shrink-0">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Calendar size={18} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5">Need a consultation?</h3>
              <p className="text-sm text-white/70 mb-5 leading-relaxed">Book a session with our lead architects to discuss your next phase.</p>
              <button 
                onClick={() => handleNavigation('consultations')}
                className="w-full bg-white text-[#06110D] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F0EFED] transition-colors flex items-center justify-center gap-2"
              >
                Book Now <ArrowRight size={16} />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}
