import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, HardHat, Calendar, Users, 
  FileText, DollarSign, Activity, SlidersHorizontal, 
  LogOut, Bell, Menu, X, ArrowLeft, ExternalLink,
  ShieldCheck, Sparkles, Check, CheckCircle2, ChevronRight,
  Search, RefreshCw
} from 'lucide-react';

// Admin Sub-components
import AdminDashboardHome from './components/app/admin/AdminDashboardHome';
import AdminProjectsManager from './components/app/admin/AdminProjectsManager';
import AdminConsultationsManager from './components/app/admin/AdminConsultationsManager';
import AdminTeamAndClients from './components/app/admin/AdminTeamAndClients';
import AdminDocumentsManager from './components/app/admin/AdminDocumentsManager';
import AdminFinancials from './components/app/admin/AdminFinancials';
import AdminActivityLogs from './components/app/admin/AdminActivityLogs';
import AdminSettings from './components/app/admin/AdminSettings';

import { fbSignOut, auth as fbAuth } from './lib/firebase';

// Types & Initial Data
import { 
  AdminProject, AdminConsultation, AdminUser, 
  AdminDocument, AdminInvoice, AdminActivityLog 
} from './types';
import { 
  INITIAL_ADMIN_PROJECTS, 
  INITIAL_ADMIN_CONSULTATIONS, 
  INITIAL_ADMIN_USERS, 
  INITIAL_ADMIN_DOCUMENTS, 
  INITIAL_ADMIN_INVOICES, 
  INITIAL_ADMIN_ACTIVITY_LOGS 
} from './data/adminMockData';

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<string>('admin-overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Persistent live admin state with localStorage support
  const [projects, setProjects] = useState<AdminProject[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_admin_projects');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_PROJECTS;
    } catch {
      return INITIAL_ADMIN_PROJECTS;
    }
  });

  const [consultations, setConsultations] = useState<AdminConsultation[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_admin_consultations');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_CONSULTATIONS;
    } catch {
      return INITIAL_ADMIN_CONSULTATIONS;
    }
  });

  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_admin_users');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
    } catch {
      return INITIAL_ADMIN_USERS;
    }
  });

  const [documents, setDocuments] = useState<AdminDocument[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_admin_documents');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_DOCUMENTS;
    } catch {
      return INITIAL_ADMIN_DOCUMENTS;
    }
  });

  const [invoices, setInvoices] = useState<AdminInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_admin_invoices');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_INVOICES;
    } catch {
      return INITIAL_ADMIN_INVOICES;
    }
  });

  const [logs, setLogs] = useState<AdminActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('buildsync_admin_logs');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ADMIN_ACTIVITY_LOGS;
    }
  });

  // Save to localStorage when modified
  useEffect(() => {
    try {
      localStorage.setItem('buildsync_admin_projects', JSON.stringify(projects));
      localStorage.setItem('buildsync_admin_consultations', JSON.stringify(consultations));
      localStorage.setItem('buildsync_admin_users', JSON.stringify(users));
      localStorage.setItem('buildsync_admin_documents', JSON.stringify(documents));
      localStorage.setItem('buildsync_admin_invoices', JSON.stringify(invoices));
      localStorage.setItem('buildsync_admin_logs', JSON.stringify(logs));
    } catch {
      // ignore storage quota errors
    }
  }, [projects, consultations, users, documents, invoices, logs]);

  const logActivity = (action: string, target: string, category: AdminActivityLog['category']) => {
    const newLog: AdminActivityLog = {
      id: `LOG-${Date.now()}`,
      user: 'Marcus Vance',
      role: 'General Contractor',
      action,
      target,
      timestamp: 'Just now',
      category
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const navItems = [
    { id: 'admin-overview', icon: LayoutDashboard, label: 'Overview', badge: undefined },
    { id: 'admin-projects', icon: HardHat, label: 'Project Master', badge: `${projects.length}` },
    { id: 'admin-consultations', icon: Calendar, label: 'Client Queue', badge: `${consultations.filter(c => c.status === 'Pending').length}` },
    { id: 'admin-team', icon: Users, label: 'Team & Clients', badge: `${users.length}` },
    { id: 'admin-documents', icon: FileText, label: 'Permits & Plans', badge: `${documents.filter(d => d.status === 'Under Review').length}` },
    { id: 'admin-financials', icon: DollarSign, label: 'Invoices & Ledger', badge: `${invoices.filter(i => i.status === 'Pending').length}` },
    { id: 'admin-logs', icon: Activity, label: 'Operations Logs', badge: undefined },
    { id: 'admin-settings', icon: SlidersHorizontal, label: 'Console Config', badge: undefined },
  ];

  // Projects Handlers
  const handleAddProject = (project: AdminProject) => {
    setProjects(prev => [project, ...prev]);
    logActivity('Created new master project', project.title, 'project');
  };

  const handleUpdateProject = (project: AdminProject) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    logActivity('Updated project specs & milestone progress', project.title, 'project');
  };

  const handleDeleteProject = (id: string) => {
    const p = projects.find(x => x.id === id);
    setProjects(prev => prev.filter(x => x.id !== id));
    logActivity('Archived project from master ledger', p?.title || id, 'project');
  };

  // Consultations Handlers
  const handleAddConsultation = (item: AdminConsultation) => {
    setConsultations(prev => [item, ...prev]);
    logActivity('Booked discovery consultation', `${item.clientName} (${item.projectType})`, 'consultation');
  };

  const handleUpdateConsultation = (item: AdminConsultation) => {
    setConsultations(prev => prev.map(c => c.id === item.id ? item : c));
    logActivity('Updated consultation booking status', `${item.clientName} -> ${item.status}`, 'consultation');
  };

  const handleDeleteConsultation = (id: string) => {
    setConsultations(prev => prev.filter(c => c.id !== id));
    logActivity('Cancelled consultation session', id, 'consultation');
  };

  // Team & Clients Handlers
  const handleAddUser = (user: AdminUser) => {
    setUsers(prev => [user, ...prev]);
    logActivity('Registered user account', `${user.name} (${user.role})`, 'project');
  };

  const handleUpdateUser = (user: AdminUser) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    logActivity('Modified user role & clearances', user.name, 'project');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    logActivity('Removed user account', userId, 'project');
  };

  // Documents Handlers
  const handleAddDocument = (doc: AdminDocument) => {
    setDocuments(prev => [doc, ...prev]);
    logActivity('Uploaded CAD / Permit document', doc.title, 'document');
  };

  const handleUpdateDocument = (doc: AdminDocument) => {
    setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    logActivity(`Status set to ${doc.status}`, doc.title, 'document');
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    logActivity('Deleted document revision', docId, 'document');
  };

  // Financials Handlers
  const handleAddInvoice = (inv: AdminInvoice) => {
    setInvoices(prev => [inv, ...prev]);
    logActivity('Generated progress invoice', `${inv.invoiceNumber} ($${inv.amount.toLocaleString()})`, 'finance');
  };

  const handleUpdateInvoice = (inv: AdminInvoice) => {
    setInvoices(prev => prev.map(i => i.id === inv.id ? inv : i));
    logActivity(`Marked invoice ${inv.status}`, inv.invoiceNumber, 'finance');
  };

  const handleDeleteInvoice = (invId: string) => {
    setInvoices(prev => prev.filter(i => i.id !== invId));
    logActivity('Voided invoice record', invId, 'finance');
  };

  const getPageHeading = () => {
    switch (activeTab) {
      case 'admin-overview': return { title: 'Executive Overview', desc: 'Real-time construction velocity, cashflow, and critical milestone approvals' };
      case 'admin-projects': return { title: 'Master Project Directory', desc: 'Centralized control for budgets, timelines, phase shifts, and trade assignments' };
      case 'admin-consultations': return { title: 'Discovery & Consultation Queue', desc: 'Manage inbound client bookings, architect assignments, and video links' };
      case 'admin-team': return { title: 'Team & Client CRM Directory', desc: 'Directory of clients, field supervisors, architects, and subcontractors' };
      case 'admin-documents': return { title: 'Permit & Blueprint Registry', desc: 'Engineering CAD approvals, municipal permits, and change order archives' };
      case 'admin-financials': return { title: 'Financial Ledger & Billing', desc: 'Milestone invoices, payment tracking, and project burn rate analysis' };
      case 'admin-logs': return { title: 'Operations Telemetry & Audit Log', desc: 'Immutable chronological activity feed and system-wide audit records' };
      case 'admin-settings': return { title: 'Executive Console Settings', desc: 'Contractor organization profile, notification rules, and system credentials' };
      default: return { title: 'Executive Console', desc: 'BuildSync Master Admin Suite' };
    }
  };

  const heading = getPageHeading();

  return (
    <div className="min-h-screen bg-[#06110D] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#10B981] selection:text-[#06110D]">
      {/* Top Universal Header */}
      <header className="sticky top-0 z-40 bg-[#081611]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] p-0.5 shadow-lg shadow-[#10B981]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#081611] rounded-[10px] flex items-center justify-center">
                <ShieldCheck size={18} className="text-[#10B981] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider uppercase text-white font-serif">BuildSync</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-white/40 tracking-wider uppercase block">Executive Console</span>
            </div>
          </a>
        </div>

        {/* Center Live Stats Badge */}
        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60">Active Sites:</span>
            <span className="font-bold text-white">{projects.filter(p => p.status === 'Active').length}</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/60">Pending Queue:</span>
            <span className="font-bold text-[#10B981]">{consultations.filter(c => c.status === 'Pending').length} bookings</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/60">Contract Value:</span>
            <span className="font-bold text-emerald-400">
              ${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Actions & External Links */}
        <div className="flex items-center gap-2.5">
          {/* Direct Link to Main Landing Page */}
          <a
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all"
            title="Return to Public Website"
          >
            <ArrowLeft size={13} />
            <span>Public Site</span>
          </a>

          {/* Direct Link to Client Portal */}
          <a
            href="/#portal"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all"
            title="Switch to Client View"
          >
            <span>Client View</span>
            <ExternalLink size={13} />
          </a>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]" />
            </button>

            {/* Notification Flyout */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0D1117] border border-white/15 shadow-2xl p-4 z-50 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">System Telemetry</span>
                    <span className="text-[11px] text-[#10B981] font-medium cursor-pointer hover:underline" onClick={() => setShowNotifications(false)}>
                      Dismiss All
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                        <div className="text-xs">
                          <p className="text-white font-medium">{log.action}</p>
                          <p className="text-white/40 text-[11px] mt-0.5">{log.target} &bull; {log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-white font-bold text-xs shadow-md">
              MV
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-white leading-tight">Marcus Vance</div>
              <div className="text-[10px] text-[#10B981] leading-tight">General Contractor</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Administrative Layout with Fixed Sidebar and Dynamic Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#081611]/70 border-r border-white/10 p-4 shrink-0">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/30 px-3 mb-2">
            Operations Console
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#10B981] to-[#047857] text-white shadow-lg shadow-[#10B981]/20 font-bold'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-white' : 'text-white/50 group-hover:text-[#10B981]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive 
                        ? 'bg-black/30 text-white' 
                        : 'bg-white/10 text-white/80 group-hover:bg-[#10B981]/20 group-hover:text-[#10B981]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Help / Quick Actions Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[#10B981]" />
              <span className="text-xs font-bold text-white">Standalone Admin</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              This console runs in dedicated HTML mode with isolated state persistence.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <a
                href="/"
                className="block py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-center text-white/80 hover:text-white transition-all"
              >
                Public Site
              </a>
              <button
                onClick={async () => {
                  try {
                    await fbSignOut(fbAuth);
                  } catch (e) {
                    // ignore
                  }
                  window.location.href = '/';
                }}
                className="flex items-center justify-center gap-1 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[11px] font-bold uppercase tracking-wider text-center text-rose-300 hover:text-rose-200 transition-all cursor-pointer"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#0D1117] border-r border-white/15 p-5 shadow-2xl flex flex-col pt-16"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/30 px-3 mb-2">
                Operations Console
              </div>

              <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#10B981] to-[#047857] text-white shadow-lg font-bold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <a
                  href="/"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Landing Page</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Subpage Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif">
                {heading.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                {heading.desc}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    window.location.reload();
                  } catch {
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                title="Reset local mock data to defaults"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Reset Mock Data</span>
              </button>
            </div>
          </div>

          {/* Active View Router */}
          <div className="transition-all duration-300">
            {activeTab === 'admin-overview' && (
              <AdminDashboardHome
                projects={projects}
                consultations={consultations}
                documents={documents}
                invoices={invoices}
                activityLogs={logs}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCreateProject={() => setActiveTab('admin-projects')}
                onOpenCreateConsultation={() => setActiveTab('admin-consultations')}
              />
            )}

            {activeTab === 'admin-projects' && (
              <AdminProjectsManager
                projects={projects}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeTab === 'admin-consultations' && (
              <AdminConsultationsManager
                consultations={consultations}
                onAddConsultation={handleAddConsultation}
                onUpdateConsultation={handleUpdateConsultation}
                onDeleteConsultation={handleDeleteConsultation}
              />
            )}

            {activeTab === 'admin-team' && (
              <AdminTeamAndClients
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activeTab === 'admin-documents' && (
              <AdminDocumentsManager
                documents={documents}
                onAddDocument={handleAddDocument}
                onUpdateDocument={handleUpdateDocument}
                onDeleteDocument={handleDeleteDocument}
              />
            )}

            {activeTab === 'admin-financials' && (
              <AdminFinancials
                invoices={invoices}
                projects={projects}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
              />
            )}

            {activeTab === 'admin-logs' && (
              <AdminActivityLogs logs={logs} />
            )}

            {activeTab === 'admin-settings' && (
              <AdminSettings />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
