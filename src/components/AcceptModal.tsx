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

interface AcceptModalProps {
  application: Application | null;
  adminEmail: string;
  onClose: () => void;
  onSuccess: (updatedApp: Application) => void;
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
      const response = await fetch('/api/applications/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      onSuccess(data.application);
    } catch (err: any) {
      setError(err.message || 'Error executing acceptance.');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Accept Application</h3>
              <p className="text-xs text-slate-400">Generate offer letter & notify candidate</p>
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
            <span className="text-blue-400 font-semibold">{application.role}</span>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Duration Selection (Strictly 1, 2, or 3 months) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Internship Duration <span className="text-emerald-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1 month', '2 months', '3 months'] as InternshipDuration[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    duration === d
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Joining Date Selection */}
          <div>
            <label htmlFor="joiningDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Expected Joining Date <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                id="joiningDate"
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Workflow Notice */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
            <FileCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Acceptance will generate a vector PDF offer letter featuring Company Tech branding, your configured duration, joining date, and the signature block "HR Support and Co-Founder". The PDF will be emailed to the candidate.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
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
