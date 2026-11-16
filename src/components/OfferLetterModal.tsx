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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/45 backdrop-blur-[2px] overflow-y-auto">
      <div className="bg-white border border-[#E4E6E2] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl text-[#1C1F1D] my-8 relative">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E6E2]">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#2F6B60]" />
            <h3 className="font-bold text-base text-[#1C1F1D]">
              Official Offer Letter Document
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadOfferLetterPdf(application)}
              className="px-3 py-1.5 rounded-lg bg-[#2F6B60] hover:bg-[#24554C] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6E7571] hover:text-[#1C1F1D] hover:bg-[#F3F4F1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container Preview */}
        <div className="mt-6 bg-white text-[#1C1F1D] rounded-xl p-8 sm:p-10 shadow-sm border border-[#E4E6E2] font-sans text-xs sm:text-sm">
          {/* Header Banner */}
          <div className="border-b-2 border-[#1C1F1D] pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#2F6B60] text-white flex items-center justify-center font-bold text-xs">
                  CT
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-[#1C1F1D]">
                  COMPANY TECH
                </h2>
              </div>
              <p className="text-[11px] font-semibold text-[#6E7571] uppercase tracking-wider mt-1">
                Internship Admissions & Talent Development
              </p>
            </div>
            <div className="text-right text-[11px] text-[#4B524E]">
              <p className="font-mono font-bold text-[#23534A]">
                REF: CT-OFFER-{application.applicationId}
              </p>
              <p className="text-[#6E7571] mt-0.5">Date: {issueDate}</p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center my-4">
            <h3 className="text-base font-extrabold text-[#1C1F1D] uppercase tracking-wider underline decoration-[#2F6B60] decoration-2 underline-offset-4">
              Formal Internship Offer Letter
            </h3>
          </div>

          {/* Candidate Meta Box */}
          <div className="bg-[#F8F9F7] border border-[#E4E6E2] rounded-lg p-3.5 my-4 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#6E7571] block text-[10px] uppercase font-semibold">Candidate:</span>
              <span className="font-bold text-[#1C1F1D]">{application.fullName}</span>
            </div>
            <div>
              <span className="text-[#6E7571] block text-[10px] uppercase font-semibold">Application ID:</span>
              <span className="font-mono font-bold text-[#23534A]">{application.applicationId}</span>
            </div>
            <div>
              <span className="text-[#6E7571] block text-[10px] uppercase font-semibold">Email:</span>
              <span className="font-mono text-[#1C1F1D]">{application.email}</span>
            </div>
            <div>
              <span className="text-[#6E7571] block text-[10px] uppercase font-semibold">Institution:</span>
              <span className="text-[#1C1F1D] truncate block">{application.college}</span>
            </div>
          </div>

          {/* Salutation & Paragraph */}
          <div className="space-y-3 text-[#4B524E] leading-relaxed text-xs sm:text-[13px]">
            <p>
              Dear <strong className="text-[#1C1F1D]">{application.fullName}</strong>,
            </p>
            <p>
              We are pleased to offer you the position of <strong className="text-[#1C1F1D]">{application.role} Intern</strong> at <strong className="text-[#1C1F1D]">Company Tech</strong>. Following a thorough review of your application credentials, our evaluation team is excited to welcome you into our upcoming talent cohort.
            </p>

            {/* Offer Terms */}
            <div className="border border-[#D6D9D3] rounded-lg overflow-hidden my-3">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-[#E4E6E2] bg-[#F8F9F7]">
                    <td className="py-2 px-3 font-semibold text-[#4B524E] w-1/3">Role:</td>
                    <td className="py-2 px-3 font-bold text-[#1C1F1D]">{application.role} Intern</td>
                  </tr>
                  <tr className="border-b border-[#E4E6E2]">
                    <td className="py-2 px-3 font-semibold text-[#4B524E]">Internship Duration:</td>
                    <td className="py-2 px-3 font-bold text-[#23534A]">{application.internshipDuration}</td>
                  </tr>
                  <tr className="border-b border-[#E4E6E2] bg-[#F8F9F7]">
                    <td className="py-2 px-3 font-semibold text-[#4B524E]">Expected Joining Date:</td>
                    <td className="py-2 px-3 font-bold text-[#1C1F1D]">{application.joiningDate}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#4B524E]">Arrangement:</td>
                    <td className="py-2 px-3 text-[#1C1F1D]">Remote / Flexible Project-Driven Schedule</td>
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
          <div className="mt-8 pt-6 border-t border-[#E4E6E2] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="font-serif italic text-base text-[#23534A] font-bold mb-1">
                Company Tech Admissions
              </div>
              <div className="w-44 h-0.5 bg-[#D6D9D3] mb-1.5" />
              <p className="font-bold text-[#1C1F1D] text-xs sm:text-sm">
                HR Support and Co-Founder
              </p>
              <p className="text-[11px] text-[#6E7571]">
                Company Tech — Admissions & Talent Team
              </p>
            </div>

            {/* Official Digital Seal */}
            <div className="p-2.5 rounded border border-[#C8DDD7] bg-[#EEF5F2] text-right text-[10px] text-[#23534A]">
              <span className="font-bold block uppercase tracking-wider text-[#23534A]">
                ★ Company Tech Verified ★
              </span>
              <span>Doc ID: CT-OFFER-{application.applicationId}</span>
              <span className="block text-[#6E7571]">Approved & Cryptographically Signed</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => downloadOfferLetterPdf(application)}
            className="px-5 py-2.5 rounded-xl bg-[#2F6B60] hover:bg-[#24554C] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Resolution PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
