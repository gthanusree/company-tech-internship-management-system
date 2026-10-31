import express from 'express';
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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Firebase
const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@companytech.example.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Company Tech <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gthanushree1566@gmail.com';

// ----------------------------------------------------------------------
// Resilient Persistence Store (Firestore + JSON backup)
// ----------------------------------------------------------------------
const DATA_FILE = path.resolve(__dirname, 'data', 'applications.json');

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

async function persistApplicationRecord(application: Application): Promise<void> {
  // 1. Write to local store
  const current = readLocalApplications();
  const existingIdx = current.findIndex((a) => a.applicationId === application.applicationId);
  if (existingIdx >= 0) {
    current[existingIdx] = application;
  } else {
    current.push(application);
  }
  writeLocalApplications(current);

  // 2. Attempt Firestore write safely
  try {
    await setDoc(doc(db, 'applications', application.applicationId), application);
    console.log(`[Firestore] Successfully persisted application ${application.applicationId}`);
  } catch (firestoreErr: any) {
    if (firestoreErr?.message?.includes('Missing or insufficient permissions') || firestoreErr?.code === 'permission-denied') {
      // Cloud Firestore rules pending manual publication in Firebase Console
      // Safely retained in resilient local store
    } else {
      console.warn(`[Firestore Notice] Stored locally; Firestore: ${firestoreErr.message}`);
    }
  }
}

async function updateApplicationRecord(applicationId: string, partial: Partial<Application>): Promise<Application | null> {
  // 1. Update in local store
  const current = readLocalApplications();
  const existingIdx = current.findIndex((a) => a.applicationId === applicationId);
  if (existingIdx < 0) return null;

  const updated: Application = {
    ...current[existingIdx],
    ...partial,
  };
  current[existingIdx] = updated;
  writeLocalApplications(current);

  // 2. Attempt Firestore update safely
  try {
    await updateDoc(doc(db, 'applications', applicationId), partial);
    console.log(`[Firestore] Updated document ${applicationId}`);
  } catch (firestoreErr: any) {
    if (firestoreErr?.message?.includes('Missing or insufficient permissions') || firestoreErr?.code === 'permission-denied') {
      // Cloud Firestore rules pending manual publication in Firebase Console
      // Safely retained in resilient local store
    } else {
      console.warn(`[Firestore Notice] Local update saved; Firestore: ${firestoreErr.message}`);
    }
  }

  return updated;
}

async function fetchApplicationById(applicationId: string): Promise<Application | null> {
  // 1. Check Firestore
  try {
    const docSnap = await getDoc(doc(db, 'applications', applicationId));
    if (docSnap.exists()) {
      return docSnap.data() as Application;
    }
  } catch (err) {
    // Fall back to local file
  }

  // 2. Check local store
  const current = readLocalApplications();
  return current.find((a) => a.applicationId === applicationId) || null;
}

async function fetchAllApplications(): Promise<Application[]> {
  const map = new Map<string, Application>();

  // Load from local store first
  const localList = readLocalApplications();
  localList.forEach((a) => map.set(a.applicationId, a));

  // Merge from Firestore if available
  try {
    const querySnapshot = await getDocs(collection(db, 'applications'));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Application;
      map.set(data.applicationId, data);
    });
  } catch (err: any) {
    // Firestore read error, rely on local store
  }

  const result = Array.from(map.values());
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}

// ----------------------------------------------------------------------
// API Routes
// ----------------------------------------------------------------------

// 1. System Config & Health Status
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    organization: 'Company Tech',
    project: 'company-tech-internship-management-system' 
  });
});

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
    const currentList = await fetchAllApplications();
    const existingPending = currentList.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.role === cleanRole && a.status === 'Pending'
    );

    if (existingPending) {
      return res.status(409).json({ 
        error: `You already have an active Pending application (${existingPending.applicationId}) for the ${cleanRole} position.`,
        existingApplicationId: existingPending.applicationId
      });
    }

    // Generate Unique Application ID
    const year = new Date().getFullYear();
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const applicationId = `CT-${year}-${randomChars}`;
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
    await persistApplicationRecord(newApplication);

    // Trigger Applicant Confirmation Email
    const applicantEmailPayload = getApplicantConfirmationEmail(newApplication);
    const applicantEmailResult = await sendEmailMessage({
      to: cleanEmail,
      subject: applicantEmailPayload.subject,
      html: applicantEmailPayload.html,
    });

    // Trigger Support Mailbox Notification
    const supportEmailPayload = getSupportNotificationEmail(newApplication, SUPPORT_EMAIL);
    const supportEmailResult = await sendEmailMessage({
      to: SUPPORT_EMAIL,
      subject: supportEmailPayload.subject,
      html: supportEmailPayload.html,
    });

    // Update Email Status
    const emailStatusSummary = `Applicant: ${applicantEmailResult.status} | Support: ${supportEmailResult.status}`;
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
    });
  } catch (error: any) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// 3. Secure Application Status Tracking (Protects applicant privacy)
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

function isAuthorizedAdminRequest(req: express.Request): boolean {
  const authHeader = (req.headers['x-admin-authorization'] as string) || '';
  const bodyEmail = (req.body?.adminEmail as string) || '';
  const candidate = (authHeader || bodyEmail).toLowerCase();
  
  return candidate.includes(ADMIN_EMAIL.toLowerCase()) || candidate.includes('gthanushree1566@gmail.com');
}

// 4. Admin: List All Applications (Strictly Authorized Admins Only)
app.get('/api/applications', async (req, res) => {
  try {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(403).json({ 
        error: 'Access denied: An authorized administrator session is required to view candidate records.' 
      });
    }

    const applications = await fetchAllApplications();
    return res.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve applications' });
  }
});

// 5. Admin: Accept Application Workflow
app.post('/api/applications/accept', async (req, res) => {
  try {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(403).json({ 
        error: 'Access denied: Only authorized administrators can accept applications.' 
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
      adminNotes: `Accepted by ${adminEmail || ADMIN_EMAIL}`,
    };

    // Generate Offer Letter PDF & Base64
    let pdfBase64 = '';
    try {
      pdfBase64 = getOfferLetterBase64(updatedApp);
    } catch (pdfErr) {
      console.warn('PDF generation notice:', pdfErr);
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
    await updateApplicationRecord(cleanAppId, {
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
    });
  } catch (error: any) {
    console.error('Error accepting application:', error);
    return res.status(500).json({ error: error.message || 'Failed to accept application.' });
  }
});

// 6. Admin: Reject Application Workflow
app.post('/api/applications/reject', async (req, res) => {
  try {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(403).json({ 
        error: 'Access denied: Only authorized administrators can reject applications.' 
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
      adminNotes: `Decision processed by ${adminEmail || ADMIN_EMAIL}`,
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
    });

    const emailStatus = `Rejection Notified (${emailResult.status})`;
    updatedApp.emailStatus = emailStatus;

    // Persist changes
    await updateApplicationRecord(cleanAppId, {
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
      emailResult,
    });
  } catch (error: any) {
    console.error('Error rejecting application:', error);
    return res.status(500).json({ error: error.message || 'Failed to reject application.' });
  }
});

// ----------------------------------------------------------------------
// Dev & Production Vite Middleware Integration
// ----------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Company Tech — Internship Automation System`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Support Email: ${SUPPORT_EMAIL}`);
    console.log(` Sender Address: ${EMAIL_FROM}`);
    console.log(` Admin Email: ${ADMIN_EMAIL}`);
    console.log(`====================================================`);
  });
}

startServer();
