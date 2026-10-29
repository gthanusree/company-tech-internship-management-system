import React, { useState } from 'react';
import { Application } from '../types/index.ts';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Search, 
  Mail, 
  ArrowRight, 
  Building2 
} from 'lucide-react';

interface ConfirmationModalProps {
  application: Application | null;
  onClose: () => void;
  onTrackStatus: (appId: string, email: string) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  application,
  onClose,
  onTrackStatus,
}) => {
  const [copied, setCopied] = useState(false);

  if (!application) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(application.applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl shadow-blue-500/10 text-white relative">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Submission Confirmed
          </span>
          <h3 className="text-2xl font-bold text-white mt-3">
            Application Submitted!
          </h3>
          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
            Thank you, <span className="font-semibold text-white">{application.fullName}</span>. Your application for <span className="text-blue-400 font-semibold">{application.role}</span> has been stored in Cloud Firestore.
          </p>
        </div>

        {/* Application ID Card */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-blue-500/30 text-center">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Your Unique Application ID
          </p>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-400 tracking-wide">
              {application.applicationId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy ID to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Save this ID. You will need it together with your email to track your application status.
          </p>
        </div>

        {/* Audit Details */}
        <div className="mt-5 space-y-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex justify-between">
            <span className="text-slate-500">Applicant:</span>
            <span className="font-medium text-white">{application.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email:</span>
            <span className="font-mono text-white">{application.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">College:</span>
            <span className="text-white">{application.college}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Initial Status:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {application.status}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email Delivery:</span>
            </span>
            <span className="text-emerald-400 font-medium">
              {application.emailStatus || 'Applicant Confirmation Dispatched'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onTrackStatus(application.applicationId, application.email)}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Track Application</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
