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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accepted</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Application Concluded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <section id="status-tracker-section" className="py-16 md:py-20 bg-[#FAFAF8] text-[#1C1F1D]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#23534A] bg-[#EEF5F2] px-3 py-1 rounded-md border border-[#C8DDD7]">
            Candidate Verification
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1F1D] mt-3 tracking-tight">
            Track Application Status
          </h2>
          <p className="text-[#4B524E] text-sm mt-2 max-w-lg mx-auto">
            To safeguard applicant confidentiality, access requires both your unique Application ID and your registered email address.
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="bg-white border border-[#E4E6E2] rounded-2xl p-6 shadow-sm mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-4"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase text-[#4B524E] mb-1.5">
                Application ID
              </label>
              <input
                type="text"
                placeholder="e.g. CT-2026-XXXXX"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D6D9D3] text-sm font-mono text-[#1C1F1D] placeholder-[#8A918D] focus:outline-none focus:ring-2 focus:ring-[#2F6B60]/20 focus:border-[#2F6B60] uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase text-[#4B524E] mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D6D9D3] text-sm text-[#1C1F1D] placeholder-[#8A918D] focus:outline-none focus:ring-2 focus:ring-[#2F6B60]/20 focus:border-[#2F6B60]"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2F6B60] hover:bg-[#24554C] disabled:bg-[#D6D9D3] disabled:text-[#6E7571] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Card */}
        {application && (
          <div className="bg-white border border-[#E4E6E2] rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E4E6E2] gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-[#1C1F1D]">
                    {application.fullName}
                  </h3>
                  {getStatusBadge(application.status)}
                </div>
                <p className="text-xs text-[#4B524E] mt-1">
                  Position: <span className="text-[#1C1F1D] font-semibold">{application.role} Intern</span> • Institution: <span className="text-[#1C1F1D] font-semibold">{application.college}</span>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-[#6E7571] block">Application Reference:</span>
                <span className="font-mono text-sm font-bold text-[#23534A] bg-[#EEF5F2] border border-[#C8DDD7] px-2.5 py-0.5 rounded-md inline-block mt-0.5">
                  {application.applicationId}
                </span>
              </div>
            </div>

            {/* Visual Application Progress Timeline */}
            {(() => {
              const isAccepted = application.status === 'Accepted';
              const isRejected = application.status === 'Rejected';
              const isPending = application.status === 'Pending';

              type TimelineStep = {
                key: string;
                title: string;
                subtitle: string;
                detail: string;
                state: 'completed' | 'active' | 'rejected' | 'upcoming';
                icon: React.ReactNode;
              };

              const timelineSteps: TimelineStep[] = [
                {
                  key: 'submitted',
                  title: 'Application Submitted',
                  subtitle: new Date(application.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                  detail: `Ref: ${application.applicationId}`,
                  state: 'completed',
                  icon: <CheckCircle2 className="w-4 h-4" />,
                },
                {
                  key: 'review',
                  title: 'Under Review',
                  subtitle: isPending ? 'In Progress' : 'Completed',
                  detail: isPending
                    ? 'Mentor evaluation active'
                    : 'Admissions review finished',
                  state: isPending ? 'active' : 'completed',
                  icon: isPending ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />,
                },
                {
                  key: 'decision',
                  title: isAccepted
                    ? 'Accepted'
                    : isRejected
                    ? 'Rejected'
                    : 'Accepted or Rejected',
                  subtitle: isPending
                    ? 'Awaiting Decision'
                    : application.decisionAt
                    ? new Date(application.decisionAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : isAccepted
                    ? 'Approved'
                    : 'Concluded',
                  detail: isAccepted
                    ? `Role: ${application.role}`
                    : isRejected
                    ? 'Not selected for this cohort'
                    : 'Pending admissions outcome',
                  state: isAccepted ? 'completed' : isRejected ? 'rejected' : 'upcoming',
                  icon: isAccepted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isRejected ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  ),
                },
              ];

              if (isAccepted) {
                timelineSteps.push({
                  key: 'offer',
                  title: 'Offer Letter Generated',
                  subtitle: application.offerLetterId ? 'PDF Ready' : 'Generated',
                  detail: application.offerLetterId || 'Official PDF issued',
                  state: 'completed',
                  icon: <FileText className="w-4 h-4" />,
                });
              }

              const getNodeClasses = (state: TimelineStep['state']) => {
                switch (state) {
                  case 'completed':
                    return 'bg-emerald-600 text-white ring-4 ring-emerald-50 shadow-xs';
                  case 'active':
                    return 'bg-amber-500 text-white ring-4 ring-amber-50 shadow-xs';
                  case 'rejected':
                    return 'bg-red-50 text-red-700 border border-red-300 ring-4 ring-red-50/70';
                  default:
                    return 'bg-[#F3F4F1] text-[#8A918D] border border-[#D6D9D3]';
                }
              };

              const getLineColor = (leftState: TimelineStep['state'], rightState: TimelineStep['state']) => {
                if (leftState === 'completed' && rightState === 'completed') return 'bg-emerald-500';
                if (leftState === 'completed' && rightState === 'active') return 'bg-amber-400';
                if (leftState === 'completed' && rightState === 'rejected') return 'bg-red-300';
                return 'bg-[#E4E6E2]';
              };

              const getStatusBadgeClasses = (state: TimelineStep['state']) => {
                switch (state) {
                  case 'completed':
                    return 'text-emerald-800 bg-emerald-50 border-emerald-200';
                  case 'active':
                    return 'text-amber-800 bg-amber-50 border-amber-200';
                  case 'rejected':
                    return 'text-red-700 bg-red-50 border-red-200';
                  default:
                    return 'text-[#6E7571] bg-[#F8F9F7] border-[#E4E6E2]';
                }
              };

              return (
                <div className="py-7">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#4B524E]">
                      Application Progress Timeline
                    </span>
                    <span className="text-[11px] font-mono text-[#6E7571]">
                      {isAccepted ? '4 of 4 Milestones' : isRejected ? '3 of 3 Milestones' : 'Step 2 of 3 Active'}
                    </span>
                  </div>

                  {/* Desktop Horizontal Timeline */}
                  <div className={`hidden sm:grid ${isAccepted ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                    {timelineSteps.map((step, idx) => {
                      const prevStep = idx > 0 ? timelineSteps[idx - 1] : null;
                      const nextStep = idx < timelineSteps.length - 1 ? timelineSteps[idx + 1] : null;
                      return (
                        <div key={step.key} className="relative flex flex-col items-center text-center px-2">
                          {/* Left connector half */}
                          {prevStep && (
                            <div
                              className={`absolute top-4 left-0 w-1/2 h-0.5 ${getLineColor(prevStep.state, step.state)}`}
                            />
                          )}
                          {/* Right connector half */}
                          {nextStep && (
                            <div
                              className={`absolute top-4 right-0 w-1/2 h-0.5 ${getLineColor(step.state, nextStep.state)}`}
                            />
                          )}

                          {/* Step Circle */}
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2.5 transition-colors ${getNodeClasses(
                              step.state
                            )}`}
                          >
                            {step.icon}
                          </div>

                          {/* Step Title & Metadata */}
                          <span
                            className={`text-xs font-bold leading-snug ${
                              step.state === 'upcoming' ? 'text-[#6E7571]' : 'text-[#1C1F1D]'
                            }`}
                          >
                            {step.title}
                          </span>
                          <span
                            className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClasses(
                              step.state
                            )}`}
                          >
                            {step.subtitle}
                          </span>
                          <span className="text-[10px] text-[#6E7571] mt-1 leading-tight">
                            {step.detail}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Vertical Timeline */}
                  <div className="sm:hidden space-y-0">
                    {timelineSteps.map((step, idx) => {
                      const nextStep = idx < timelineSteps.length - 1 ? timelineSteps[idx + 1] : null;
                      return (
                        <div key={step.key} className="relative flex items-start gap-3.5 pb-5 last:pb-0">
                          {nextStep && (
                            <div
                              className={`absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 ${getLineColor(
                                step.state,
                                nextStep.state
                              )}`}
                            />
                          )}
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${getNodeClasses(
                              step.state
                            )}`}
                          >
                            {step.icon}
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  step.state === 'upcoming' ? 'text-[#6E7571]' : 'text-[#1C1F1D]'
                                }`}
                              >
                                {step.title}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClasses(
                                  step.state
                                )}`}
                              >
                                {step.subtitle}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#4B524E] mt-0.5">{step.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Outcome Details & Actions */}
            {application.status === 'Accepted' && (
              <div className="mt-4 p-5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-emerald-900">
                      Offer Extended — Congratulations!
                    </h4>
                    <p className="text-xs text-[#4B524E] mt-1 leading-relaxed">
                      Company Tech is pleased to extend an internship offer for the <span className="font-semibold text-[#1C1F1D]">{application.role}</span> track.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 p-3.5 rounded-lg bg-white border border-emerald-200 text-xs">
                      <div>
                        <span className="text-[#6E7571] block text-[11px]">Duration:</span>
                        <span className="font-bold text-[#1C1F1D]">{application.internshipDuration}</span>
                      </div>
                      <div>
                        <span className="text-[#6E7571] block text-[11px]">Joining Date:</span>
                        <span className="font-bold text-[#1C1F1D]">{application.joiningDate}</span>
                      </div>
                      <div>
                        <span className="text-[#6E7571] block text-[11px]">Verification Ref:</span>
                        <span className="font-mono font-semibold text-emerald-800">{application.offerLetterId || 'CT-VERIFIED'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => downloadOfferLetterPdf(application)}
                        className="px-4 py-2 rounded-lg bg-[#2F6B60] hover:bg-[#24554C] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Official Offer Letter (PDF)</span>
                      </button>

                      {onViewOfferLetter && (
                        <button
                          onClick={() => onViewOfferLetter(application)}
                          className="px-4 py-2 rounded-lg bg-white hover:bg-[#F3F4F1] text-[#1C1F1D] font-medium text-xs transition-colors flex items-center gap-2 border border-[#D6D9D3] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2F6B60]" />
                          <span>View Offer Document</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {application.status === 'Rejected' && (
              <div className="mt-4 p-5 rounded-xl bg-red-50/50 border border-red-200">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#1C1F1D]">
                      Review Concluded for this Cycle
                    </h4>
                    <p className="text-xs text-[#4B524E] mt-1 leading-relaxed">
                      Thank you for your interest in Company Tech. While we could not offer you a position in this particular cohort due to high application volume, we strongly encourage you to reapply during our subsequent internship cycles.
                    </p>
                    <p className="text-[11px] text-[#6E7571] mt-2">
                      An official outcome confirmation has also been dispatched to your email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {application.status === 'Pending' && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-[#4B524E]">
                <p className="font-semibold text-amber-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Evaluation in Progress</span>
                </p>
                <p className="mt-1 text-[#4B524E] leading-relaxed">
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
