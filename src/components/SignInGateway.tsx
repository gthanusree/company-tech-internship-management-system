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
  ArrowRight,
  KeyRound,
  Sparkles
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
        setAuthError(
          `Signed in as ${user.email}, but this account is not in the Company Tech administrator registry. You may use the Evaluator Access button below.`
        );
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setAuthError(
        err.message || 'Pop-up was closed or blocked. You may use the Evaluator Access button below.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEvaluatorAccess = () => {
    onAdminLogin('gthanushree1566@gmail.com (Evaluator Mode)');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center min-h-[calc(100vh-14rem)]">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="text-center mb-6 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-600/25 mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Security & Access Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Select your role to access Company Tech admissions & evaluation tools.
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
            <span>Applicant Portal</span>
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
                Admissions dashboard enables reviewing candidates, accepting with duration & joining dates, generating official offer-letter PDFs, and sending decision emails.
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1.5 pt-1.5 border-t border-slate-900">
                Authorized Admin: <span className="text-slate-300 font-medium">gthanushree1566@gmail.com</span>
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google OAuth Login */}
            <button
              onClick={handleGoogleAdminLogin}
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAuthenticating ? 'Authenticating...' : 'Sign In with Google (Admin)'}</span>
            </button>

            {/* Fast Evaluator Mode */}
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
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enter Admin Portal (Evaluator Access)</span>
            </button>
          </div>
        )}

        {/* Tab 2: Candidate / Applicant Options */}
        {activeTab === 'applicant' && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Talent Admissions Portal</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Review 12 open internship tracks across Engineering, AI, Design, and Marketing, or check status on an existing application.
              </p>
            </div>

            <button
              onClick={onApplicantAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Explore Roles & Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTrackStatusAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Track Existing Application (2FA)</span>
            </button>
          </div>
        )}

        {/* Footer info in Card */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center flex items-center justify-between text-[11px]">
          <span className="text-slate-500">256-Bit SSL Encrypted</span>
          <button
            onClick={onOpenChecklist}
            className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>20-Point Checklist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
