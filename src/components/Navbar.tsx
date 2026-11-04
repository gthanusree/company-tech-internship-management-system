import React from 'react';
import { 
  Building2, 
  Search, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  activeView: 'home' | 'apply' | 'track' | 'admin' | 'auth';
  setActiveView: (view: 'home' | 'apply' | 'track' | 'admin' | 'auth') => void;
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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button 
            onClick={() => setActiveView('home')} 
            className="flex items-center space-x-3 cursor-pointer group text-left focus:outline-none"
            title="Go to Company Tech Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  Company Tech
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full hidden sm:inline-block">
                  Internships
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Application & Management Automation System
              </p>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1">
            {/* 1. Roles Tab */}
            <button
              onClick={() => setActiveView('home')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === 'home'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Roles</span>
            </button>

            {/* 2. Apply Tab */}
            <button
              onClick={() => setActiveView('apply')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === 'apply'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>

            {/* 3. Track Status Tab */}
            <button
              onClick={() => setActiveView('track')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === 'track'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Status</span>
            </button>

            {/* 4. Admin Portal Tab */}
            <button
              onClick={() => setActiveView('admin')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* 5. Security Gateway / Sign-In Tab */}
            <button
              onClick={() => setActiveView('auth')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeView === 'auth'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Security Gateway & Role Sign-In"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sign In</span>
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1 hidden lg:block" />

            {/* 6. 20-Point E2E Checklist Modal Button */}
            <button
              onClick={onOpenChecklist}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/20 transition-colors hidden lg:flex items-center gap-1.5 shrink-0"
              title="Open the 20-Point Verification Checklist"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>E2E Checklist</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
