import React, { useState, useEffect } from 'react';
import { 
  VALID_ROLE_NAMES 
} from '../lib/rolesData.ts';
import { 
  Application, 
  ApplicationFormData, 
  ExperienceLevel 
} from '../types/index.ts';
import { 
  Send, 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  HelpCircle,
  Building2,
  GraduationCap
} from 'lucide-react';

interface ApplicationFormProps {
  selectedRoleFromHero?: string;
  onSuccess: (application: Application) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  selectedRoleFromHero,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    college: '',
    yearOfStudy: '3rd Year',
    experienceLevel: 'Fresher',
    role: selectedRoleFromHero || VALID_ROLE_NAMES[0],
    resumeFile: null,
    resumeBase64: '',
    resumeFileName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync if role changed from parent
  useEffect(() => {
    if (selectedRoleFromHero && VALID_ROLE_NAMES.includes(selectedRoleFromHero)) {
      setFormData((prev) => ({ ...prev, role: selectedRoleFromHero }));
    }
  }, [selectedRoleFromHero]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError(null);
  };

  const handleExperienceChange = (level: ExperienceLevel) => {
    setFormData((prev) => ({ ...prev, experienceLevel: level }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        resume: 'Resume file size exceeds the 5MB limit. Please upload a smaller file.',
      }));
      return;
    }

    // Validate file type (PDF, DOC, DOCX)
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      setErrors((prev) => ({
        ...prev,
        resume: 'Only PDF or Word documents (.pdf, .doc, .docx) are supported.',
      }));
      return;
    }

    // Read to Base64 data URL
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        resumeFile: file,
        resumeFileName: file.name,
        resumeBase64: reader.result as string,
      }));
      setErrors((prev) => ({ ...prev, resume: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    setFormData((prev) => ({
      ...prev,
      resumeFile: null,
      resumeBase64: '',
      resumeFileName: '',
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College or Institution name is required.';
    }

    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Please select your current year of study.';
    }

    if (!formData.role || !VALID_ROLE_NAMES.includes(formData.role)) {
      newErrors.role = 'Please select a valid internship role.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          college: formData.college,
          yearOfStudy: formData.yearOfStudy,
          experienceLevel: formData.experienceLevel,
          role: formData.role,
          resumeUrl: formData.resumeBase64,
          resumeFileName: formData.resumeFileName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        college: '',
        yearOfStudy: '3rd Year',
        experienceLevel: 'Fresher',
        role: VALID_ROLE_NAMES[0],
        resumeFile: null,
        resumeBase64: '',
        resumeFileName: '',
      });

      // Notify parent to display Confirmation screen
      onSuccess(data.application);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setServerError(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="application-form-section" className="py-16 md:py-20 bg-slate-950 text-white relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Official Application Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Company Tech Internship Application
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Submit your candidate profile. All applications are persisted in Firestore and processed through our automated decision pipeline.
          </p>
        </div>

        {/* Server Error Notification */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Application Notice</p>
              <p className="mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name <span className="text-blue-400">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
              )}
            </div>

            {/* 2. Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address <span className="text-blue-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="alex.morgan@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500'
                }`}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Decision notifications and offer letters will be delivered to this inbox.
              </p>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* 3. College / Institution & Year of Study */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="college" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  College / Institution <span className="text-blue-400">*</span>
                </label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  placeholder="e.g. National Institute of Tech"
                  value={formData.college}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.college ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
                {errors.college && (
                  <p className="mt-1 text-xs text-red-400">{errors.college}</p>
                )}
              </div>

              <div>
                <label htmlFor="yearOfStudy" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Current Year of Study <span className="text-blue-400">*</span>
                </label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year / Final Year">4th Year / Final Year</option>
                  <option value="Postgraduate / Master's">Postgraduate / Master's</option>
                </select>
              </div>
            </div>

            {/* 4. Experience Level (Fresher vs Experienced) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Experience Level <span className="text-blue-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleExperienceChange('Fresher')}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-center flex items-center justify-center gap-2 ${
                    formData.experienceLevel === 'Fresher'
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold shadow-sm shadow-blue-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Fresher (No prior work exp)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExperienceChange('Experienced')}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-center flex items-center justify-center gap-2 ${
                    formData.experienceLevel === 'Experienced'
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold shadow-sm shadow-blue-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Experienced (Projects / Past interns)</span>
                </button>
              </div>
            </div>

            {/* 5. Role Selection Dropdown (12 Roles) */}
            <div>
              <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Internship Role Track <span className="text-blue-400">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                {VALID_ROLE_NAMES.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-red-400">{errors.role}</p>
              )}
            </div>

            {/* 6. Optional Resume Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Resume / CV <span className="text-slate-500 font-normal">(Optional, max 5MB PDF/DOC)</span>
              </label>

              {formData.resumeFileName ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-xs text-slate-200 truncate font-mono">
                      {formData.resumeFileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
                  <span className="text-xs text-slate-300 font-medium group-hover:text-white">
                    Click to browse or drop your resume here
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Supported: PDF, DOC, DOCX up to 5MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {errors.resume && (
                <p className="mt-1 text-xs text-red-400">{errors.resume}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting Application to Company Tech...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Internship Application</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2.5">
                Upon submission, a unique Application ID is generated in Cloud Firestore and automated confirmation emails are dispatched.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
