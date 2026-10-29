export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected';

export type ExperienceLevel = 'Fresher' | 'Experienced';

export type InternshipDuration = '1 month' | '2 months' | '3 months';

export interface Application {
  id: string; // Firestore doc ID (or applicationId)
  applicationId: string; // CT-2026-XXXX
  fullName: string;
  email: string;
  college: string;
  yearOfStudy: string;
  experienceLevel: ExperienceLevel;
  role: string;
  resumeUrl?: string;
  resumeFileName?: string;
  status: ApplicationStatus;
  createdAt: string; // ISO string or formatted timestamp
  updatedAt: string;
  decisionAt?: string;
  internshipDuration?: InternshipDuration;
  joiningDate?: string;
  offerLetterId?: string;
  emailStatus?: string;
  adminNotes?: string;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  college: string;
  yearOfStudy: string;
  experienceLevel: ExperienceLevel;
  role: string;
  resumeFile?: File | null;
  resumeBase64?: string;
  resumeFileName?: string;
}

export interface InternshipRoleInfo {
  id: string;
  title: string;
  category: 'Engineering' | 'Design' | 'Marketing' | 'Operations';
  description: string;
  openings: number;
  skills: string[];
  responsibilities: string[];
}

export interface EmailDeliveryRecord {
  type: 'applicant_confirmation' | 'support_notification' | 'acceptance_offer' | 'rejection';
  recipient: string;
  status: 'queued' | 'sent' | 'simulated' | 'failed';
  timestamp: string;
  messageId?: string;
  details?: string;
}
