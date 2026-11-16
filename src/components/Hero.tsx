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
    <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24 bg-[#FAFAF8] text-[#1C1F1D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#EEF5F2] border border-[#C8DDD7] text-[#23534A] text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-[#2F6B60]" />
            <span>Applications Open for 2026 Internship Cohorts</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C1F1D] leading-tight">
            Launch Your Career With{' '}
            <span className="text-[#2F6B60]">
              Company Tech
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-[#4B524E] leading-relaxed max-w-2xl mx-auto">
            Experience real-world software engineering, product design, and growth marketing.
            Submit your application with instant Firestore tracking and automated offer-letter dispatch.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onApplyClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-[#2F6B60] hover:bg-[#24554C] shadow-sm transition-colors flex items-center justify-center gap-2 text-base group cursor-pointer"
            >
              <span>Apply for Internship</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onTrackClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-[#1C1F1D] bg-white hover:bg-[#F3F4F1] border border-[#D6D9D3] shadow-xs transition-colors flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <span>Track Application Status</span>
            </button>

            <button
              onClick={onExploreRoles}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-medium text-[#4B524E] hover:text-[#2F6B60] transition-colors text-sm cursor-pointer"
            >
              View 12 Open Roles ↓
            </button>
          </div>
        </div>

        {/* Feature Grid / Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-5 rounded-xl bg-white border border-[#E4E6E2] shadow-xs text-left">
            <div className="w-9 h-9 rounded-lg bg-[#EEF5F2] text-[#2F6B60] border border-[#C8DDD7] flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1F1D]">12 Dedicated Tracks</h4>
            <p className="text-xs text-[#6E7571] mt-1 leading-relaxed">
              Frontend, Backend, AI/ML, Design, Marketing & HR.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E4E6E2] shadow-xs text-left">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1F1D]">1, 2, or 3 Months</h4>
            <p className="text-xs text-[#6E7571] mt-1 leading-relaxed">
              Flexible durations with custom mentor-set joining dates.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E4E6E2] shadow-xs text-left">
            <div className="w-9 h-9 rounded-lg bg-[#EEF5F2] text-[#2F6B60] border border-[#C8DDD7] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1F1D]">Verified Offer Letters</h4>
            <p className="text-xs text-[#6E7571] mt-1 leading-relaxed">
              Automated high-resolution PDF generation with digital seal.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E4E6E2] shadow-xs text-left">
            <div className="w-9 h-9 rounded-lg bg-[#F3F4F1] text-[#4B524E] border border-[#E4E6E2] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1F1D]">Secure Firestore Data</h4>
            <p className="text-xs text-[#6E7571] mt-1 leading-relaxed">
              Real persistence, atomic state locking & transactional emails.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
