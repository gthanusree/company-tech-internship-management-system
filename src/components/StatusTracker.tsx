import React, { useState, useEffect } from 'react';
import { Application } from '../types/index.ts';
import { downloadOfferLetterPdf } from '../lib/offerLetterGenerator.ts';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  FileText, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Building2,
  Calendar,
  Eye
} from 'lucide-react';

interface StatusTrackerProps {
  initialAppId?: string;
  initialEmail?: string;
  onViewOfferLetter?: (app: Application) => void;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  initialAppId = '',
  initialEmail = '',
  onViewOfferLetter,
}) => {
  const [applicationId, setApplicationId] = useState(initialAppId);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  // If initial credentials provided, auto-search
  useEffect(() => {
    if (initialAppId && initialEmail) {
      setApplicationId(initialAppId);
      setEmail(initialEmail);
      handleSearch(initialAppId, initialEmail);
    }
  }, [initialAppId, initialEmail]);

  const handleSearch = async (appIdToSearch = applicationId, emailToSearch = email) => {
    if (!appIdToSearch.trim() || !emailToSearch.trim()) {
      setError('Please enter both your Application ID and your registered email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApplication(null);

    try {
      const response = await fetch('/api/verify-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appIdToSearch.trim(),
          email: emailToSearch.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to locate application.');
      }

      setApplication(data.application);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accepted</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <XCircle className="w-3.5 h-3.5" />
            <span>Application Concluded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <section id="status-tracker-section" className="py-16 md:py-20 bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Candidate Verification
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Track Application Status
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            To safeguard applicant confidentiality, access requires both your unique Application ID and your registered email address.
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-4"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Application ID
              </label>
              <input
                type="text"
                placeholder="e.g. CT-2026-XXXXX"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Card */}
        {application && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">
                    {application.fullName}
                  </h3>
                  {getStatusBadge(application.status)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Position: <span className="text-white font-medium">{application.role} Intern</span> • Institution: <span className="text-white font-medium">{application.college}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Application Reference:</span>
                <span className="font-mono text-sm font-bold text-blue-400">
                  {application.applicationId}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-8">
              <div className="grid grid-cols-3 gap-2 relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-1/6 right-1/6 h-0.5 bg-slate-800 -z-0" />

                {/* Step 1: Submitted */}
                <div className="text-center relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-2 font-bold shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  </div>
                  <span className="text-xs font-semibold text-white block">Submitted</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Step 2: Under Review */}
                <div className="text-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-bold ${
                    application.status === 'Pending'
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse'
                      : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {application.status === 'Pending' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white block">Mentorship Review</span>
                  <span className="text-[10px] text-slate-400">
                    {application.status === 'Pending' ? 'In Progress' : 'Completed'}
                  </span>
                </div>

                {/* Step 3: Decision */}
                <div className="text-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-bold ${
                    application.status === 'Accepted'
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                      : application.status === 'Rejected'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-800 text-slate-600 border border-slate-700'
                  }`}>
                    {application.status === 'Accepted' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : application.status === 'Rejected' ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white block">Decision</span>
                  <span className="text-[10px] text-slate-400">
                    {application.decisionAt 
                      ? new Date(application.decisionAt).toLocaleDateString()
                      : 'Awaiting decision'}
                  </span>
                </div>
              </div>
            </div>

            {/* Outcome Details & Actions */}
            {application.status === 'Accepted' && (
              <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-emerald-300">
                      Offer Extended! Congratulations! 🎉
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Company Tech is pleased to extend an internship offer for the <span className="font-semibold text-white">{application.role}</span> track.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 p-3.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Duration:</span>
                        <span className="font-bold text-white">{application.internshipDuration}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Joining Date:</span>
                        <span className="font-bold text-white">{application.joiningDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Verification Ref:</span>
                        <span className="font-mono text-emerald-400">{application.offerLetterId || 'CT-VERIFIED'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => downloadOfferLetterPdf(application)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Official Offer Letter (PDF)</span>
                      </button>

                      {onViewOfferLetter && (
                        <button
                          onClick={() => onViewOfferLetter(application)}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center gap-2 border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>View Offer Document</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {application.status === 'Rejected' && (
              <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Review Concluded for this Cycle
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Thank you for your interest in Company Tech. While we could not offer you a position in this particular cohort due to high application volume, we strongly encourage you to reapply during our subsequent internship cycles.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      An official outcome confirmation has also been dispatched to your email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {application.status === 'Pending' && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-500/20 text-xs text-slate-300">
                <p className="font-semibold text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Evaluation in Progress</span>
                </p>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  Your application is currently active and queued for mentor evaluation. As soon as an admissions officer records an official decision, you will receive an automated notification and your offer letter will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
