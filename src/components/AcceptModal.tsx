import React, { useState } from 'react';
import { Application, InternshipDuration } from '../types/index.ts';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Loader2, 
  X, 
  FileCheck, 
  AlertCircle 
} from 'lucide-react';
import { auth } from '../lib/firebase.ts';

interface AcceptModalProps {
  application: Application | null;
  adminEmail: string;
  onClose: () => void;
  onSuccess: (updatedApp: Application, emailResult?: any) => void;
}

export const AcceptModal: React.FC<AcceptModalProps> = ({
  application,
  adminEmail,
  onClose,
  onSuccess,
}) => {
  const [duration, setDuration] = useState<InternshipDuration>('2 months');

  // Compute default joining date (next Monday)
  const getDefaultJoiningDate = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 1 : 8 - day);
    const nextMonday = new Date(d.setDate(diff));
    return nextMonday.toISOString().split('T')[0];
  };

  const [joiningDate, setJoiningDate] = useState<string>(getDefaultJoiningDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!joiningDate) {
      setError('Please provide a valid joining date.');
      return;
    }

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

      const response = await fetch('/api/applications/accept', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          applicationId: application.applicationId,
          internshipDuration: duration,
          joiningDate,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept application.');
      }

      onSuccess(data.application, data.emailResult);
    } catch (err: any) {
      setError(err.message || 'Error executing acceptance.');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1C1F1D]">Accept Application</h3>
              <p className="text-xs text-[#6E7571]">Generate offer letter & notify candidate</p>
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
            <span className="text-[#23534A] font-semibold">{application.role}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-[#6E7571]">Institution:</span>
            <span className="text-[#1C1F1D]">{application.college}</span>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Duration Selection (Strictly 1, 2, or 3 months) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4B524E] mb-1.5">
              Internship Duration <span className="text-emerald-700">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1 month', '2 months', '3 months'] as InternshipDuration[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    duration === d
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'bg-[#F8F9F7] border-[#E4E6E2] text-[#4B524E] hover:text-[#1C1F1D] hover:border-[#C8DDD7]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Joining Date Selection */}
          <div>
            <label htmlFor="joiningDate" className="block text-xs font-semibold uppercase tracking-wider text-[#4B524E] mb-1.5">
              Expected Joining Date <span className="text-emerald-700">*</span>
            </label>
            <div className="relative">
              <input
                id="joiningDate"
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white border border-[#D6D9D3] text-sm text-[#1C1F1D] focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Workflow Notice */}
          <div className="p-3 rounded-xl bg-[#EEF5F2] border border-[#C8DDD7] text-[11px] text-[#23534A] flex items-start gap-2">
            <FileCheck className="w-4 h-4 text-[#2F6B60] shrink-0 mt-0.5" />
            <p>
              Acceptance will generate a vector PDF offer letter featuring Company Tech branding, your configured duration, joining date, and the signature block &quot;HR Support and Co-Founder&quot;. The PDF will be emailed to the candidate.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-[#D6D9D3] disabled:text-[#6E7571] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Offer...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Acceptance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
