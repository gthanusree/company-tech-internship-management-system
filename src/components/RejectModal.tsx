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

interface RejectModalProps {
  application: Application | null;
  adminEmail: string;
  onClose: () => void;
  onSuccess: (updatedApp: Application) => void;
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
      const response = await fetch('/api/applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.applicationId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject application.');
      }

      onSuccess(data.application);
    } catch (err: any) {
      setError(err.message || 'Error executing rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Reject Application</h3>
              <p className="text-xs text-slate-400">Update status & dispatch outcome email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Info Box */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-slate-500">Applicant:</span>
            <span className="font-bold text-white">{application.fullName}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-500">Role:</span>
            <span className="text-slate-300">{application.role}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-500">Institution:</span>
            <span className="text-slate-300">{application.college}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Application ID:</span>
            <span className="font-mono text-slate-300">{application.applicationId}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Rejection Template Preview & Transparency Note */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Configured Rejection Email Notification</span>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            The candidate will receive the configured Company Tech rejection template. The email thanks the candidate, informs them that this cohort was exceptionally competitive, and invites them to apply in future cycles.
          </p>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10.5px] text-slate-400 italic">
            "{DEMO_REJECTION_TEMPLATE.notice}"
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
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
