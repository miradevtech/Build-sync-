import React, { useState, useRef } from 'react';
import { Send, Paperclip, Search, MoreVertical, ArrowLeft, X, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const DEFAULT_CHAT_HISTORIES: Record<number, any[]> = {
  1: [
    { id: 1, sender: 'BuildSync Concierge', isMe: false, text: 'Welcome to BuildSync! Your designated project coordinator is Marcus Vance. Feel free to leave questions or milestone notes here.', time: '10:00 AM' }
  ]
};

export default function Messages({ userName }: { userName?: string }) {
  const [message, setMessage] = useState('');
  const [activeConvId, setActiveConvId] = useState<number | null>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations] = useState([
    { id: 1, name: 'BuildSync Support & Engineering', role: 'Support Team', avatar: null, lastMessage: 'Welcome to BuildSync! Let us know if you need any help.', time: '10:00 AM', unread: false }
  ]);

  const [chatHistories, setChatHistories] = useState<Record<number, any[]>>(DEFAULT_CHAT_HISTORIES);

  const activeConv = activeConvId ? conversations.find(c => c.id === activeConvId) : null;
  const activeHistory = activeConvId ? (chatHistories[activeConvId] || []) : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConvId) return;

    const newMessage = {
      id: Date.now(),
      sender: userName || 'Client',
      isMe: true,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistories(prev => ({
      ...prev,
      [activeConvId]: [...prev[activeConvId], newMessage]
    }));
    setMessage('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeConvId) {
      const isImage = file.type.startsWith('image/');
      const fileUrl = isImage ? URL.createObjectURL(file) : null;
      
      const newMessage = {
        id: Date.now(),
        sender: userName || 'Client',
        isMe: true,
        text: `📎 Attached: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileUrl: fileUrl
      };
      setChatHistories(prev => ({
        ...prev,
        [activeConvId]: [...prev[activeConvId], newMessage]
      }));
    }
  };

  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden h-[calc(100vh-140px)] flex relative">
      
      {/* Modals */}
      <AnimatePresence>
        {viewingImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#10B981]/90 backdrop-blur-sm"
              onClick={() => setViewingImage(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
            >
              <button 
                onClick={() => setViewingImage(null)} 
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors pointer-events-auto bg-black/20 rounded-full"
              >
                <X size={24} />
              </button>
              <img src={viewingImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto" />
            </motion.div>
          </div>
        )}

        {showProfileInfo && activeConv && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#10B981]/60 backdrop-blur-sm"
              onClick={() => setShowProfileInfo(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#A7F3D0] bg-[#FAFAFA]">
                <h3 className="text-sm font-semibold text-[#06110D]">Contact Info</h3>
                <button onClick={() => setShowProfileInfo(false)} className="p-2 text-[#666] hover:text-[#06110D] hover:bg-[#A7F3D0] rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center text-center">
                <img src={activeConv.avatar} alt={activeConv.name} className="w-24 h-24 rounded-full object-cover shadow-sm mb-4" />
                <h2 className="text-xl font-bold text-[#06110D]">{activeConv.name}</h2>
                <p className="text-sm text-[#10B981] font-medium mt-1">{activeConv.role}</p>
              </div>
              <div className="px-6 pb-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA] border border-[#A7F3D0]">
                  <Mail size={18} className="text-[#A0A0A0]" />
                  <span className="text-sm text-[#4A4A4A]">{activeConv.name.toLowerCase().replace(' ', '.')}@buildsync.com</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA] border border-[#A7F3D0]">
                  <Phone size={18} className="text-[#A0A0A0]" />
                  <span className="text-sm text-[#4A4A4A]">+1 (555) 123-4567</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar: Conversation List */}
      <div className={`${activeConvId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 md:min-w-[320px] border-r border-[#A7F3D0] flex-col bg-[#FAFAFA] h-full`}>
        <div className="p-4 border-b border-[#A7F3D0]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#A7F3D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => setActiveConvId(conv.id)}
              className={`p-4 flex gap-3 cursor-pointer border-b border-[#F0EFED] transition-colors ${activeConvId === conv.id ? 'bg-[#F0EFED]' : conv.unread ? 'bg-white' : 'hover:bg-[#FFFFFF]'}`}
            >
              <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className={`text-sm truncate ${conv.unread || activeConvId === conv.id ? 'font-semibold text-[#06110D]' : 'font-medium text-[#4A4A4A]'}`}>{conv.name}</h4>
                  <span className={`text-[10px] whitespace-nowrap ${conv.unread ? 'text-[#10B981] font-bold' : 'text-[#A0A0A0]'}`}>{conv.time}</span>
                </div>
                <p className={`text-xs truncate ${conv.unread ? 'text-[#06110D] font-medium' : 'text-[#666]'}`}>{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!activeConvId ? 'hidden md:flex items-center justify-center' : 'flex'} flex-1 flex-col bg-white h-full w-full md:w-2/3`}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 md:px-6 border-b border-[#A7F3D0] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#FFFFFF] p-1.5 -ml-1.5 rounded-xl transition-colors" onClick={() => setShowProfileInfo(true)}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveConvId(null); }}
                  className="md:hidden p-2 -ml-2 mr-1 text-[#666] hover:text-[#06110D] hover:bg-transparent"
                >
                  <ArrowLeft size={20} />
                </button>
                <img src={activeConv.avatar} alt={activeConv.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-semibold text-[#06110D]">{activeConv.name}</h3>
                  <p className="text-[10px] text-[#666]">{activeConv.role}</p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)} className="p-2 text-[#A0A0A0] hover:text-[#06110D] hover:bg-[#FFFFFF] rounded-xl transition-colors">
                  <MoreVertical size={20} />
                </button>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#A7F3D0] rounded-xl shadow-lg py-1 z-20">
                      <button onClick={() => { setShowDropdown(false); setShowProfileInfo(true); }} className="w-full text-left px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#FFFFFF]">View Profile</button>
                      <button onClick={() => { setShowDropdown(false); alert('Search in conversation'); }} className="w-full text-left px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#FFFFFF]">Search</button>
                      <div className="h-px bg-[#A7F3D0] my-1" />
                      <button onClick={() => { setShowDropdown(false); alert('Conversation muted'); }} className="w-full text-left px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#FFFFFF]">Mute Notifications</button>
                      <button onClick={() => { setShowDropdown(false); alert('Chat cleared'); }} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">Clear Chat</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#A0A0A0] bg-[#FFFFFF] px-3 py-1 rounded-full">Conversation Started</span>
              </div>
              
              {activeHistory.map((msg) => {
                const isImageAttached = msg.text.startsWith('📎 Attached: ') && msg.text.match(/\.(jpeg|jpg|gif|png)$/i);
                return (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                    {!msg.isMe && <img src={activeConv.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mb-1" />}
                    <div className={`p-3.5 rounded-2xl text-sm ${msg.isMe ? 'bg-[#10B981] text-white rounded-br-sm' : 'bg-[#F4F3F0] text-[#2D2D2D] rounded-bl-sm border border-[#A7F3D0]'}`}>
                      {msg.fileUrl ? (
                        <div className="flex flex-col gap-2 cursor-pointer" onClick={() => setViewingImage(msg.fileUrl)}>
                           <span>{msg.text}</span>
                           <img src={msg.fileUrl} alt="Attached" className="max-w-full h-auto max-h-48 rounded-lg object-contain bg-white/10" />
                        </div>
                      ) : isImageAttached ? (
                        <div className="flex flex-col gap-2 cursor-pointer" onClick={() => alert(`Viewing image: ${msg.text.replace('📎 Attached: ', '')}`)}>
                           <span>{msg.text}</span>
                           <div className="w-48 h-32 bg-gray-200/20 rounded-lg overflow-hidden flex items-center justify-center">
                             <span className="text-xs text-center px-2 opacity-60">Image Preview<br/>{msg.text.replace('📎 Attached: ', '')}</span>
                           </div>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#A0A0A0] mt-1.5 px-8">{msg.time}</span>
                </div>
              )})}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-[#A7F3D0] bg-[#FAFAFA] pb-8 md:pb-4">
              <div className="flex items-end gap-2 md:gap-3">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-[#A0A0A0] hover:text-[#06110D] transition-colors shrink-0 bg-white border border-[#A7F3D0] rounded-xl hover:bg-[#FFFFFF]"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 h-[44px] bg-white border border-[#A7F3D0] rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
                <button type="submit" className="p-2.5 bg-[#10B981] text-white rounded-xl hover:bg-[#059669] transition-colors shrink-0 shadow-sm">
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center text-center p-8 h-full bg-[#FAFAFA]">
            <div className="w-16 h-16 rounded-full bg-[#F0EFED] flex items-center justify-center mb-4 text-[#A0A0A0]">
              <MoreVertical size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#06110D] mb-2">Your Messages</h3>
            <p className="text-sm text-[#666] max-w-[260px]">Select a conversation from the sidebar to view history or start a new chat.</p>
          </div>
        )}
      </div>

    </div>
  );
}
