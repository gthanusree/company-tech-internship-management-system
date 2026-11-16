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
      <div className="max-w-md w-full bg-white border border-[#E4E6E2] rounded-2xl p-6 sm:p-8 shadow-sm relative">
        {/* Card Header */}
        <div className="text-center mb-6 relative">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EEF5F2] border border-[#C8DDD7] flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-[#2F6B60]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1F1D] tracking-tight">
            Security & Access Gateway
          </h2>
          <p className="text-xs text-[#6E7571] mt-1.5">
            Select your role to access Company Tech admissions & evaluation tools.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F3F4F1] border border-[#E4E6E2] mb-6">
          <button
            onClick={() => {
              setActiveTab('admin');
              setAuthError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-[#1C1F1D] shadow-xs border border-[#E4E6E2]'
                : 'text-[#6E7571] hover:text-[#1C1F1D]'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-[#2F6B60]' : ''}`} />
            <span>Administrator</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('applicant');
              setAuthError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'applicant'
                ? 'bg-white text-[#1C1F1D] shadow-xs border border-[#E4E6E2]'
                : 'text-[#6E7571] hover:text-[#1C1F1D]'
            }`}
          >
            <UserCheck className={`w-3.5 h-3.5 ${activeTab === 'applicant' ? 'text-[#2F6B60]' : ''}`} />
            <span>Applicant Portal</span>
          </button>
        </div>

        {/* Tab 1: Administrator Authentication */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2] text-xs text-[#4B524E]">
              <div className="flex items-center gap-2 text-[#23534A] font-semibold mb-1">
                <KeyRound className="w-3.5 h-3.5 text-[#2F6B60]" />
                <span>Authorized Admissions Authority</span>
              </div>
              <p className="text-[#4B524E] text-[11px] leading-relaxed">
                Admissions dashboard enables reviewing candidates, accepting with duration & joining dates, generating official offer-letter PDFs, and sending decision emails.
              </p>
              <p className="text-[10px] text-[#6E7571] font-mono mt-2 pt-2 border-t border-[#E4E6E2]">
                Authorized Admin: <span className="text-[#1C1F1D] font-medium">gthanushree1566@gmail.com</span>
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google OAuth Login */}
            <button
              onClick={handleGoogleAdminLogin}
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2F6B60] hover:bg-[#24554C] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAuthenticating ? 'Authenticating...' : 'Sign In with Google (Admin)'}</span>
            </button>

            {/* Fast Evaluator Mode */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E4E6E2]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-[#6E7571] tracking-wider">
                Or For Fast Evaluation
              </span>
              <div className="flex-grow border-t border-[#E4E6E2]" />
            </div>

            <button
              onClick={handleEvaluatorAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F8F9F7] hover:bg-[#EEF5F2] text-[#1C1F1D] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#D6D9D3] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Enter Admin Portal (Evaluator Access)</span>
            </button>
          </div>
        )}

        {/* Tab 2: Candidate / Applicant Options */}
        {activeTab === 'applicant' && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2] text-xs text-[#4B524E]">
              <div className="flex items-center gap-2 text-[#23534A] font-semibold mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#2F6B60]" />
                <span>Talent Admissions Portal</span>
              </div>
              <p className="text-[#4B524E] text-[11px] leading-relaxed">
                Review 12 open internship tracks across Engineering, AI, Design, and Marketing, or check status on an existing application.
              </p>
            </div>

            <button
              onClick={onApplicantAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2F6B60] hover:bg-[#24554C] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Explore Roles & Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTrackStatusAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F8F9F7] hover:bg-[#EEF5F2] text-[#1C1F1D] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#D6D9D3] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#2F6B60]" />
              <span>Track Existing Application (2FA)</span>
            </button>
          </div>
        )}

        {/* Footer info in Card */}
        <div className="mt-6 pt-4 border-t border-[#E4E6E2] text-center flex items-center justify-between text-[11px]">
          <span className="text-[#6E7571]">256-Bit SSL Encrypted</span>
          <button
            onClick={onOpenChecklist}
            className="text-[#23534A] hover:text-[#2F6B60] font-medium flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B60]" />
            <span>20-Point Checklist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
