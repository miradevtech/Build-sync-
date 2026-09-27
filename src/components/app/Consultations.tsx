import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ArrowLeft, CheckCircle2, Video, MessageSquare, Trash2, Edit3, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsultationsProps {
  onNavigate?: (view: string) => void;
  onAddConsultation?: (consultation: any) => void;
  userName?: string;
  userEmail?: string;
}

export default function Consultations({ onNavigate, onAddConsultation, userName, userEmail }: ConsultationsProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [joiningCall, setJoiningCall] = useState<string | null>(null);
  
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const past: any[] = [];

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Grab form data
    const formData = new FormData(e.currentTarget);
    const projectName = formData.get('projectName') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const projectType = formData.get('projectType') as string || 'General';
    const notes = formData.get('notes') as string || projectName;

    // Format date string nicely
    const dateObj = new Date(date + 'T12:00:00');
    const formattedDate = isNaN(dateObj.getTime()) 
      ? date 
      : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Add to local upcoming list for immediate client view feedback
    const newBooking = {
      id: Date.now(),
      title: projectName || 'Consultation Booking',
      date: formattedDate,
      time: time,
      with: 'Pending Assignment',
      status: 'Pending'
    };
    
    setUpcoming(prev => [newBooking, ...prev]);

    // Send to global admin state (legacy mock state)
    if (onAddConsultation) {
      onAddConsultation({
        id: 'CNS-' + Math.floor(Math.random() * 10000),
        clientName: userName || 'Client',
        clientEmail: userEmail || 'client@example.com',
        phone: '+1 (555) 123-4567',
        projectType: projectType,
        budget: 'TBD',
        location: 'TBD',
        preferredDate: formattedDate,
        preferredTime: time,
        assignedStaff: 'Unassigned',
        status: 'Pending',
        notes: `Project Name: ${projectName}`,
        submittedAt: new Date().toISOString()
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsBooking(false);
    }, 3000);
  };

  const handleJoinCall = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate('messages');
    } else {
      setJoiningCall(title);
      setTimeout(() => {
        setJoiningCall(null);
      }, 2000);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this consultation?')) {
      setUpcoming(prev => prev.filter(item => item.id !== id));
      setEditingItem(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setUpcoming(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
      setEditingItem(null);
    }
  };

  if (isBooking) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        <button 
          onClick={() => setIsBooking(false)}
          className="flex items-center gap-2 text-[#666] hover:text-[#06110D] transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium text-sm">Cancel Booking</span>
        </button>

        {isSuccess ? (
          <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold text-[#06110D] mb-2">Request Submitted!</h2>
            <p className="text-[#666]">Your consultation request has been received. Our team will review and confirm your slot shortly.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#06110D]">Book a Consultation</h2>
              <p className="text-[#666] text-sm mt-1">Fill out the details below to schedule time with our experts.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Project Name</label>
                  <input type="text" name="projectName" required className="w-full px-3 py-2.5 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" placeholder="e.g. Modern Residence" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Project Type</label>
                  <select name="projectType" required className="w-full px-3 py-2.5 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]">
                    <option value="">Select a type...</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="remodel">Remodel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Preferred Date</label>
                  <input type="date" name="date" required className="w-full px-3 py-2.5 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Preferred Time</label>
                  <input type="time" name="time" required className="w-full px-3 py-2.5 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Description of what you need</label>
                <textarea name="notes" required rows={4} className="w-full px-3 py-2.5 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" placeholder="Briefly describe the topics you'd like to cover..."></textarea>
              </div>

              <div className="pt-4 border-t border-[#F0EFED] flex justify-end">
                <button type="submit" className="bg-[#10B981] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2D2D2D] transition-colors">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">

      


      {/* Edit Consultation Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#10B981]/60 backdrop-blur-sm"
              onClick={() => setEditingItem(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#FFFFFF] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#A7F3D0] bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0EFED] flex items-center justify-center text-[#666]">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#06110D]">Edit Consultation</h3>
                  </div>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-2 text-[#666] hover:text-[#06110D] hover:bg-[#F0EFED] rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 bg-white space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Consultation Title</label>
                  <input 
                    type="text" 
                    value={editingItem.title} 
                    onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                    required 
                    className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Date</label>
                    <input 
                      type="text" 
                      value={editingItem.date} 
                      onChange={e => setEditingItem({...editingItem, date: e.target.value})}
                      required 
                      className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Time</label>
                    <input 
                      type="text" 
                      value={editingItem.time} 
                      onChange={e => setEditingItem({...editingItem, time: e.target.value})}
                      required 
                      className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                    />
                  </div>
                </div>
                
                <div className="pt-6 flex items-center justify-between">
                  <button 
                    type="button"
                    onClick={(e) => handleDelete(e, editingItem.id)}
                    className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-sm font-semibold"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 text-[#666] hover:bg-[#F0EFED] rounded-xl transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D2D2D] transition-colors"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#06110D]">Consultations</h1>
          <p className="text-[#666] text-sm">Manage your scheduled meetings and book new ones.</p>
        </div>
        <button onClick={() => setIsBooking(true)} className="bg-[#10B981] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2D2D2D] transition-colors">
          Book Consultation
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#A7F3D0] bg-[#FAFAFA]">
          <h2 className="text-base font-semibold text-[#06110D]">Upcoming Consultations</h2>
        </div>
        <div className="divide-y divide-[#A7F3D0]">
          {upcoming.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setEditingItem(item)}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FFFFFF] transition-colors cursor-pointer group"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#06110D] mb-1 group-hover:text-[#10B981] transition-colors">{item.title}</h3>
                <p className="text-sm text-[#666]">With: {item.with}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className="flex flex-col gap-1.5 text-sm text-[#4A4A4A]">
                  <span className="flex items-center gap-2"><CalendarIcon size={16} className="text-[#10B981]" /> {item.date}</span>
                  <span className="flex items-center gap-2"><Clock size={16} className="text-[#10B981]" /> {item.time}</span>
                </div>
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 hidden sm:block">
                  {item.status}
                </span>
                <button 
                  onClick={(e) => handleJoinCall(e, item.title)}
                  className="text-sm font-semibold text-[#06110D] border border-[#A7F3D0] px-4 py-2 rounded-xl hover:bg-[#F0EFED] bg-white transition-colors flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare size={16} /> Join Chat
                </button>
              </div>
            </div>
          ))}
          {upcoming.length === 0 && (
            <div className="p-8 text-center text-[#666] text-sm">
              No upcoming consultations found.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#A7F3D0] bg-[#FAFAFA]">
          <h2 className="text-base font-semibold text-[#06110D]">Previous Consultations</h2>
        </div>
        <div className="divide-y divide-[#A7F3D0]">
          {past.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FCFBF9] transition-colors">
              <div>
                <h3 className="text-base font-semibold text-[#4A4A4A] mb-1">{item.title}</h3>
                <p className="text-sm text-[#A0A0A0]">With: {item.with}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1.5 text-sm text-[#A0A0A0]">
                  <span className="flex items-center gap-2"><CalendarIcon size={16} /> {item.date}</span>
                  <span className="flex items-center gap-2"><Clock size={16} /> {item.time}</span>
                </div>
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-[#F0EFED] text-[#666] border border-[#A7F3D0] hidden sm:block">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
