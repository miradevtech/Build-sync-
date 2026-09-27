import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, ChevronRight, FileText, MessageSquare, ArrowLeft, Plus, Edit3, Trash2, X, Save, FolderOpen } from 'lucide-react';

const INITIAL_CLIENT_PROJECTS: any[] = [];

export default function Projects({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_client_projects');
      return saved ? JSON.parse(saved) : INITIAL_CLIENT_PROJECTS;
    } catch {
      return INITIAL_CLIENT_PROJECTS;
    }
  });

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      if (editingProject.id) {
        // Edit existing
        setProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
        if (selectedProject && selectedProject.id === editingProject.id) {
          setSelectedProject(editingProject);
        }
      } else {
        // Create new
        const newProj = {
          ...editingProject,
          id: Date.now(),
          progress: 0,
          updates: []
        };
        const updated = [newProj, ...projects];
        setProjects(updated);
        try { localStorage.setItem('buildsync_client_projects', JSON.stringify(updated)); } catch {}
      }
      setEditingProject(null);
      setIsCreating(false);
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    try { localStorage.setItem('buildsync_client_projects', JSON.stringify(updated)); } catch {}
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject(null);
    }
    setEditingProject(null);
  };

  if (selectedProject) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <button 
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-[#666] hover:text-[#06110D] transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium text-sm">Back to Projects</span>
        </button>

        <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#A7F3D0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-[#06110D]">{selectedProject.name}</h1>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {selectedProject.status}
                </span>
              </div>
              <p className="text-[#666] flex items-center gap-1.5 text-sm">
                <MapPin size={16} /> {selectedProject.location}
              </p>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('messages')}
              className="bg-[#10B981] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D2D2D] transition-colors whitespace-nowrap"
            >
              Message Team
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#A7F3D0]">
            <div className="p-6">
              <h3 className="text-sm font-medium text-[#666] mb-4 uppercase tracking-wider">Progress Tracker</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-[#06110D]">{selectedProject.progress}%</span>
                <span className="text-sm text-[#666] mb-1">Completed</span>
              </div>
              <div className="w-full bg-[#F0EFED] rounded-full h-2 overflow-hidden">
                <div className="bg-[#10B981] h-2 rounded-full" style={{ width: `${selectedProject.progress}%` }} />
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-sm font-medium text-[#666] mb-4 uppercase tracking-wider">Project Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666] flex items-center gap-2"><Calendar size={16} /> Start Date</span>
                  <span className="font-medium text-[#06110D]">{selectedProject.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666] flex items-center gap-2"><Clock size={16} /> Est. Completion</span>
                  <span className="font-medium text-[#06110D]">{selectedProject.endDate}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-medium text-[#666] mb-4 uppercase tracking-wider">Team</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#A7F3D0] overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Pro" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#06110D]">{selectedProject.assignedPro}</p>
                  <p className="text-xs text-[#666]">Primary Contact</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#06110D] mb-4">Construction Updates</h2>
            <div className="space-y-6">
              {selectedProject.updates.map((update: any, idx: number) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#10B981]" />
                  {idx !== selectedProject.updates.length - 1 && (
                    <div className="absolute left-[3px] top-4 bottom-[-24px] w-[2px] bg-[#F0EFED]" />
                  )}
                  <p className="text-xs font-semibold text-[#A0A0A0] mb-1">{update.date}</p>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed">{update.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#06110D]">Recent Documents</h2>
              <button onClick={() => onNavigate && onNavigate('documents')} className="text-sm text-[#10B981] font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} onClick={() => onNavigate && onNavigate('documents')} className="flex items-center justify-between p-3 rounded-xl border border-[#A7F3D0] hover:bg-[#FFFFFF] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F0EFED] flex items-center justify-center text-[#666]">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#06110D]">Site_Plan_v2.pdf</p>
                      <p className="text-xs text-[#666]">Added 2 days ago</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#A0A0A0]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Edit/Create Project Modal */}
      <AnimatePresence>
        {(isCreating || editingProject) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#10B981]/60 backdrop-blur-sm"
              onClick={() => { setIsCreating(false); setEditingProject(null); }}
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
                    <h3 className="text-sm font-semibold text-[#06110D]">{isCreating ? 'Create Personal Project' : 'Edit Project'}</h3>
                  </div>
                </div>
                <button onClick={() => { setIsCreating(false); setEditingProject(null); }} className="p-2 text-[#666] hover:text-[#06110D] hover:bg-[#F0EFED] rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSaveProject} className="p-6 bg-white space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Project Name</label>
                  <input 
                    type="text" 
                    value={editingProject?.name || ''} 
                    onChange={e => setEditingProject({...editingProject, name: e.target.value})}
                    required 
                    className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Project Type</label>
                  <input 
                    type="text" 
                    value={editingProject?.type || ''} 
                    onChange={e => setEditingProject({...editingProject, type: e.target.value})}
                    required 
                    className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={editingProject?.location || ''} 
                    onChange={e => setEditingProject({...editingProject, location: e.target.value})}
                    required 
                    className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Start Date</label>
                    <input 
                      type="text" 
                      value={editingProject?.startDate || ''} 
                      onChange={e => setEditingProject({...editingProject, startDate: e.target.value})}
                      required 
                      className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">End Date</label>
                    <input 
                      type="text" 
                      value={editingProject?.endDate || ''} 
                      onChange={e => setEditingProject({...editingProject, endDate: e.target.value})}
                      required 
                      className="w-full px-3 py-2 border border-[#A7F3D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-[#FCFBF9]" 
                    />
                  </div>
                </div>
                
                <div className="pt-6 flex items-center justify-between">
                  {!isCreating ? (
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteProject(e, editingProject.id)}
                      className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-sm font-semibold"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => { setIsCreating(false); setEditingProject(null); }}
                      className="px-4 py-2 text-[#666] hover:bg-[#F0EFED] rounded-xl transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D2D2D] transition-colors"
                    >
                      <Save size={16} /> {isCreating ? 'Create' : 'Save Changes'}
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
          <h1 className="text-2xl font-semibold text-[#06110D]">My Projects</h1>
          <p className="text-[#666] text-sm">Overview of your active and past construction projects.</p>
        </div>
        <button onClick={() => { setEditingProject({ status: 'Planning', assignedPro: 'Self-Managed' }); setIsCreating(true); }} className="bg-[#10B981] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2D2D2D] transition-colors flex items-center gap-2">
          <Plus size={16} /> Create Personal Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#A7F3D0] p-10 sm:p-14 text-center shadow-sm max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FolderOpen size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#06110D] mb-2">No Active Projects Yet</h3>
          <p className="text-sm text-[#666] leading-relaxed mb-6">
            You don't have any ongoing projects yet. When you kick off a project with BuildSync, all milestone tracking, city permits, and structural engineering updates will show up here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => { setEditingProject({ status: 'Planning', assignedPro: 'BuildSync Design Team' }); setIsCreating(true); }}
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus size={16} /> Create Personal Project
            </button>
            <button
              onClick={() => onNavigate && onNavigate('consultations')}
              className="w-full sm:w-auto border border-[#A7F3D0] hover:bg-[#F0EFED] text-[#06110D] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Book Discovery Session
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-[#A7F3D0] shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md group relative"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingProject(project); }} 
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur border border-[#A7F3D0] text-[#666] hover:text-[#06110D] hover:bg-[#F0EFED] rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                title="Edit Project"
              >
                <Edit3 size={16} />
              </button>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4 pr-8">
                  <div>
                    <h2 className="text-xl font-semibold text-[#06110D] group-hover:text-[#10B981] transition-colors">{project.name}</h2>
                    <p className="text-sm text-[#666] mt-1">{project.type}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap ${
                    project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-sm text-[#4A4A4A]">
                  <p className="flex items-center gap-2"><MapPin size={16} className="text-[#A0A0A0]" /> {project.location}</p>
                  <p className="flex items-center gap-2"><Calendar size={16} className="text-[#A0A0A0]" /> {project.startDate} — {project.endDate}</p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-[#06110D]">Progress</span>
                    <span className="text-[#666]">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-[#F0EFED] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#10B981] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-[#FFFFFF] px-6 py-3 border-t border-[#A7F3D0] flex justify-between items-center">
                <span className="text-sm text-[#666]">Click to view details</span>
                <ChevronRight size={18} className="text-[#A0A0A0] group-hover:text-[#10B981] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
