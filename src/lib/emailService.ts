import { Application } from '../types/index.ts';

export interface EmailSendResult {
  success: boolean;
  status: 'queued' | 'sent' | 'simulated' | 'failed';
  messageId: string;
  recipient: string;
  subject: string;
  timestamp: string;
  details: string;
}

// Configurable Rejection Demo Template (as required by prompt section 8)
export const DEMO_REJECTION_TEMPLATE = {
  subject: 'Company Tech — Update Regarding Your Internship Application (Demo Template)',
  notice: 'Note: This is a professional demonstration template configured for Company Tech review. You can customize the body text in your environment or administrative settings.',
  getBody: (candidateName: string, role: string, applicationId: string) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 16px 20px; border-radius: 6px 6px 0 0; text-align: left;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 0.5px;">COMPANY TECH</h2>
        <p style="color: #94a3b8; margin: 4px 0 0; font-size: 12px;">Internship Admissions & Talent Team</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Dear <strong>${candidateName}</strong>,</p>
        
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Thank you for taking the time to apply for the <strong>${role} Intern</strong> role at Company Tech (Application ID: <code>${applicationId}</code>).
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #94a3b8; padding: 14px 16px; margin: 18px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; font-size: 13.5px; color: #334155; line-height: 1.6;">
            We received an exceptionally high volume of applications from talented candidates across colleges for this cycle. After careful consideration by our mentors, we regret to inform you that we will not be moving forward with your application for this cohort.
          </p>
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Please know that this was a difficult decision. We encourage you to continue honing your skills and to apply again for future internship cohorts and junior openings at Company Tech.
        </p>

        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          We sincerely appreciate your interest in Company Tech and wish you the very best in your academic and professional endeavors.
        </p>

        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">HR Support and Co-Founder</p>
          <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Company Tech — Admissions & People Team</p>
        </div>
      </div>

      <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 11px; color: #64748b; text-align: center;">
        <em>Demonstration Rejection Template • Configurable via Company Tech Admin</em>
      </div>
    </div>
  `,
};

// 1. Applicant Confirmation Email Template
export function getApplicantConfirmationEmail(app: Application) {
  return {
    subject: `Application Received: ${app.role} Internship — Company Tech [${app.applicationId}]`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 6px 6px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">COMPANY TECH</h2>
          <p style="color: #38bdf8; margin: 4px 0 0; font-size: 12px; letter-spacing: 0.5px;">APPLICATION CONFIRMATION</p>
        </div>

        <div style="padding: 24px 0;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 17px;">Application Successfully Submitted!</h3>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Dear <strong>${app.fullName}</strong>, thank you for applying for an internship at <strong>Company Tech</strong>.
            We have received your application and entered it into our review system.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold;">Your Application Summary</p>
            <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>Application ID:</strong> <span style="color: #2563eb; font-weight: bold; font-family: monospace; font-size: 15px;">${app.applicationId}</span></p>
            <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>Position:</strong> ${app.role} Intern</p>
            <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>Institution:</strong> ${app.college}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #0f172a;"><strong>Current Status:</strong> <span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">Pending Review</span></p>
          </div>

          <h4 style="color: #0f172a; margin: 18px 0 8px; font-size: 14px;">What Happens Next?</h4>
          <ol style="font-size: 13.5px; color: #475569; line-height: 1.6; padding-left: 20px;">
            <li>Our technical mentors and HR team will evaluate your profile against the role criteria.</li>
            <li>You will receive an official decision email upon review completion.</li>
            <li>You can securely check your real-time status at any time using your Application ID and registered email address.</li>
          </ol>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">HR Support and Co-Founder</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Company Tech • Talent Admissions Team</p>
          </div>
        </div>
      </div>
    `,
  };
}

// 2. Support Notification Email Template
export function getSupportNotificationEmail(app: Application, supportEmail: string) {
  return {
    to: supportEmail,
    subject: `[New Application] ${app.fullName} — ${app.role} (${app.applicationId})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #1e293b; padding: 14px 18px; border-radius: 6px 6px 0 0;">
          <h3 style="color: #ffffff; margin: 0; font-size: 16px;">Company Tech • Admissions Alert</h3>
        </div>
        <div style="padding: 20px 0;">
          <p style="font-size: 14px; color: #334155; margin-top: 0;">A new internship application has been submitted and is waiting in the review queue:</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 14px 0;">
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Application ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2563eb;">${app.applicationId}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Candidate Name:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${app.fullName}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Candidate Email:</td><td style="padding: 6px 0; color: #0f172a;">${app.email}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Role:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${app.role}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">College:</td><td style="padding: 6px 0; color: #0f172a;">${app.college}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Pursuing Year:</td><td style="padding: 6px 0; color: #0f172a;">${app.yearOfStudy}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; color: #64748b;">Experience:</td><td style="padding: 6px 0; color: #0f172a;">${app.experienceLevel}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Resume Attached:</td><td style="padding: 6px 0; color: #0f172a;">${app.resumeFileName ? 'Yes (' + app.resumeFileName + ')' : 'None'}</td></tr>
          </table>

          <p style="font-size: 13px; color: #64748b; margin-top: 16px;">
            Log in to the Company Tech Admin Dashboard to review credentials, download the resume, and submit an acceptance or rejection decision.
          </p>
        </div>
      </div>
    `,
  };
}

// 3. Acceptance Email Template
export function getAcceptanceEmail(app: Application) {
  return {
    subject: `Congratulations! Internship Offer from Company Tech — ${app.role} [${app.applicationId}]`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 6px 6px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">COMPANY TECH</h2>
          <p style="color: #10b981; margin: 4px 0 0; font-size: 12px; letter-spacing: 0.5px; font-weight: bold;">OFFICIAL INTERNSHIP OFFER</p>
        </div>

        <div style="padding: 24px 0;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Congratulations, ${app.fullName}! 🎉</h3>
          
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            On behalf of <strong>Company Tech</strong>, we are thrilled to offer you the position of <strong>${app.role} Intern</strong>.
            Your qualifications and enthusiasm impressed our team during the evaluation process.
          </p>

          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #166534; font-weight: bold;">Your Offer Particulars</p>
            <p style="margin: 4px 0; font-size: 14px; color: #14532d;"><strong>Role:</strong> ${app.role} Intern</p>
            <p style="margin: 4px 0; font-size: 14px; color: #14532d;"><strong>Internship Duration:</strong> ${app.internshipDuration || '2 months'}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #14532d;"><strong>Joining Date:</strong> ${app.joiningDate || 'Immediate'}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #14532d;"><strong>Reference ID:</strong> ${app.applicationId}</p>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            <strong>Offer Letter Attached:</strong> Your official offer-letter PDF is attached to this email and is also permanently accessible via your Company Tech Status Tracking portal.
          </p>

          <h4 style="color: #0f172a; margin: 18px 0 8px; font-size: 14px;">Next Steps:</h4>
          <ul style="font-size: 13.5px; color: #475569; line-height: 1.6; padding-left: 20px;">
            <li>Review the attached offer letter and ensure all details are accurate.</li>
            <li>Reply to this email or reach out to our team to confirm your acceptance.</li>
            <li>Look out for onboarding instructions and repository access invitations ahead of your joining date.</li>
          </ul>

          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">HR Support and Co-Founder</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Company Tech • Talent Admissions Team</p>
          </div>
        </div>
      </div>
    `,
  };
}

// Universal Sender function (handles Resend API or simulated audit send)
export async function sendEmailMessage({
  to,
  subject,
  html,
  attachments,
  apiKey,
  fromEmail,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
  apiKey?: string;
  fromEmail?: string;
}): Promise<EmailSendResult> {
  const from = fromEmail || process.env.EMAIL_FROM || 'Company Tech <onboarding@resend.dev>';
  const resolvedKey = apiKey || process.env.EMAIL_PROVIDER_API_KEY;

  // Real delivery via Resend if valid key provided
  if (resolvedKey && resolvedKey.startsWith('re_') && !resolvedKey.includes('placeholder')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resolvedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          attachments: attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok && data.id) {
        console.log(`[EmailService: Success] Email accepted by provider (Message ID: ${data.id})`);
        return {
          success: true,
          status: 'sent',
          messageId: data.id,
          recipient: to,
          subject,
          timestamp: new Date().toISOString(),
          details: 'Dispatched successfully via Resend API',
        };
      } else {
        const errorMsg = data?.message || 'Resend provider error';
        console.error(`[EmailService: Error] Provider rejected send. HTTP ${response.status}: ${errorMsg}`);

        let userFriendlyNotice = errorMsg;
        if (errorMsg.includes('testing emails to your own email address')) {
          userFriendlyNotice = 'Resend sandbox restriction: The default domain (onboarding@resend.dev) only delivers to your registered account email. To deliver to arbitrary student inboxes, verify a custom domain at resend.com/domains.';
        }

        return {
          success: false,
          status: 'failed',
          messageId: 'err_' + Date.now(),
          recipient: to,
          subject,
          timestamp: new Date().toISOString(),
          details: userFriendlyNotice,
        };
      }
    } catch (err: any) {
      console.error('[EmailService: Network Error] Failed to reach Resend API:', err.message);
      return {
        success: false,
        status: 'failed',
        messageId: 'err_' + Date.now(),
        recipient: to,
        subject,
        timestamp: new Date().toISOString(),
        details: err.message || 'Network error reaching email provider',
      };
    }
  }

  // Simulated delivery mode (High fidelity logs, audit trail, no crash)
  console.warn(`[EmailService: Notice] Real email delivery skipped: EMAIL_PROVIDER_API_KEY is not configured or using placeholder. Running in simulated audit mode.`);
  if (attachments && attachments.length > 0) {
    console.log(`[EmailService: Notice] Included ${attachments.length} attachment(s): ${attachments.map(a => a.filename).join(', ')}`);
  }

  return {
    success: false,
    status: 'simulated',
    messageId: 'sim_' + Math.random().toString(36).substring(2, 10),
    recipient: to,
    subject,
    timestamp: new Date().toISOString(),
    details: 'EMAIL_PROVIDER_API_KEY is not configured in .env. Delivery recorded in simulation mode. Configure Resend key for real inbox dispatch.',
  };
}
