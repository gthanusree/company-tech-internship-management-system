import React from 'react';
import { Building2, ShieldCheck, Mail, GitBranch, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'apply' | 'track' | 'admin' | 'auth') => void;
  onOpenChecklist: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenChecklist }) => {
  return (
    <footer className="bg-[#F3F4F1] border-t border-[#E4E6E2] text-[#4B524E] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-[#1C1F1D]">
              <div className="w-8 h-8 rounded-lg bg-[#2F6B60] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                CT
              </div>
              <span className="font-bold text-base tracking-tight text-[#1C1F1D]">
                Company Tech
              </span>
            </div>
            <p className="text-[#4B524E] text-xs leading-relaxed max-w-sm">
              Internship Application & Management Automation System. Designed for high-impact student talent selection, automated review workflows, and instant verified offer letters.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#6E7571] font-mono">
              <GitBranch className="w-3.5 h-3.5 text-[#2F6B60]" />
              <span>company-tech-internship-management-system</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#1C1F1D] uppercase tracking-wider text-[11px] mb-3">
              Application Portal
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#2F6B60] transition-colors cursor-pointer"
                >
                  Explore 12 Open Roles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('apply')}
                  className="hover:text-[#2F6B60] transition-colors cursor-pointer"
                >
                  Submit Internship Application
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-[#2F6B60] transition-colors cursor-pointer"
                >
                  Track Application Status
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenChecklist}
                  className="text-[#23534A] hover:text-[#2F6B60] transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2F6B60]" />
                  <span>20-Point E2E Verification</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Administration */}
          <div>
            <h4 className="font-semibold text-[#1C1F1D] uppercase tracking-wider text-[11px] mb-3">
              Administration & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-[#2F6B60] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B60]" />
                  <span>Admissions Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('auth')}
                  className="hover:text-[#2F6B60] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Security Gateway / Sign-In</span>
                </button>
              </li>
              <li className="text-[#6E7571] text-[11px]">
                Authorized Admin: <br />
                <span className="text-[#1C1F1D] font-mono">gthanushree1566@gmail.com</span>
              </li>
              <li className="text-[#6E7571] text-[11px] pt-1">
                Official Signature Authority: <br />
                <span className="text-[#1C1F1D] font-medium">HR Support and Co-Founder</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E4E6E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6E7571]">
          <p>© {new Date().getFullYear()} Company Tech. All rights reserved. Demo prototype system.</p>
          <p className="italic">
            Built with React, TypeScript, Cloud Firestore, and Automated PDF Workflows.
          </p>
        </div>
      </div>
    </footer>
  );
};
