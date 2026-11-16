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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E6E2] text-[#1C1F1D] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button 
            onClick={() => setActiveView('home')} 
            className="flex items-center space-x-3 cursor-pointer group text-left focus:outline-none"
            title="Go to Company Tech Home"
          >
            <div className="w-9 h-9 rounded-lg bg-[#2F6B60] flex items-center justify-center shadow-xs group-hover:bg-[#24554C] transition-colors shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#1C1F1D] group-hover:text-[#2F6B60] transition-colors">
                  Company Tech
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#EEF5F2] text-[#23534A] border border-[#C8DDD7] rounded-md hidden sm:inline-block">
                  Internships
                </span>
              </div>
              <p className="text-[11px] text-[#6E7571] hidden md:block">
                Application & Management Automation System
              </p>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1">
            {/* 1. Roles Tab */}
            <button
              onClick={() => setActiveView('home')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeView === 'home'
                  ? 'bg-[#2F6B60] text-white font-semibold shadow-xs'
                  : 'text-[#4B524E] hover:text-[#1C1F1D] hover:bg-[#F3F4F1]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Roles</span>
            </button>

            {/* 2. Apply Tab */}
            <button
              onClick={() => setActiveView('apply')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeView === 'apply'
                  ? 'bg-[#2F6B60] text-white font-semibold shadow-xs'
                  : 'text-[#4B524E] hover:text-[#1C1F1D] hover:bg-[#F3F4F1]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>

            {/* 3. Track Status Tab */}
            <button
              onClick={() => setActiveView('track')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeView === 'track'
                  ? 'bg-[#2F6B60] text-white font-semibold shadow-xs'
                  : 'text-[#4B524E] hover:text-[#1C1F1D] hover:bg-[#F3F4F1]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Status</span>
            </button>

            {/* 4. Admin Portal Tab */}
            <button
              onClick={() => setActiveView('admin')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-[#2F6B60] text-white font-semibold shadow-xs'
                  : 'bg-[#F3F4F1] text-[#1C1F1D] hover:bg-[#EAECE7] border border-[#E4E6E2]'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeView === 'admin' ? 'text-white' : 'text-[#2F6B60]'}`} />
              <span>Admin</span>
              {isAdminLoggedIn && (
                <span className={`w-2 h-2 rounded-full ml-0.5 ${activeView === 'admin' ? 'bg-emerald-200' : 'bg-emerald-600'}`} />
              )}
            </button>

            {/* 5. Security Gateway / Sign-In Tab */}
            <button
              onClick={() => setActiveView('auth')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeView === 'auth'
                  ? 'bg-[#2F6B60] text-white font-semibold shadow-xs'
                  : 'text-[#4B524E] hover:text-[#1C1F1D] hover:bg-[#F3F4F1]'
              }`}
              title="Security Gateway & Role Sign-In"
            >
              <KeyRound className={`w-3.5 h-3.5 ${activeView === 'auth' ? 'text-white' : 'text-[#2F6B60]'}`} />
              <span>Sign In</span>
            </button>

            <div className="h-5 w-px bg-[#E4E6E2] mx-1 hidden lg:block" />

            {/* 6. 20-Point E2E Checklist Modal Button */}
            <button
              onClick={onOpenChecklist}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#23534A] bg-[#EEF5F2] hover:bg-[#E1EEE9] border border-[#C8DDD7] transition-colors hidden lg:flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Open the 20-Point Verification Checklist"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B60]" />
              <span>E2E Checklist</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
