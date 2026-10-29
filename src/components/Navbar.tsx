import React from 'react';
import { 
  Building2, 
  Search, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase,
  FileCheck,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  activeView: 'home' | 'apply' | 'track' | 'admin';
  setActiveView: (view: 'home' | 'apply' | 'track' | 'admin') => void;
  onOpenChecklist: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenChecklist,
  isAdminLoggedIn,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveView('home')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  Company Tech
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  Internships
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Application & Management Automation System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeView === 'home'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Roles</span>
              </span>
            </button>

            <button
              onClick={() => setActiveView('apply')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeView === 'apply'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Apply</span>
              </span>
            </button>

            <button
              onClick={() => setActiveView('track')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeView === 'track'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Track Status</span>
              </span>
            </button>

            <button
              onClick={onOpenChecklist}
              className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/20 transition-colors hidden md:flex items-center gap-1.5"
              title="View the 20-Point E2E Verification Checklist"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>E2E Test Checklist</span>
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Admin Portal</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
