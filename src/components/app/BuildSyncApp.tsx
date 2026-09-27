import { fbSignOut, auth as fbAuth } from '../../lib/firebase';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FolderOpen, Calendar, MessageSquare, 
  FileText, Settings as SettingsIcon, LogOut, Bell, Menu, X, Compass,
  ShieldCheck, UserCheck, HardHat, Users, DollarSign, Activity,
  SlidersHorizontal, RefreshCw, ArrowRightLeft, ExternalLink
, Home
} from 'lucide-react';

// Client Components
import DashboardHome from './DashboardHome';
import Projects from './Projects';
import Consultations from './Consultations';
import Messages from './Messages';
import Documents from './Documents';
import Settings from './Settings';

// Admin Components
import AdminDashboardHome from './admin/AdminDashboardHome';
import AdminProjectsManager from './admin/AdminProjectsManager';
import AdminConsultationsManager from './admin/AdminConsultationsManager';
import AdminTeamAndClients from './admin/AdminTeamAndClients';
import AdminDocumentsManager from './admin/AdminDocumentsManager';
import AdminFinancials from './admin/AdminFinancials';
import AdminActivityLogs from './admin/AdminActivityLogs';
import AdminSettings from './admin/AdminSettings';

// Types and Mock Data
import { 
  UserRole, AdminProject, AdminConsultation, 
  AdminUser, AdminDocument, AdminInvoice, AdminActivityLog 
} from '../../types';
import { 
  INITIAL_ADMIN_PROJECTS, 
  INITIAL_ADMIN_CONSULTATIONS, 
  INITIAL_ADMIN_USERS, 
  INITIAL_ADMIN_DOCUMENTS, 
  INITIAL_ADMIN_INVOICES, 
  INITIAL_ADMIN_ACTIVITY_LOGS 
} from '../../data/adminMockData';



interface BuildSyncAppProps {
  initialRole?: UserRole;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  onLogout: () => void;
  onReturnHome?: () => void;
  onUpdateProfileName?: (newName: string) => void;
}

export default function BuildSyncApp({ 
  initialRole = 'admin', 
  userName, 
  userEmail, 
  userAvatar,
  onLogout, 
  onReturnHome,
  onUpdateProfileName 
}: BuildSyncAppProps) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [profilePic, setProfilePic] = useState<string | null>(userAvatar || null);
  const [activeTab, setActiveTab] = useState<string>(initialRole === 'admin' ? 'admin-overview' : 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    if (userAvatar) {
      setProfilePic(userAvatar);
    }
  }, [userAvatar]);

  // Centralized Live Admin State
  const [adminProjects, setAdminProjects] = useState<AdminProject[]>(INITIAL_ADMIN_PROJECTS);
  const [adminConsultations, setAdminConsultations] = useState<AdminConsultation[]>(INITIAL_ADMIN_CONSULTATIONS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [adminDocuments, setAdminDocuments] = useState<AdminDocument[]>(INITIAL_ADMIN_DOCUMENTS);
  const [adminInvoices, setAdminInvoices] = useState<AdminInvoice[]>(INITIAL_ADMIN_INVOICES);
  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>(INITIAL_ADMIN_ACTIVITY_LOGS);

  // Helper to record new audit log
  const logActivity = (action: string, target: string, category: AdminActivityLog['category']) => {
    const newLog: AdminActivityLog = {
      id: `LOG-${Date.now()}`,
      user: role === 'admin' ? 'Marcus Vance' : (userName || 'Client'),
      role: role === 'admin' ? 'General Contractor' : 'Client',
      action,
      target,
      timestamp: 'Just now',
      category
    };
    setAdminLogs((prev) => [newLog, ...prev]);
  };

  // Client navigation definitions
  const clientSidebarLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: FolderOpen, label: 'My Projects' },
    { id: 'consultations', icon: Calendar, label: 'Consultations' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'settings', icon: SettingsIcon, label: 'Profile & Settings' },
  ];

  // Admin navigation definitions
  const adminSidebarLinks = [
    { id: 'admin-overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'admin-projects', icon: HardHat, label: 'Project Master' },
    { id: 'admin-consultations', icon: Calendar, label: 'Client Queue' },
    { id: 'admin-team', icon: Users, label: 'Team & Clients' },
    { id: 'admin-documents', icon: FileText, label: 'Permits & Plans' },
    { id: 'admin-financials', icon: DollarSign, label: 'Invoices & Ledger' },
    { id: 'admin-logs', icon: Activity, label: 'Operations Logs' },
    { id: 'admin-settings', icon: SlidersHorizontal, label: 'Console Config' },
  ];

  const currentSidebarLinks = role === 'admin' ? adminSidebarLinks : clientSidebarLinks;

  const handleNav = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const handleRoleToggle = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setActiveTab('admin-overview');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handlers for Admin State Mutation
  const handleAddProject = (project: AdminProject) => {
    setAdminProjects((prev) => [project, ...prev]);
    logActivity('Created new master project', project.title, 'project');
  };

  const handleUpdateProject = (project: AdminProject) => {
    setAdminProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
    logActivity('Updated project specifications & milestones', project.title, 'project');
  };

  const handleDeleteProject = (id: string) => {
    const p = adminProjects.find((x) => x.id === id);
    setAdminProjects((prev) => prev.filter((x) => x.id !== id));
    logActivity('Archived / Deleted project', p?.title || id, 'project');
  };

  const handleAddConsultation = (consultation: AdminConsultation) => {
    setAdminConsultations((prev) => [consultation, ...prev]);
    logActivity('Scheduled new discovery session', `${consultation.clientName} (${consultation.projectType})`, 'consultation');
  };

  const handleUpdateConsultation = (consultation: AdminConsultation) => {
    setAdminConsultations((prev) => prev.map((c) => (c.id === consultation.id ? consultation : c)));
    logActivity('Updated consultation status', `${consultation.clientName} -> ${consultation.status}`, 'consultation');
  };

  const handleDeleteConsultation = (id: string) => {
    setAdminConsultations((prev) => prev.filter((c) => c.id !== id));
    logActivity('Cancelled consultation booking', id, 'consultation');
  };

  const handleAddUser = (user: AdminUser) => {
    setAdminUsers((prev) => [user, ...prev]);
    logActivity('Added team/client member to directory', `${user.name} (${user.role})`, 'project');
  };

  const handleUpdateUser = (user: AdminUser) => {
    setAdminUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    logActivity('Updated profile permissions', user.name, 'project');
  };

  const handleDeleteUser = (userId: string) => {
    setAdminUsers((prev) => prev.filter((u) => u.id !== userId));
    logActivity('Removed user account', userId, 'project');
  };

  const handleAddDocument = (doc: AdminDocument) => {
    setAdminDocuments((prev) => [doc, ...prev]);
    logActivity('Uploaded document / CAD spec', doc.title, 'document');
  };

  const handleUpdateDocument = (doc: AdminDocument) => {
    setAdminDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    logActivity(`Status changed to ${doc.status}`, doc.title, 'document');
  };

  const handleDeleteDocument = (docId: string) => {
    setAdminDocuments((prev) => prev.filter((d) => d.id !== docId));
    logActivity('Removed document archive', docId, 'document');
  };

  const handleAddInvoice = (inv: AdminInvoice) => {
    setAdminInvoices((prev) => [inv, ...prev]);
    logActivity('Issued progress invoice', `${inv.invoiceNumber} ($${inv.amount.toLocaleString()})`, 'finance');
  };

  const handleUpdateInvoice = (inv: AdminInvoice) => {
    setAdminInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    logActivity(`Invoice status marked ${inv.status}`, inv.invoiceNumber, 'finance');
  };

  const handleDeleteInvoice = (invId: string) => {
    setAdminInvoices((prev) => prev.filter((i) => i.id !== invId));
    logActivity('Voided invoice record', invId, 'finance');
  };

  // Main Dynamic View Router
  const renderContent = () => {
    // Admin Views
    if (role === 'admin') {
      switch (activeTab) {
        case 'admin-overview':
          return (
            <AdminDashboardHome
              projects={adminProjects}
              consultations={adminConsultations}
              documents={adminDocuments}
              invoices={adminInvoices}
              activityLogs={adminLogs}
              onNavigateTab={handleNav}
            />
          );
        case 'admin-projects':
          return (
            <AdminProjectsManager
              projects={adminProjects}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          );
        case 'admin-consultations':
          return (
            <AdminConsultationsManager
              consultations={adminConsultations}
              onAddConsultation={handleAddConsultation}
              onUpdateConsultation={handleUpdateConsultation}
              onDeleteConsultation={handleDeleteConsultation}
            />
          );
        case 'admin-team':
          return (
            <AdminTeamAndClients
              users={adminUsers}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          );
        case 'admin-documents':
          return (
            <AdminDocumentsManager
              documents={adminDocuments}
              onAddDocument={handleAddDocument}
              onUpdateDocument={handleUpdateDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          );
        case 'admin-financials':
          return (
            <AdminFinancials
              invoices={adminInvoices}
              projects={adminProjects}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoice={handleUpdateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
            />
          );
        case 'admin-logs':
          return <AdminActivityLogs logs={adminLogs} />;
        case 'admin-settings':
          return <AdminSettings />;
        default:
          return (
            <AdminDashboardHome
              projects={adminProjects}
              consultations={adminConsultations}
              documents={adminDocuments}
              invoices={adminInvoices}
              activityLogs={adminLogs}
              onNavigateTab={handleNav}
            />
          );
      }
    }

    // Client Views
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNav} userName={userName} />;
      case 'projects':
        return <Projects onNavigate={handleNav} />;
      case 'consultations':
        return <Consultations onNavigate={handleNav} onAddConsultation={handleAddConsultation} userName={userName} userEmail={userEmail} />;

      case 'messages':
        return <Messages userName={userName} />;
      case 'documents':
        return <Documents />;
      case 'settings':
        return (
          <Settings 
            profilePic={profilePic} 
            setProfilePic={setProfilePic} 
            userName={userName} 
            userEmail={userEmail} 
            onLogout={onLogout} 
            onReturnHome={onReturnHome}
            onUpdateProfileName={onUpdateProfileName}
          />
        );
      default:
        return <DashboardHome onNavigate={handleNav} userName={userName} />;
    }
  };

  const getPageTitle = () => {
    if (role === 'admin') {
      switch (activeTab) {
        case 'admin-overview': return 'Executive Console';
        case 'admin-projects': return 'Project Master Directory';
        case 'admin-consultations': return 'Discovery & Booking Queue';
        case 'admin-team': return 'Clients & Contractor CRM';
        case 'admin-documents': return 'Permit & Plan Approval';
        case 'admin-financials': return 'Financial Ledger & Invoices';
        case 'admin-logs': return 'Operational Telemetry';
        case 'admin-settings': return 'Console Configuration';
        default: return 'Admin Console';
      }
    }
    return activeTab === 'projects' ? 'My Projects' : activeTab.replace('-', ' ');
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-[#2D2D2D] flex font-sans selection:bg-[#10B981] selection:text-white relative">
      
      {/* Desktop Floating Sidebar Pill */}
      <nav className="hidden lg:flex fixed top-6 left-6 bottom-6 w-20 hover:w-[260px] group flex-col bg-[#06110D]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 z-50 overflow-hidden ease-out">
        
        {/* Brand Header */}
        <div className="h-24 flex items-center px-[22px] shrink-0 border-b border-white/5 justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white shrink-0 shadow-lg">
              <Compass size={20} />
            </div>
            <div className="ml-4 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
              <span className="font-bold text-lg text-white tracking-tight block leading-none">BuildSync</span>
              <span className="text-[10px] text-[#10B981] uppercase tracking-wider font-mono font-bold mt-1 block">
                {role === 'admin' ? 'Admin Console' : 'Client Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {currentSidebarLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full flex items-center px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white/12 text-white shadow-sm border border-white/10' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
                title={link.label}
              >
                <div className="shrink-0 flex items-center justify-center">
                  <link.icon size={20} className={isActive ? 'text-[#10B981]' : ''} />
                </div>
                <span className="ml-4 text-xs font-semibold opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
                  {link.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Role Switcher & Logout Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {onReturnHome && (
            <button 
              onClick={onReturnHome}
              className="w-full flex items-center px-3.5 py-2.5 rounded-2xl text-white/40 hover:bg-white/5 hover:text-[#10B981] transition-all border border-transparent cursor-pointer group"
            >
              <div className="shrink-0 flex items-center justify-center">
                <Home size={18} />
              </div>
              <span className="ml-4 text-xs font-semibold opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
                Back to Website
              </span>
            </button>
          )}
          <button 
            onClick={async () => {
              try {
                await fbSignOut(fbAuth);
              } catch (e) {
                // ignore
              }
              onLogout();
            }}
            className="w-full flex items-center px-3.5 py-2.5 rounded-2xl text-white/40 hover:bg-white/5 hover:text-rose-400 transition-all border border-transparent cursor-pointer group"
          >
            <div className="shrink-0 flex items-center justify-center">
              <LogOut size={18} />
            </div>
            <span className="ml-4 text-xs font-semibold opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
              Sign Out
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Floating Bottom Nav Pill */}
      <nav className="lg:hidden fixed bottom-4 left-3 right-3 h-[70px] bg-[#06110D]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-50 flex items-center justify-between px-2">
        {currentSidebarLinks.slice(0, 5).map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all relative ${
                isActive ? 'text-[#10B981]' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <div className={`p-1.5 rounded-xl mb-0.5 transition-all ${isActive ? 'bg-[#10B981]/10 scale-105' : ''}`}>
                <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] tracking-tight font-medium transition-all truncate px-1 max-w-[60px] ${
                isActive ? 'text-[#10B981]' : 'text-white/40'
              }`}>
                {link.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden lg:pl-32 pb-24 lg:pb-0 transition-all duration-300">
        
        {/* Floating Top Header */}
        <header className="h-20 sm:h-24 flex items-center justify-between px-5 sm:px-6 lg:px-10 shrink-0 z-40 bg-[#F0FDF4]/90 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none border-b border-[#A7F3D0] lg:border-none">
          <div className="flex-1 flex items-center gap-3 sm:gap-4">
             <div className="lg:hidden w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-sm">
               <Compass size={18} />
             </div>
             <div>
               <h2 className="text-xl sm:text-2xl font-bold text-[#06110D] capitalize tracking-tight leading-tight">
                 {getPageTitle()}
               </h2>
               <p className="text-[11px] text-[#777] hidden sm:block">
                 {role === 'admin' ? 'BuildSync Admin Portal' : `Client Private Portal • ${userName || 'Client'}`}
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md border border-[#A7F3D0] shadow-sm flex items-center justify-center text-[#666] hover:text-[#06110D] transition-colors hover:bg-white cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-80 bg-white border border-[#A7F3D0] rounded-3xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#A7F3D0] bg-[#FAFAFA] flex items-center justify-between">
                      <h3 className="font-bold text-[#06110D] text-xs uppercase tracking-wider">Live Notifications</h3>
                      <span className="text-[10px] bg-[#10B981]/20 text-[#059669] font-bold px-2 py-0.5 rounded-full">
                        {role === 'admin' ? 'Admin Feed' : 'Client Feed'}
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#F0EFED] text-xs">
                      {role === 'admin' ? (
                        <>
                          <div className="p-4 hover:bg-[#FFFFFF] transition-colors">
                            <p className="font-bold text-[#06110D]">Permit Approved by City Dept</p>
                            <p className="text-[#666] mt-0.5">PERM-2026-TX884 sign-off confirmed by municipal inspector.</p>
                            <span className="text-[10px] text-[#999] mt-1 block">5 mins ago</span>
                          </div>
                          <div className="p-4 hover:bg-[#FFFFFF] transition-colors">
                            <p className="font-bold text-[#06110D]">New Consultation Booking</p>
                            <p className="text-[#666] mt-0.5">Jonathan Vance requested site survey for Austin, TX.</p>
                            <span className="text-[10px] text-[#999] mt-1 block">22 mins ago</span>
                          </div>
                          <div className="p-4 hover:bg-[#FFFFFF] transition-colors">
                            <p className="font-bold text-[#06110D]">Milestone Payment Deposited</p>
                            <p className="text-[#666] mt-0.5">Wire transfer of $85,000 received for Lakeside Modern Cabin.</p>
                            <span className="text-[10px] text-[#999] mt-1 block">1 hour ago</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 hover:bg-[#FFFFFF] transition-colors">
                            <p className="font-bold text-[#06110D]">Foundation Pour Completed</p>
                            <p className="text-[#666] mt-0.5">Site engineering team verified concrete curing test specs.</p>
                            <span className="text-[10px] text-[#999] mt-1 block">10 mins ago</span>
                          </div>
                          <div className="p-4 hover:bg-[#FFFFFF] transition-colors">
                            <p className="font-bold text-[#06110D]">Consultation Confirmed</p>
                            <p className="text-[#666] mt-0.5">Discovery & Architectural Review scheduled with Sarah Jenkins.</p>
                            <span className="text-[10px] text-[#999] mt-1 block">2 hours ago</span>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Profile Badge */}
            <div 
              onClick={() => handleNav('settings')}
              className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md pl-1.5 pr-3.5 py-1.5 rounded-2xl border border-[#A7F3D0] shadow-sm cursor-pointer hover:border-[#10B981] hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#06110D] to-[#4A4A4A] text-white flex items-center justify-center font-bold text-xs shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userName ? userName.charAt(0).toUpperCase() : 'C'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#06110D] leading-tight group-hover:text-[#10B981] transition-colors truncate max-w-[120px]">
                  {userName || 'Client'}
                </p>
                <p className="text-[10px] text-[#059669] uppercase tracking-wider font-bold">
                  {role === 'admin' ? 'Admin Account' : 'Client Account'}
                </p>
              </div>
            </div>

            {/* Quick Switch / Sign Out */}
            <button
              onClick={async () => {
                try { await fbSignOut(fbAuth); } catch {}
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#A7F3D0] bg-white/80 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 text-[#555] text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Switch account or sign out"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Switch Account</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
