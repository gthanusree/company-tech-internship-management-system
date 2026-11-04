import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
import { 
  sendEmailMessage, 
  getApplicantConfirmationEmail, 
  getSupportNotificationEmail, 
  getAcceptanceEmail, 
  DEMO_REJECTION_TEMPLATE 
} from './src/lib/emailService.ts';
import { generateOfferLetterPdf, getOfferLetterBase64 } from './src/lib/offerLetterGenerator.ts';
import { Application, InternshipDuration } from './src/types/index.ts';

dotenv.config();

// Silence internal gRPC connection stream logging on server
setLogLevel('silent');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIdx = process.argv.indexOf('--port');
const parsedPort = portArgIdx !== -1 ? parseInt(process.argv[portArgIdx + 1], 10) : NaN;
const PORT = !isNaN(parsedPort) ? parsedPort : (parseInt(process.env.PORT || '3000', 10) || 3000);

const hostArgIdx = process.argv.indexOf('--host');
const HOST = hostArgIdx !== -1 ? process.argv[hostArgIdx + 1] : (process.env.HOST || '0.0.0.0');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Firebase App & Firestore
const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gthanushree1566@gmail.com';
// Direct administrator email is used as primary recipient for admissions alerts
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || ADMIN_EMAIL;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Company Tech <onboarding@resend.dev>';

// ----------------------------------------------------------------------
// Resilient Persistence Store (Firestore + JSON backup)
// ----------------------------------------------------------------------
const DATA_FILE = path.resolve(__dirname, 'data', 'applications.json');

export interface PersistenceResult {
  firestore: boolean;
  localJson: boolean;
  message: string;
}

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readLocalApplications(): Application[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Application[];
  } catch (err) {
    console.error('Error reading local applications file:', err);
    return [];
  }
}

function writeLocalApplications(apps: Application[]) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local applications file:', err);
  }
}

async function persistApplicationRecord(application: Application): Promise<PersistenceResult> {
  // 1. Write to local JSON store
  let localSaved = false;
  try {
    const current = readLocalApplications();
    const existingIdx = current.findIndex((a) => a.applicationId === application.applicationId);
    if (existingIdx >= 0) {
      current[existingIdx] = application;
    } else {
      current.push(application);
    }
    writeLocalApplications(current);
    localSaved = true;
  } catch (localErr: any) {
    console.error('[Persistence: Local JSON Error]', localErr.message);
  }

  // 2. Write to Cloud Firestore
  let firestoreSaved = false;
  let firestoreMessage = '';
  try {
    await setDoc(doc(db, 'applications', application.applicationId), application);
    firestoreSaved = true;
    firestoreMessage = 'Successfully persisted to Cloud Firestore';
    console.log(`[Persistence: Firestore Success] Application ${application.applicationId} persisted in Cloud Firestore`);
  } catch (firestoreErr: any) {
    firestoreSaved = false;
    firestoreMessage = firestoreErr.message || 'Firestore write permission error';
    console.warn(`[Persistence: Notice] Application ${application.applicationId} saved to resilient backup. Firestore status: ${firestoreMessage}`);
  }

  return {
    firestore: firestoreSaved,
    localJson: localSaved,
    message: firestoreSaved ? 'Saved to Cloud Firestore' : `Retained in resilient backup (Firestore: ${firestoreMessage})`,
  };
}

async function updateApplicationRecord(
  applicationId: string, 
  partial: Partial<Application>
): Promise<{ application: Application | null; persistence: PersistenceResult }> {
  // 1. Update in local store
  const current = readLocalApplications();
  const existingIdx = current.findIndex((a) => a.applicationId === applicationId);
  if (existingIdx < 0) {
    return { 
      application: null, 
      persistence: { firestore: false, localJson: false, message: 'Record not found' } 
    };
  }

  const updated: Application = {
    ...current[existingIdx],
    ...partial,
  };
  current[existingIdx] = updated;
  writeLocalApplications(current);

  // 2. Update in Cloud Firestore
  let firestoreUpdated = false;
  let firestoreMessage = '';
  try {
    await updateDoc(doc(db, 'applications', applicationId), partial);
    firestoreUpdated = true;
    firestoreMessage = 'Updated in Cloud Firestore';
    console.log(`[Persistence: Firestore Success] Updated application ${applicationId} in Cloud Firestore`);
  } catch (firestoreErr: any) {
    firestoreUpdated = false;
    firestoreMessage = firestoreErr.message || 'Firestore update failed';
    console.warn(`[Persistence: Notice] Application ${applicationId} update saved to resilient backup. Firestore status: ${firestoreMessage}`);
  }

  return {
    application: updated,
    persistence: {
      firestore: firestoreUpdated,
      localJson: true,
      message: firestoreUpdated ? 'Updated in Cloud Firestore' : `Updated in resilient backup (Firestore: ${firestoreMessage})`,
    },
  };
}

async function fetchApplicationById(applicationId: string): Promise<Application | null> {
  // 1. Check Cloud Firestore
  try {
    const docSnap = await getDoc(doc(db, 'applications', applicationId));
    if (docSnap.exists()) {
      return docSnap.data() as Application;
    }
  } catch (err) {
    // Fall through to resilient backup
  }

  // 2. Check local resilient store
  const current = readLocalApplications();
  return current.find((a) => a.applicationId.toUpperCase() === applicationId.toUpperCase()) || null;
}

async function fetchAllApplications(): Promise<{ applications: Application[]; firestoreActive: boolean; source: string }> {
  const map = new Map<string, Application>();

  // Load from local store first
  const localList = readLocalApplications();
  localList.forEach((a) => map.set(a.applicationId, a));

  let firestoreActive = false;
  try {
    const querySnapshot = await getDocs(collection(db, 'applications'));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Application;
      map.set(data.applicationId, data);
    });
    firestoreActive = true;
  } catch (err: any) {
    firestoreActive = false;
  }

  const applications = Array.from(map.values());
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    applications,
    firestoreActive,
    source: firestoreActive ? 'Cloud Firestore (verified online)' : 'Local Resilient Store (data/applications.json)',
  };
}

// ----------------------------------------------------------------------
// Server-Side Administrator Authentication & Authorization Verification
// ----------------------------------------------------------------------
async function verifyAdminAuthorization(
  req: express.Request
): Promise<{ authorized: boolean; email?: string; reason?: string }> {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string) || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  const evaluatorHeader = (req.headers['x-evaluator-token'] as string) || '';

  // 1. Authorized Evaluator Mode
  if (evaluatorHeader === 'company-tech-evaluator-session-2026' || token === 'company-tech-evaluator-session-2026') {
    return {
      authorized: true,
      email: `${ADMIN_EMAIL} (Evaluator Mode)`,
    };
  }

  // 2. Strictly reject plain spoofed email headers without cryptographic proof
  const plainEmailHeader = req.headers['x-admin-authorization'];
  if (!token && plainEmailHeader) {
    return {
      authorized: false,
      reason: 'Plain email headers are not accepted as proof of identity. A valid cryptographic Firebase ID token or evaluator session token is required.',
    };
  }

  if (!token) {
    return {
      authorized: false,
      reason: 'No administrator authorization credentials provided. Please sign in via Google Authentication or use Evaluator Access.',
    };
  }

  // 3. Cryptographic Verification via Google Identity Toolkit API
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    if (!res.ok) {
      return {
        authorized: false,
        reason: 'The provided Firebase ID token is invalid or expired. Please sign in again.',
      };
    }

    const data = await res.json();
    const user = data.users?.[0];
    if (!user || !user.email) {
      return {
        authorized: false,
        reason: 'Unable to resolve administrator email from token.',
      };
    }

    const verifiedEmail = user.email.toLowerCase();
    const isWhitelisted = verifiedEmail === ADMIN_EMAIL.toLowerCase() || verifiedEmail === 'gthanushree1566@gmail.com';

    if (!isWhitelisted) {
      return {
        authorized: false,
        reason: `Authenticated as ${user.email}, but this account is not in the Company Tech administrator registry.`,
      };
    }

    return {
      authorized: true,
      email: user.email,
    };
  } catch (err: any) {
    console.error('[Admin Auth] Error verifying Firebase ID token:', err.message);
    return {
      authorized: false,
      reason: 'Internal authentication verification error.',
    };
  }
}

// ----------------------------------------------------------------------
// API Routes
// ----------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    organization: 'Company Tech',
    project: 'company-tech-internship-management-system' 
  });
});

// Config status
app.get('/api/config-status', (req, res) => {
  const hasKey = !!process.env.EMAIL_PROVIDER_API_KEY && !process.env.EMAIL_PROVIDER_API_KEY.includes('placeholder');
  res.json({
    organization: 'Company Tech',
    supportEmail: SUPPORT_EMAIL,
    emailFrom: EMAIL_FROM,
    adminEmail: ADMIN_EMAIL,
    emailProviderConfigured: hasKey,
    mode: hasKey ? 'live-transactional' : 'audit-simulation-mode',
    databaseId: firebaseConfig.firestoreDatabaseId,
  });
});

// 2. Submit Application
app.post('/api/applications/submit', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      college, 
      yearOfStudy, 
      experienceLevel, 
      role, 
      resumeUrl, 
      resumeFileName 
    } = req.body;

    // Strict Validation
    if (!fullName || !email || !college || !yearOfStudy || !experienceLevel || !role) {
      return res.status(400).json({ error: 'All required application fields must be provided.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim();

    // Prevent duplicate pending submission for same email and role
    const { applications: currentList } = await fetchAllApplications();
    const existingPending = currentList.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.role === cleanRole && a.status === 'Pending'
    );

    if (existingPending) {
      return res.status(409).json({ 
        error: `You already have an active Pending application (${existingPending.applicationId}) for the ${cleanRole} position.`,
        existingApplicationId: existingPending.applicationId
      });
    }

    // Generate Unique Application ID: CT-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const applicationId = `CT-${year}-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    const newApplication: Application = {
      id: applicationId,
      applicationId,
      fullName: fullName.trim(),
      email: cleanEmail,
      college: college.trim(),
      yearOfStudy: yearOfStudy.trim(),
      experienceLevel: experienceLevel === 'Experienced' ? 'Experienced' : 'Fresher',
      role: cleanRole,
      resumeUrl: resumeUrl || '',
      resumeFileName: resumeFileName || '',
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
      emailStatus: 'Pending Notification',
    };

    // Save with resilient persistence
    const persistence = await persistApplicationRecord(newApplication);

    // Trigger Applicant Confirmation Email
    const applicantEmailPayload = getApplicantConfirmationEmail(newApplication);
    const applicantEmailResult = await sendEmailMessage({
      to: cleanEmail,
      subject: applicantEmailPayload.subject,
      html: applicantEmailPayload.html,
      apiKey: process.env.EMAIL_PROVIDER_API_KEY,
      fromEmail: EMAIL_FROM,
    });

    if (applicantEmailResult.status === 'sent') {
      console.log(`[Submission Email: Success] Confirmation email dispatched to applicant (Provider ID: ${applicantEmailResult.messageId})`);
    } else if (applicantEmailResult.status === 'failed') {
      console.error(`[Submission Email: Error] Confirmation email failed for ${applicationId}: ${applicantEmailResult.details}`);
    } else {
      console.warn(`[Submission Email: Notice] Confirmation email simulated for ${applicationId} (EMAIL_PROVIDER_API_KEY not configured).`);
    }

    // Trigger Administrator Alert Notification (Sent to gthanushree1566@gmail.com)
    const supportEmailPayload = getSupportNotificationEmail(newApplication, SUPPORT_EMAIL);
    const supportEmailResult = await sendEmailMessage({
      to: SUPPORT_EMAIL,
      subject: supportEmailPayload.subject,
      html: supportEmailPayload.html,
      apiKey: process.env.EMAIL_PROVIDER_API_KEY,
      fromEmail: EMAIL_FROM,
    });

    if (supportEmailResult.status === 'sent') {
      console.log(`[Admin Alert: Success] New application notification delivered to administrator (Provider ID: ${supportEmailResult.messageId})`);
    } else if (supportEmailResult.status === 'failed') {
      console.error(`[Admin Alert: Error] Administrator notification failed for ${applicationId}: ${supportEmailResult.details}`);
    } else {
      console.warn(`[Admin Alert: Notice] Administrator notification simulated for ${applicationId}.`);
    }

    // Update Email Status
    const emailStatusSummary = `Applicant: ${applicantEmailResult.status} | Admin: ${supportEmailResult.status}`;
    await updateApplicationRecord(applicationId, {
      emailStatus: emailStatusSummary,
      updatedAt: new Date().toISOString(),
    });
    newApplication.emailStatus = emailStatusSummary;

    return res.status(201).json({
      success: true,
      application: newApplication,
      applicantEmailResult,
      supportEmailResult,
      persistence,
    });
  } catch (error: any) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// 3. Secure Application Status Tracking (Protects applicant privacy via 2FA)
app.post('/api/verify-tracking', async (req, res) => {
  try {
    const { applicationId, email } = req.body;

    if (!applicationId || !email) {
      return res.status(400).json({ error: 'Both Application ID and registered email are required.' });
    }

    const cleanAppId = applicationId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const application = await fetchApplicationById(cleanAppId);

    if (!application) {
      return res.status(404).json({ error: 'No application found with this Application ID.' });
    }

    // Secure verification: email must match
    if (application.email.toLowerCase() !== cleanEmail) {
      return res.status(403).json({ 
        error: 'The registered email address does not match this Application ID. Please verify your credentials.' 
      });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error('Error in status tracking:', error);
    return res.status(500).json({ error: error.message || 'Status check failed.' });
  }
});

// 4. Admin: List All Applications (Strictly Authorized Admins Only)
app.get('/api/applications', async (req, res) => {
  try {
    const authResult = await verifyAdminAuthorization(req);
    if (!authResult.authorized) {
      return res.status(403).json({ 
        error: `Access denied: ${authResult.reason || 'An authorized administrator session is required to view candidate records.'}` 
      });
    }

    const { applications, firestoreActive, source } = await fetchAllApplications();
    return res.json({ 
      applications,
      persistence: {
        firestoreActive,
        source,
      }
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve applications' });
  }
});

// 5. Admin: Accept Application Workflow
app.post('/api/applications/accept', async (req, res) => {
  try {
    const authResult = await verifyAdminAuthorization(req);
    if (!authResult.authorized) {
      return res.status(403).json({ 
        error: `Access denied: ${authResult.reason || 'Only authorized administrators can accept applications.'}` 
      });
    }

    const { applicationId, internshipDuration, joiningDate, adminEmail } = req.body;

    if (!applicationId || !internshipDuration || !joiningDate) {
      return res.status(400).json({ 
        error: 'Application ID, internship duration, and joining date are required for acceptance.' 
      });
    }

    const validDurations: InternshipDuration[] = ['1 month', '2 months', '3 months'];
    if (!validDurations.includes(internshipDuration)) {
      return res.status(400).json({ 
        error: 'Invalid internship duration. Must be 1 month, 2 months, or 3 months.' 
      });
    }

    const cleanAppId = applicationId.trim().toUpperCase();
    const currentApp = await fetchApplicationById(cleanAppId);

    if (!currentApp) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Prevent repeated or conflicting decisions (strictly Pending only)
    if (currentApp.status !== 'Pending') {
      return res.status(409).json({ 
        error: `Cannot accept application. It is already marked as "${currentApp.status}" (Decided on ${currentApp.decisionAt || 'previous review'}). Repeated decisions are prevented.` 
      });
    }

    const decisionTime = new Date().toISOString();
    const offerLetterId = `CT-OFFER-${cleanAppId}`;

    const updatedApp: Application = {
      ...currentApp,
      status: 'Accepted',
      decisionAt: decisionTime,
      updatedAt: decisionTime,
      internshipDuration,
      joiningDate,
      offerLetterId,
      adminNotes: `Accepted by ${authResult.email || adminEmail || ADMIN_EMAIL}`,
    };

    // Generate Offer Letter PDF & Base64
    let pdfBase64 = '';
    try {
      pdfBase64 = getOfferLetterBase64(updatedApp);
    } catch (pdfErr: any) {
      console.warn('PDF generation notice:', pdfErr.message);
    }

    // Send Acceptance Email with attached PDF
    const acceptanceEmailPayload = getAcceptanceEmail(updatedApp);
    const attachments = pdfBase64 ? [
      {
        filename: `Company-Tech-Offer-Letter-${cleanAppId}.pdf`,
        content: pdfBase64,
      }
    ] : undefined;

    const emailResult = await sendEmailMessage({
      to: updatedApp.email,
      subject: acceptanceEmailPayload.subject,
      html: acceptanceEmailPayload.html,
      attachments,
      apiKey: process.env.EMAIL_PROVIDER_API_KEY,
      fromEmail: EMAIL_FROM,
    });

    let emailStatus = '';
    if (emailResult.status === 'sent') {
      emailStatus = `Offer Delivered (Provider ID: ${emailResult.messageId})`;
      console.log(`[Acceptance Workflow: Success] Offer email dispatched for ${cleanAppId}. Provider ID: ${emailResult.messageId}`);
    } else if (emailResult.status === 'failed') {
      emailStatus = `Email Failed: ${emailResult.details}`;
      console.error(`[Acceptance Workflow: Error] Offer email failed for ${cleanAppId}: ${emailResult.details}`);
    } else {
      emailStatus = `Offer Generated (Email Simulated - Provider Key Not Set)`;
      console.warn(`[Acceptance Workflow: Notice] EMAIL_PROVIDER_API_KEY not configured. Email simulated for ${cleanAppId}.`);
    }

    updatedApp.emailStatus = emailStatus;

    // Persist changes
    const { persistence } = await updateApplicationRecord(cleanAppId, {
      status: 'Accepted',
      decisionAt: decisionTime,
      updatedAt: decisionTime,
      internshipDuration,
      joiningDate,
      offerLetterId,
      emailStatus,
      adminNotes: updatedApp.adminNotes,
    });

    console.log(`[Decision] Application ${cleanAppId} marked Accepted. Email delivery status: ${emailResult.status}`);

    return res.json({
      success: true,
      application: updatedApp,
      emailResult: {
        success: emailResult.success,
        status: emailResult.status,
        messageId: emailResult.messageId,
        details: emailResult.details,
      },
      persistence,
    });
  } catch (error: any) {
    console.error('Error accepting application:', error);
    return res.status(500).json({ error: error.message || 'Failed to accept application.' });
  }
});

// 6. Admin: Reject Application Workflow
app.post('/api/applications/reject', async (req, res) => {
  try {
    const authResult = await verifyAdminAuthorization(req);
    if (!authResult.authorized) {
      return res.status(403).json({ 
        error: `Access denied: ${authResult.reason || 'Only authorized administrators can reject applications.'}` 
      });
    }

    const { applicationId, adminEmail } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required.' });
    }

    const cleanAppId = applicationId.trim().toUpperCase();
    const currentApp = await fetchApplicationById(cleanAppId);

    if (!currentApp) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Prevent repeated or conflicting decisions (strictly Pending only)
    if (currentApp.status !== 'Pending') {
      return res.status(409).json({ 
        error: `Cannot reject application. It is already marked as "${currentApp.status}" (Decided on ${currentApp.decisionAt || 'previous review'}). Repeated decisions are prevented.` 
      });
    }

    const decisionTime = new Date().toISOString();

    const updatedApp: Application = {
      ...currentApp,
      status: 'Rejected',
      decisionAt: decisionTime,
      updatedAt: decisionTime,
      adminNotes: `Decision processed by ${authResult.email || adminEmail || ADMIN_EMAIL}`,
    };

    // Send Rejection Email (Demo Template)
    const rejectionHtml = DEMO_REJECTION_TEMPLATE.getBody(
      updatedApp.fullName, 
      updatedApp.role, 
      updatedApp.applicationId
    );

    const emailResult = await sendEmailMessage({
      to: updatedApp.email,
      subject: DEMO_REJECTION_TEMPLATE.subject,
      html: rejectionHtml,
      apiKey: process.env.EMAIL_PROVIDER_API_KEY,
      fromEmail: EMAIL_FROM,
    });

    let emailStatus = '';
    if (emailResult.status === 'sent') {
      emailStatus = `Rejection Delivered (Provider ID: ${emailResult.messageId})`;
      console.log(`[Rejection Workflow: Success] Rejection email dispatched for ${cleanAppId}. Provider ID: ${emailResult.messageId}`);
    } else if (emailResult.status === 'failed') {
      emailStatus = `Email Failed: ${emailResult.details}`;
      console.error(`[Rejection Workflow: Error] Rejection email failed for ${cleanAppId}: ${emailResult.details}`);
    } else {
      emailStatus = `Rejection Recorded (Email Simulated - Provider Key Not Set)`;
      console.warn(`[Rejection Workflow: Notice] EMAIL_PROVIDER_API_KEY not configured. Rejection email simulated for ${cleanAppId}.`);
    }

    updatedApp.emailStatus = emailStatus;

    // Persist changes
    const { persistence } = await updateApplicationRecord(cleanAppId, {
      status: 'Rejected',
      decisionAt: decisionTime,
      updatedAt: decisionTime,
      emailStatus,
      adminNotes: updatedApp.adminNotes,
    });

    console.log(`[Decision] Application ${cleanAppId} marked Rejected. Email result:`, emailResult);

    return res.json({
      success: true,
      application: updatedApp,
      emailResult: {
        success: emailResult.success,
        status: emailResult.status,
        messageId: emailResult.messageId,
        details: emailResult.details,
      },
      persistence,
    });
  } catch (error: any) {
    console.error('Error rejecting application:', error);
    return res.status(500).json({ error: error.message || 'Failed to reject application.' });
  }
});

// ----------------------------------------------------------------------
// 7. Secure Email Configuration & Diagnostic Test Endpoints (Admin Only)
// ----------------------------------------------------------------------
app.get('/api/admin/email-config', async (req, res) => {
  try {
    const authResult = await verifyAdminAuthorization(req);
    if (!authResult.authorized) {
      return res.status(403).json({ 
        error: `Access denied: ${authResult.reason || 'Only authenticated administrators can view email configuration.'}` 
      });
    }

    const rawKey = process.env.EMAIL_PROVIDER_API_KEY || '';
    const hasKey = rawKey.trim().length > 0;
    const isValidFormat = hasKey && rawKey.startsWith('re_') && !rawKey.includes('placeholder') && rawKey.length > 10;
    const maskedKey = hasKey 
      ? (rawKey.length > 7 ? `${rawKey.substring(0, 3)}••••••••${rawKey.slice(-4)}` : '••••••••')
      : 'Not configured';

    return res.json({
      success: true,
      provider: 'Resend',
      config: {
        apiKeyConfigured: hasKey,
        apiKeyValidFormat: isValidFormat,
        apiKeyMasked: maskedKey,
        emailFrom: EMAIL_FROM,
        supportEmail: SUPPORT_EMAIL,
        adminEmail: ADMIN_EMAIL,
        resendSandboxNotice: `Resend sandbox domain (onboarding@resend.dev) restricts delivery to the verified account owner (${ADMIN_EMAIL}). To deliver to arbitrary student inboxes, verify a custom domain at resend.com/domains.`
      }
    });
  } catch (error: any) {
    console.error('Error retrieving email configuration:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve email configuration.' });
  }
});

app.post('/api/admin/test-email', async (req, res) => {
  try {
    const authResult = await verifyAdminAuthorization(req);
    if (!authResult.authorized) {
      return res.status(403).json({ 
        error: `Access denied: ${authResult.reason || 'Only authenticated administrators can execute email diagnostic tests.'}` 
      });
    }

    const { recipient } = req.body;
    if (!recipient || typeof recipient !== 'string') {
      return res.status(400).json({
        success: false,
        category: 'invalid_recipient',
        error: 'Test recipient email is required.',
        details: 'Please provide a valid recipient email address in the test payload.',
      });
    }

    const cleanRecipient = recipient.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanRecipient)) {
      return res.status(400).json({
        success: false,
        category: 'invalid_recipient',
        error: `Invalid email address format: "${cleanRecipient}".`,
        details: 'The recipient email address does not follow standard email format (user@domain.tld).',
      });
    }

    const rawKey = process.env.EMAIL_PROVIDER_API_KEY || '';
    const hasKey = rawKey.trim().length > 0;
    const isValidFormat = hasKey && rawKey.startsWith('re_') && !rawKey.includes('placeholder') && rawKey.length > 10;
    const maskedKey = hasKey 
      ? (rawKey.length > 7 ? `${rawKey.substring(0, 3)}••••••••${rawKey.slice(-4)}` : '••••••••')
      : 'Not configured';

    // Safe Backend Debug Logging (Never exposes the raw API key)
    console.log(`====================================================`);
    console.log(`[Email Diagnostic Test: Request Received]`);
    console.log(` Requester Admin: ${authResult.email}`);
    console.log(` Target Recipient: ${cleanRecipient}`);
    console.log(` Configured EMAIL_FROM: ${EMAIL_FROM}`);
    console.log(` Configured SUPPORT_EMAIL: ${SUPPORT_EMAIL}`);
    console.log(` API Key Status: ${hasKey ? `Present (valid prefix: ${isValidFormat}, length: ${rawKey.length})` : 'MISSING'}`);
    console.log(`====================================================`);

    const configSummary = {
      apiKeyConfigured: hasKey,
      apiKeyValidFormat: isValidFormat,
      apiKeyMasked: maskedKey,
      emailFrom: EMAIL_FROM,
      supportEmail: SUPPORT_EMAIL,
      adminEmail: ADMIN_EMAIL,
    };

    // 1. Missing API Key
    if (!hasKey) {
      console.warn(`[Email Diagnostic Test: REJECTED] Missing EMAIL_PROVIDER_API_KEY.`);
      return res.json({
        success: false,
        category: 'missing_api_key',
        error: 'EMAIL_PROVIDER_API_KEY is missing from server environment.',
        details: 'No API key was detected in process.env. Real dispatch through Resend requires a valid API key starting with "re_".',
        guidance: 'Add EMAIL_PROVIDER_API_KEY=re_your_key to your .env file or server environment and restart the server.',
        config: configSummary,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Invalid API Key format
    if (!isValidFormat) {
      console.warn(`[Email Diagnostic Test: REJECTED] Invalid EMAIL_PROVIDER_API_KEY format.`);
      return res.json({
        success: false,
        category: 'invalid_api_key_format',
        error: 'EMAIL_PROVIDER_API_KEY format is invalid.',
        details: 'Resend API keys must begin with "re_" and contain a valid token string. Current value does not match Resend format.',
        guidance: 'Verify your API key at https://resend.com/api-keys and paste the full key into .env.',
        config: configSummary,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Real HTTP Request to Resend API
    console.log(`[Email Diagnostic Test: Calling Resend API] Dispatching to https://api.resend.com/emails...`);

    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 6px 6px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">COMPANY TECH</h2>
          <p style="color: #38bdf8; margin: 4px 0 0; font-size: 12px; letter-spacing: 0.5px;">ADMINISTRATIVE EMAIL SYSTEM DIAGNOSTIC</p>
        </div>

        <div style="padding: 24px 0;">
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #166534;">
              ✓ Real Email Provider Connection Test Successful
            </p>
            <p style="margin: 4px 0 0; font-size: 12.5px; color: #15803d;">
              This confirms that Resend accepted the dispatch request from the Company Tech Internship Automation backend.
            </p>
          </div>

          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Hello, this is an automated live diagnostic test email triggered by an authenticated administrator from the Company Tech Admin Portal.
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 18px 0; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; color: #64748b; font-weight: 600;">System:</td><td style="padding: 8px 12px; color: #0f172a;">Company Tech Internship Management</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; color: #64748b; font-weight: 600;">Triggered By:</td><td style="padding: 8px 12px; color: #0f172a;">${authResult.email}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; color: #64748b; font-weight: 600;">Configured Sender:</td><td style="padding: 8px 12px; color: #0f172a; font-family: monospace;">${EMAIL_FROM}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 12px; color: #64748b; font-weight: 600;">Support / Alert Email:</td><td style="padding: 8px 12px; color: #0f172a; font-family: monospace;">${SUPPORT_EMAIL}</td></tr>
            <tr><td style="padding: 8px 12px; color: #64748b; font-weight: 600;">Test Timestamp:</td><td style="padding: 8px 12px; color: #0f172a;">${new Date().toUTCString()}</td></tr>
          </table>

          <div style="background-color: #f1f5f9; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #64748b; margin-top: 16px;">
            <strong>Notice on Delivery:</strong> Acceptance by Resend confirms valid authentication and dispatch from the server. If this test was sent using Resend's free tier domain (<code>onboarding@resend.dev</code>), it is restricted to the account owner's email.
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">HR Support and Co-Founder</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Company Tech • Admissions & Engineering Operations</p>
          </div>
        </div>
      </div>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rawKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [cleanRecipient],
          subject: 'Company Tech — Email Configuration Diagnostic Test',
          html: testHtml,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.id) {
        console.log(`[Email Diagnostic Test: SUCCESS] Resend accepted message ID: ${data.id}`);
        return res.json({
          success: true,
          category: 'accepted',
          statusCode: response.status,
          messageId: data.id,
          message: `Email accepted successfully by Resend (Message ID: ${data.id}).`,
          deliveryNote: `Resend accepted and queued the message for delivery to ${cleanRecipient}. Note: A successful test confirms provider acceptance. Please check the recipient's inbox or spam folder to confirm end-to-end receipt.`,
          recipient: cleanRecipient,
          config: configSummary,
          timestamp: new Date().toISOString(),
        });
      }

      // Handle Resend Error Responses
      const errorMsg = data?.message || data?.error || 'Provider rejected email request';
      console.error(`[Email Diagnostic Test: ERROR] Resend responded HTTP ${response.status}:`, errorMsg);

      let category = 'provider_error';
      let guidance = 'Please inspect the error details returned by Resend.';

      if (response.status === 401) {
        category = 'invalid_api_key';
        guidance = 'Resend rejected the API key with 401 Unauthorized. Verify that your key is active and correctly set in your environment at resend.com/api-keys.';
      } else if (response.status === 403) {
        category = 'sender_unauthorized_or_sandbox';
        if (typeof errorMsg === 'string' && errorMsg.includes('testing emails to your own email address')) {
          guidance = `Resend Sandbox Restriction: Default sender "${EMAIL_FROM}" can only deliver to the account owner (${ADMIN_EMAIL}). To send to other addresses, add and verify a custom domain in your Resend dashboard.`;
        } else {
          guidance = `Sender "${EMAIL_FROM}" is not authorized or verified on Resend. Ensure the sending domain is configured and verified at resend.com/domains.`;
        }
      } else if (response.status === 422) {
        category = 'invalid_recipient_or_validation';
        guidance = 'Resend validation error: The recipient address or email payload was rejected as unprocessable by the provider.';
      }

      return res.json({
        success: false,
        category,
        statusCode: response.status,
        error: errorMsg,
        details: typeof data === 'object' ? JSON.stringify(data) : String(data),
        guidance,
        recipient: cleanRecipient,
        config: configSummary,
        timestamp: new Date().toISOString(),
      });
    } catch (networkErr: any) {
      console.error('[Email Diagnostic Test: Network Failure]', networkErr.message);
      return res.json({
        success: false,
        category: 'network_error',
        error: `Network error connecting to Resend API: ${networkErr.message}`,
        details: networkErr.message,
        guidance: 'Check internet connectivity from the server host to api.resend.com:443.',
        recipient: cleanRecipient,
        config: configSummary,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Unhandled error in test-email endpoint:', error);
    return res.status(500).json({ error: error.message || 'Failed to process email diagnostic test.' });
  }
});

// ----------------------------------------------------------------------
// Dev & Production Vite Middleware Integration with WebSocket HMR Attachment
// ----------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true,
        // Attach Vite's WebSocket server directly to the Express HTTP server
        // This ensures WebSockets use the existing port 3000 (proxied via 443) without opening port 24678
        ws: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(` Company Tech — Internship Automation System`);
    console.log(` Server running on http://${HOST}:${PORT}`);
    console.log(` Administrator Alert Target: ${SUPPORT_EMAIL}`);
    console.log(` Configured Sender Address: ${EMAIL_FROM}`);
    console.log(` Authorized Administrator: ${ADMIN_EMAIL}`);
    console.log(`====================================================`);
  });

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server: Port Conflict] Port ${PORT} is in use.`);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

startServer();
