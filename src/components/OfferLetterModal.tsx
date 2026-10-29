import React from 'react';
import { Application } from '../types/index.ts';
import { downloadOfferLetterPdf } from '../lib/offerLetterGenerator.ts';
import { 
  Download, 
  X, 
  FileCheck, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2 
} from 'lucide-react';

interface OfferLetterModalProps {
  application: Application | null;
  onClose: () => void;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
  application,
  onClose,
}) => {
  if (!application) return null;

  const issueDate = application.decisionAt
    ? new Date(application.decisionAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white my-8 relative">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">
              Official Offer Letter Document
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadOfferLetterPdf(application)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container Preview */}
        <div className="mt-6 bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-xl border border-slate-200 font-sans text-xs sm:text-sm">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  CT
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                  COMPANY TECH
                </h2>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Internship Admissions & Talent Development
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-600">
              <p className="font-mono font-bold text-blue-700">
                REF: CT-OFFER-{application.applicationId}
              </p>
              <p className="text-slate-500 mt-0.5">Date: {issueDate}</p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center my-4">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider underline decoration-blue-600 decoration-2 underline-offset-4">
              Formal Internship Offer Letter
            </h3>
          </div>

          {/* Candidate Meta Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 my-4 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Candidate:</span>
              <span className="font-bold text-slate-900">{application.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Application ID:</span>
              <span className="font-mono font-bold text-blue-700">{application.applicationId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Email:</span>
              <span className="font-mono text-slate-800">{application.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Institution:</span>
              <span className="text-slate-800 truncate block">{application.college}</span>
            </div>
          </div>

          {/* Salutation & Paragraph */}
          <div className="space-y-3 text-slate-700 leading-relaxed text-xs sm:text-[13px]">
            <p>
              Dear <strong>{application.fullName}</strong>,
            </p>
            <p>
              We are pleased to offer you the position of <strong>{application.role} Intern</strong> at <strong>Company Tech</strong>. Following a thorough review of your application credentials, our evaluation team is excited to welcome you into our upcoming talent cohort.
            </p>

            {/* Offer Terms */}
            <div className="border border-slate-300 rounded-lg overflow-hidden my-3">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-600 w-1/3">Role:</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{application.role} Intern</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 font-semibold text-slate-600">Internship Duration:</td>
                    <td className="py-2 px-3 font-bold text-blue-800">{application.internshipDuration}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-600">Expected Joining Date:</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{application.joiningDate}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-600">Arrangement:</td>
                    <td className="py-2 px-3 text-slate-800">Remote / Flexible Project-Driven Schedule</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              During your internship at Company Tech, you will work on practical projects, participate in structured code and design reviews, and receive ongoing feedback from dedicated mentors.
            </p>
            <p>
              Upon satisfactory completion of the internship duration, you will receive an official Internship Completion Certificate & Experience Credential.
            </p>
          </div>

          {/* Signature & Seal Block (Strictly "HR Support and Co-Founder") */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="font-serif italic text-base text-blue-900 font-bold mb-1">
                Company Tech Admissions
              </div>
              <div className="w-44 h-0.5 bg-slate-400 mb-1.5" />
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                HR Support and Co-Founder
              </p>
              <p className="text-[11px] text-slate-500">
                Company Tech — Admissions & Talent Team
              </p>
            </div>

            {/* Official Digital Seal */}
            <div className="p-2.5 rounded border border-blue-600 bg-blue-50/60 text-right text-[10px] text-blue-900">
              <span className="font-bold block uppercase tracking-wider text-blue-800">
                ★ Company Tech Verified ★
              </span>
              <span>Doc ID: CT-OFFER-{application.applicationId}</span>
              <span className="block text-slate-500">Approved & Cryptographically Signed</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => downloadOfferLetterPdf(application)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Resolution PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
