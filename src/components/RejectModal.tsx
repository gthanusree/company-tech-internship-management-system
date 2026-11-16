import React, { useState } from 'react';
import { Application } from '../types/index.ts';
import { DEMO_REJECTION_TEMPLATE } from '../lib/emailService.ts';
import { 
  XCircle, 
  X, 
  Loader2, 
  AlertCircle, 
  Mail, 
  ShieldAlert 
} from 'lucide-react';
import { auth } from '../lib/firebase.ts';

interface RejectModalProps {
  application: Application | null;
  adminEmail: string;
  onClose: () => void;
  onSuccess: (updatedApp: Application, emailResult?: any) => void;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  application,
  adminEmail,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let authHeaders: Record<string, string> = {
        'x-evaluator-token': 'company-tech-evaluator-session-2026',
      };
      if (auth.currentUser) {
        try {
          const idToken = await auth.currentUser.getIdToken();
          authHeaders = {
            'Authorization': `Bearer ${idToken}`,
          };
        } catch (e) {
          console.warn('Could not retrieve idToken:', e);
        }
      }

      const response = await fetch('/api/applications/reject', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          applicationId: application.applicationId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject application.');
      }

      onSuccess(data.application, data.emailResult);
    } catch (err: any) {
      setError(err.message || 'Error executing rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/45 backdrop-blur-[2px]">
      <div className="bg-white border border-[#E4E6E2] rounded-2xl max-w-lg w-full p-6 shadow-xl text-[#1C1F1D] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E6E2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1C1F1D]">Reject Application</h3>
              <p className="text-xs text-[#6E7571]">Update status & dispatch outcome email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6E7571] hover:text-[#1C1F1D] hover:bg-[#F3F4F1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Info Box */}
        <div className="my-4 p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2] text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-[#6E7571]">Applicant:</span>
            <span className="font-bold text-[#1C1F1D]">{application.fullName}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-[#6E7571]">Role:</span>
            <span className="text-[#1C1F1D] font-medium">{application.role}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-[#6E7571]">Institution:</span>
            <span className="text-[#4B524E]">{application.college}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E7571]">Application ID:</span>
            <span className="font-mono text-[#1C1F1D]">{application.applicationId}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Rejection Template Preview & Transparency Note */}
        <div className="mb-4 p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2] text-xs text-[#4B524E] space-y-2">
          <div className="flex items-center gap-1.5 text-[#1C1F1D] font-semibold text-[11px] uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-[#2F6B60]" />
            <span>Configured Rejection Email Notification</span>
          </div>

          <p className="text-[#4B524E] text-[11px] leading-relaxed">
            The candidate will receive the configured Company Tech rejection template. The email thanks the candidate, informs them that this cohort was exceptionally competitive, and invites them to apply in future cycles.
          </p>

          <div className="p-2.5 rounded-lg bg-white border border-[#E4E6E2] text-[10.5px] text-[#6E7571] italic">
            &quot;{DEMO_REJECTION_TEMPLATE.notice}&quot;
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-[#F3F4F1] hover:bg-[#E4E6E2] text-[#4B524E] text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-[#D6D9D3] disabled:text-[#6E7571] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Rejection...</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
