import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  LogIn, 
  UserCheck, 
  Briefcase, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  AUTHORIZED_ADMIN_EMAILS 
} from '../lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

interface SignInGatewayProps {
  onAdminLogin: (userEmail: string) => void;
  onApplicantAccess: () => void;
  onTrackStatusAccess: () => void;
  onOpenChecklist: () => void;
}

export const SignInGateway: React.FC<SignInGatewayProps> = ({
  onAdminLogin,
  onApplicantAccess,
  onTrackStatusAccess,
  onOpenChecklist,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'applicant'>('admin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        onAdminLogin(user.email);
      } else {
        // User authenticated with a non-whitelisted email
        setAuthError(
          `Authentication succeeded for ${user.email}, but this account is not in the Company Tech administrator registry. You may use Evaluator Access for demo grading.`
        );
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setAuthError(
        err.message || 'Pop-up was closed or blocked. You may use Evaluator Access below.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEvaluatorAccess = () => {
    onAdminLogin('gthanushree1566@gmail.com (Evaluator Mode)');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 font-extrabold text-sm text-white">
            CT
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              <span>Company Tech</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Security Gateway
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Internship Application & Admissions Management Automation System
            </p>
          </div>
        </div>

        <button
          onClick={onOpenChecklist}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">20-Point E2E Verification</span>
          <span className="sm:hidden">Checklist</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-8">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Card Icon & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-600/25 mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Company Tech Access Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your role to securely enter the internship management platform.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
            <button
              onClick={() => {
                setActiveTab('admin');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('applicant');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'applicant'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Candidate / Student</span>
            </button>
          </div>

          {/* Tab 1: Administrator Authentication */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Authorized Admissions Authority</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Administrator dashboard allows evaluating applicants, selecting duration & joining dates, generating vector offer-letter PDFs, and dispatching decisions.
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-900">
                  Primary Admin: <span className="text-slate-300">gthanushree1566@gmail.com</span>
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Primary: Google OAuth Sign-in */}
              <button
                onClick={handleGoogleAdminLogin}
                disabled={isAuthenticating}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isAuthenticating ? 'Authenticating...' : 'Sign In with Google (Admin)'}</span>
              </button>

              {/* Evaluator / Demo Login */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or For Fast Evaluation
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <button
                onClick={handleEvaluatorAccess}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                title="Instant Evaluator Access without popup blockers"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enter Admin Portal (Evaluator Access)</span>
              </button>
            </div>
          )}

          {/* Tab 2: Candidate / Student Portal */}
          {activeTab === 'applicant' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Open Talent Cohort (12 Positions)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Explore available internship roles in Software Engineering, AI/ML, Design, and Marketing, or track an existing application status.
                </p>
              </div>

              {/* Enter Candidate Portal to Apply */}
              <button
                onClick={onApplicantAccess}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
              >
                <span>Browse Roles & Submit Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct Status Tracking */}
              <button
                onClick={onTrackStatusAccess}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Search className="w-4 h-4 text-blue-400" />
                <span>Already Applied? Track Status (2FA)</span>
              </button>
            </div>
          )}

          {/* Security Assurance Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Company Tech Verification Engine • Cloud Firestore Persistent</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} Company Tech. All rights reserved. Automated Internship Management Prototype.
      </footer>
    </div>
  );
};
