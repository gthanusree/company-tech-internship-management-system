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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/45 backdrop-blur-[2px]">
      <div className="bg-white border border-[#E4E6E2] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl text-[#1C1F1D] relative">
        {/* Success Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
            Submission Confirmed
          </span>
          <h3 className="text-2xl font-bold text-[#1C1F1D] mt-3">
            Application Submitted!
          </h3>
          <p className="text-sm text-[#4B524E] mt-1.5 leading-relaxed">
            Thank you, <span className="font-semibold text-[#1C1F1D]">{application.fullName}</span>. Your application for <span className="text-[#23534A] font-semibold">{application.role}</span> has been stored in Cloud Firestore.
          </p>
        </div>

        {/* Application ID Card */}
        <div className="mt-6 p-4 rounded-xl bg-[#EEF5F2] border border-[#C8DDD7] text-center">
          <p className="text-xs uppercase tracking-wider text-[#23534A] font-semibold">
            Your Unique Application ID
          </p>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#1C1F1D] tracking-wide">
              {application.applicationId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-lg bg-white hover:bg-[#F3F4F1] text-[#4B524E] hover:text-[#1C1F1D] border border-[#C8DDD7] transition-colors cursor-pointer"
              title="Copy ID to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-[#4B524E] mt-1.5">
            Save this ID. You will need it together with your email to track your application status.
          </p>
        </div>

        {/* Audit Details */}
        <div className="mt-5 space-y-2 text-xs text-[#4B524E] bg-[#F8F9F7] p-4 rounded-xl border border-[#E4E6E2]">
          <div className="flex justify-between">
            <span className="text-[#6E7571]">Applicant:</span>
            <span className="font-medium text-[#1C1F1D]">{application.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E7571]">Email:</span>
            <span className="font-mono text-[#1C1F1D]">{application.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E7571]">College:</span>
            <span className="text-[#1C1F1D]">{application.college}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E7571]">Initial Status:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {application.status}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-[#E4E6E2] text-[11px]">
            <span className="text-[#6E7571] flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#2F6B60]" />
              <span>Email Delivery:</span>
            </span>
            <span className="text-emerald-700 font-medium">
              {application.emailStatus || 'Applicant Confirmation Dispatched'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onTrackStatus(application.applicationId, application.email)}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#2F6B60] hover:bg-[#24554C] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Track Application</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#F3F4F1] hover:bg-[#E4E6E2] text-[#1C1F1D] border border-[#D6D9D3] font-medium text-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
