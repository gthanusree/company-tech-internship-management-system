import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Award, 
  Users, 
  FileText, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

interface HeroProps {
  onApplyClick: () => void;
  onTrackClick: () => void;
  onExploreRoles: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onApplyClick,
  onTrackClick,
  onExploreRoles,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Applications Open for 2026 Internship Cohorts</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Launch Your Career With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Company Tech
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Experience real-world software engineering, product design, and growth marketing.
            Submit your application with instant Firestore tracking and automated offer-letter dispatch.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onApplyClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-base group"
            >
              <span>Apply for Internship</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onTrackClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <span>Track Application Status</span>
            </button>

            <button
              onClick={onExploreRoles}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-medium text-slate-400 hover:text-white transition-colors text-sm"
            >
              View 12 Open Roles ↓
            </button>
          </div>
        </div>

        {/* Feature Grid / Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-white">12 Dedicated Tracks</h4>
            <p className="text-xs text-slate-400 mt-1">
              Frontend, Backend, AI/ML, Design, Marketing & HR.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-white">1, 2, or 3 Months</h4>
            <p className="text-xs text-slate-400 mt-1">
              Flexible durations with custom mentor-set joining dates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-white">Verified Offer Letters</h4>
            <p className="text-xs text-slate-400 mt-1">
              Automated high-resolution PDF generation with digital seal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-white">Secure Firestore Data</h4>
            <p className="text-xs text-slate-400 mt-1">
              Real persistence, atomic state locking & transactional emails.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
