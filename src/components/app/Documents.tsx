import React, { useState, useRef } from 'react';
import { FileText, Download, Eye, Folder, Search, Filter, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const INITIAL_DOCS: any[] = [];

export default function Documents() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Building Plans', 'Contracts', 'Estimates', 'Permits', 'Other'];
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('Other');
  const [documents, setDocuments] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_client_docs');
      return saved ? JSON.parse(saved) : INITIAL_DOCS;
    } catch {
      return INITIAL_DOCS;
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadName(file.name);
      setUploadType('Other');
      setUploadModalOpen(true);
    }
  };

  const confirmUpload = () => {
    if (selectedFile && uploadName) {
      const newDoc = {
        id: Date.now(),
        name: uploadName,
        type: uploadType,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        size: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        url: URL.createObjectURL(selectedFile),
        isImage: selectedFile.type.startsWith('image/')
      };
      setDocuments(prev => {
        const next = [newDoc, ...prev];
        try { localStorage.setItem('buildsync_client_docs', JSON.stringify(next)); } catch {}
        return next;
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredDocs = activeCategory === 'All' ? documents : documents.filter(d => d.type === activeCategory);

  return (
    <div className="space-y-6">
      
      {/* Upload Document Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#06110D]/60 backdrop-blur-sm"
              onClick={() => setUploadModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#A7F3D0]">
                <h3 className="text-lg font-semibold text-[#06110D]">Upload Document</h3>
                <button onClick={() => setUploadModalOpen(false)} className="p-2 text-[#666] hover:text-[#06110D] hover:bg-[#F0EFED] rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Document Name</label>
                  <input 
                    type="text" 
                    value={uploadName} 
                    onChange={(e) => setUploadName(e.target.value)} 
                    className="w-full px-4 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-[#FCFBF9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Category</label>
                  <select 
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full px-4 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-[#FCFBF9]"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#A7F3D0] flex justify-end gap-3 bg-[#FAFAFA]">
                <button onClick={() => setUploadModalOpen(false)} className="px-4 py-2 border border-[#A7F3D0] text-[#4A4A4A] rounded-xl text-sm font-semibold hover:bg-[#FFFFFF] transition-colors">
                  Cancel
                </button>
                <button onClick={confirmUpload} disabled={!uploadName} className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold hover:bg-[#2D2D2D] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Save Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#10B981]/60 backdrop-blur-sm"
              onClick={() => setPreviewDoc(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute inset-0 w-full h-full bg-[#FFFFFF] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#A7F3D0] bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0EFED] flex items-center justify-center text-[#666]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#06110D] truncate max-w-[200px] sm:max-w-xs">{previewDoc.name}</h3>
                    <p className="text-xs text-[#666]">{previewDoc.size} • {previewDoc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {previewDoc.url && (
                    <a href={previewDoc.url} download={previewDoc.name} className="px-3 sm:px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#2D2D2D] transition-colors">
                      <Download size={16} /> <span className="hidden sm:inline">Download</span>
                    </a>
                  )}
                  <button onClick={() => setPreviewDoc(null)} className="p-2 text-[#666] hover:text-[#06110D] hover:bg-[#F0EFED] rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-[#F0EFED] flex items-center justify-center overflow-hidden">
                <div className="bg-white w-full h-full flex items-center justify-center overflow-hidden relative">
                  {previewDoc.url && previewDoc.isImage ? (
                    <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-full object-contain" />
                  ) : previewDoc.url ? (
                    <div className="text-center flex flex-col items-center">
                      <FileText size={64} className="mx-auto mb-4 text-[#10B981]" />
                      <p className="text-lg font-semibold text-[#06110D] mb-2">{previewDoc.name}</p>
                      <p className="text-sm text-[#666] mb-6">Document preview is not available in the embedded viewer.</p>
                      <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-[#2D2D2D] transition-colors shadow-sm">
                        Open Document in New Tab
                      </a>
                    </div>
                  ) : (
                    <div className="text-center text-[#A0A0A0]">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium">Document Preview generated for {previewDoc.name}</p>
                      <p className="text-xs mt-1">This is a secure viewer placeholder.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#06110D]">Documents</h1>
          <p className="text-[#666] text-sm">Access and manage all your project files in one place.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="pl-9 pr-4 py-2 border border-[#A7F3D0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white w-full sm:w-[200px]"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-[#A7F3D0] rounded-xl text-sm font-medium text-[#4A4A4A] hover:bg-[#FFFFFF] flex items-center gap-2">
            <Filter size={16} /> <span className="hidden sm:inline">Filter</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-[#2D2D2D] flex items-center gap-2 transition-colors"
          >
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Categories */}
        <div className="lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 lg:gap-1 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-none lg:w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all font-medium whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-[#10B981] text-white shadow-md' 
                  : 'text-[#666] bg-white lg:bg-transparent border lg:border-transparent border-[#A7F3D0] hover:bg-[#F0EFED] hover:text-[#06110D]'
              }`}
            >
              <Folder size={18} className={activeCategory === cat ? 'text-[#10B981]' : 'text-[#A0A0A0] hidden lg:block'} />
              {cat}
            </button>
          ))}
        </div>

        {/* Main List */}
        <div className="flex-1 bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden">
          <div>
            <div className="hidden sm:flex items-center px-6 py-3 bg-[#FAFAFA] border-b border-[#A7F3D0] text-xs font-semibold text-[#666] uppercase tracking-wider">
              <div className="flex-1">File Name</div>
              <div className="w-32 shrink-0">Document Type</div>
              <div className="w-48 shrink-0 text-right">Actions</div>
            </div>
            <div className="divide-y divide-[#A7F3D0]">
              {filteredDocs.map((doc) => (
                <div key={doc.id} onClick={() => setPreviewDoc(doc)} className="p-4 sm:px-6 hover:bg-[#FCFBF9] transition-colors group cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#F0EFED] flex items-center justify-center text-[#666] shrink-0 group-hover:text-[#10B981] transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#06110D] group-hover:text-[#10B981] transition-colors truncate">{doc.name}</p>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <p className="text-xs text-[#A0A0A0]">{doc.size}</p>
                        <span className="w-1 h-1 rounded-full bg-[#D5D4D0]"></span>
                        <p className="text-xs text-[#A0A0A0]">{doc.date}</p>
                        <span className="sm:hidden w-1 h-1 rounded-full bg-[#D5D4D0]"></span>
                        <span className="sm:hidden px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F0EFED] text-[#666]">{doc.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block shrink-0 w-32">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#FFFFFF] border border-[#A7F3D0] text-[#666] whitespace-nowrap">
                      {doc.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 shrink-0 sm:w-48">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-[#666] bg-white border border-[#A7F3D0] hover:text-[#06110D] hover:bg-[#F0EFED] rounded-lg transition-colors flex items-center justify-center gap-1.5" title="View">
                      <Eye size={14} /> View
                    </button>
                    {doc.url ? (
                      <a href={doc.url} download={doc.name} onClick={(e) => e.stopPropagation()} className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-white bg-[#10B981] border border-transparent hover:bg-[#2D2D2D] rounded-lg transition-colors flex items-center justify-center gap-1.5" title="Download">
                        <Download size={14} /> Download
                      </a>
                    ) : (
                      <span className="text-xs text-[#999] px-2 py-1">Uploaded</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredDocs.length === 0 && (
                <div className="p-12 text-center text-[#666] text-sm">
                  <FileText size={32} className="mx-auto mb-2 text-[#A7F3D0]" />
                  <p className="font-semibold text-[#06110D]">No documents on file yet</p>
                  <p className="text-xs text-[#777] mt-1 max-w-sm mx-auto">
                    Click "Upload" above to store architectural drawings, agreements, or permits securely.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
