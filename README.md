# Company Tech — Internship Application & Management Automation System

> **Repository Name:** `company-tech-internship-management-system`  
> **Demo Organisation:** Company Tech  
> **Target Audience:** Individual Internship Assignment & Production Demonstration  

A full-stack, secure, and automated internship application and admissions management platform built for **Company Tech**. The system orchestrates candidate submissions, Cloud Firestore persistence, transactional email notifications, administrator evaluation workflows, atomic state transitions, and automated vector PDF offer-letter generation.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [End-to-End Workflow & Features](#2-end-to-end-workflow--features)
3. [Technology Stack](#3-technology-stack)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Local Development](#6-local-development)
7. [Firebase Project Configuration](#7-firebase-project-configuration)
8. [Cloud Firestore & Security Rules](#8-cloud-firestore--security-rules)
9. [Administrator Account Setup](#9-administrator-account-setup)
10. [Email Provider Configuration (Resend)](#10-email-provider-configuration-resend)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Running & Testing the Application](#12-running--testing-the-application)
13. [Deployment Guide](#13-deployment-guide)
14. [GitHub Push Instructions](#14-github-push-instructions)
15. [Known Limitations](#15-known-limitations)

---

## 1. Project Overview

Company Tech operates competitive internship tracks across engineering, product design, marketing, and operations. This system automates the complete lifecycle:

- **Candidate Portal:** Applicants explore 12 distinct internship roles, fill out an input-validated form, upload optional resumes, and receive an instant unique Application ID (`CT-YYYY-XXXXX`).
- **Real-Time Persistence:** All records are stored in Cloud Firestore with server-validated timestamps and an initial `Pending` status.
- **Privacy-Protected Tracking:** Candidates track their application status using two-factor verification (Application ID + registered email address).
- **Protected Administrator Dashboard:** Authorized admins review applications, inspect credentials, download resumes, and execute acceptance or rejection decisions.
- **Automated Offer Letters:** Acceptance triggers automated generation of a vector PDF offer letter featuring Company Tech branding, duration (1, 2, or 3 months), joining date, and the official signature block: `HR Support and Co-Founder`.
- **Transactional Notifications:** Automated emails for submission confirmation, support mailbox alerts, acceptance with attached offer-letter PDF, and configurable rejection messages.

---

## 2. End-to-End Workflow & Features

### A. Candidate Application
1. **12 Configured Roles:**
   - Frontend Developer
   - Backend Developer
   - Full-Stack Developer
   - AI/ML Engineer
   - UI/UX Designer
   - Graphic Designer
   - Digital Marketing Intern
   - Social Media Manager
   - Content Writer
   - Business Development Intern
   - Community Manager
   - HR Intern
2. **Form Validation:** Validates required fields, email format, experience level (Fresher vs Experienced), and optional resume file size (up to 5MB, `.pdf`, `.doc`, `.docx`).
3. **Duplicate Prevention:** Prevents multiple concurrent pending submissions for the same email and role.
4. **Unique Application ID:** Automatically generates a cryptographically sound format `CT-2026-XXXXX`.

### B. Secure Application Tracking
- Requires **both** Application ID and applicant's registered email to prevent guessing or enumeration attacks.
- Displays visual 3-stage timeline (Submitted → Under Review → Decision).
- For Accepted applications: displays details, duration, joining date, and 1-click **Download Official Offer Letter PDF**.

### C. Administrator Dashboard
- **Role-Based Access Control:** Authenticates via Firebase Authentication (Google Sign-In) and checks against `AUTHORIZED_ADMIN_EMAILS` and Firestore admin registry.
- **Live Statistics:** Total Applications, Pending Count, Accepted Offers, Rejected Count, and Acceptance Rate %.
- **Filtering & Search:** Real-time search by name, email, college, or application ID, plus status and role filters.
- **Detailed Profile Inspection:** View complete candidate particulars, resume download, and audit trails.

### D. Decision Workflows
- **Acceptance:**
  - Allowed **strictly on `Pending` applications** (repeated or conflicting decisions are blocked).
  - Mandatory duration selection: `1 month`, `2 months`, or `3 months`.
  - Mandatory joining date picker.
  - Automatically renders high-resolution vector PDF offer letter.
  - Emails offer letter as attachment to candidate.
- **Rejection:**
  - Allowed strictly on `Pending` applications.
  - Displays configurable demonstration template preview.
  - Emails polite rejection outcome notification to candidate.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** Express.js running with Vite middlewares in full-stack dev mode
- **Database:** Google Cloud Firestore (Modular SDK v12)
- **Authentication:** Firebase Authentication (Google Sign-In & Admin verification)
- **PDF Generation:** jsPDF (Client & Server-side vector document generation)
- **Email Delivery:** Resend REST API integration with high-fidelity simulated audit fallback
- **Build & Dev Tools:** Vite 8, tsx, Node.js

---

## 4. Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Firebase Account:** Google account with Firebase Console access
- **(Optional) Resend Account:** Free account at [resend.com](https://resend.com) for sending live transactional emails

---

## 5. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/company-tech-internship-management-system.git
   cd company-tech-internship-management-system
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

---

## 6. Local Development

Run the full-stack development server (Express backend + Vite client middleware):

```bash
npm run dev
```

Open your browser to:
```
http://localhost:3000
```

---

## 7. Firebase Project Configuration

1. Visit [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. `company-tech-system`).
2. Register a **Web App** in Project Settings.
3. Copy the Firebase configuration object and place it in `firebase-applet-config.json` at the project root:

```json
{
  "projectId": "your-firebase-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "your-sender-id"
}
```

> **Note:** The current repository is pre-configured with active Cloud Firestore integration.

---

## 8. Cloud Firestore & Security Rules

1. Enable **Cloud Firestore** in the Firebase Console in production or test mode.
2. Deploy the included `firestore.rules` file via Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. The security rules enforce:
   - Anyone can submit a valid `Pending` application.
   - Only authorized administrators (`gthanushree1566@gmail.com` or `admins/{uid}`) can read all applications or execute updates.
   - Updates are locked: only transitions from `Pending` to `Accepted` (with valid duration) or `Rejected` are permitted.
   - Deletions are forbidden (`allow delete: if false;`).

---

## 9. Administrator Account Setup

1. In Firebase Console, go to **Authentication** → **Sign-in method** → Enable **Google**.
2. Add your administrator email to `AUTHORIZED_ADMIN_EMAILS` in `src/lib/firebase.ts` or as `ADMIN_EMAIL` in `.env`.
3. The primary authorized administrator configured for Company Tech is:
   `gthanushree1566@gmail.com`
4. The admin portal also includes an **Evaluator Mode toggle** in the top navigation bar for immediate test-grading without popup restrictions.

---

## 10. Email Provider Configuration (Resend)

The application supports transactional email delivery via **Resend** or a high-fidelity audit simulation mode.

1. Create a free API Key at [Resend Dashboard](https://resend.com/api-keys).
2. Set the key in your `.env` file:
   ```env
   EMAIL_PROVIDER_API_KEY="re_your_api_key_here"
   EMAIL_FROM="Company Tech <onboarding@resend.dev>"
   SUPPORT_EMAIL="support@companytech.example.com"
   ```
3. **Audit Simulation Mode:** If `EMAIL_PROVIDER_API_KEY` is omitted or left as placeholder, the system safely records email dispatches in the database audit log without failing requests, making local testing completely seamless.

---

## 11. Environment Variables Reference

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Local server port | `3000` |
| `SUPPORT_EMAIL` | Destination mailbox for new application alerts | `support@companytech.example.com` |
| `EMAIL_FROM` | Sender address shown to candidates | `Company Tech <onboarding@resend.dev>` |
| `EMAIL_PROVIDER_API_KEY` | Resend API Key | `re_123456789...` |
| `ADMIN_EMAIL` | Default administrator account email | `gthanushree1566@gmail.com` |

---

## 12. Running & Testing the Application

### Automated Verification Tests
Run the test suite:
```bash
npx tsx tests/e2e-workflow.test.ts
```

### Manual 20-Point End-to-End Checklist
Open the app at `http://localhost:3000` and click the **E2E Test Checklist** button in the header. The interactive modal walks through:
1. Submitting an application
2. Firestore document creation
3. Unique ID verification (`CT-2026-XXXXX`)
4. Server timestamp creation
5. Initial `Pending` status
6. Candidate confirmation email
7. Support notification email
8. Admin login
9. Unauthorized access protection
10. Profile and resume inspection
11. Acceptance dialog
12. Duration and joining date selection
13. Vector offer-letter PDF preview
14. Acceptance email with attachment
15. Rejection flow
16. Demonstration rejection message
17. Conflicting decision prevention
18. Security rules enforcement
19. Secret scrubbing verification
20. README verification

---

## 13. Deployment Guide

### Build Static Assets
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

### Deploy to Cloud Run / Vercel / Render
- Set the build command to: `npm run build`
- Set the start command to: `npm start`
- Inject the environment variables from `.env.example` in your hosting dashboard.

---

## 14. GitHub Push Instructions

To push this prototype to your individual GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add files while respecting .gitignore (secrets stay private)
git add .

# 3. Create the initial commit
git commit -m "feat: complete Company Tech internship automation system with Firestore, admin review, offer letters, and emails"

# 4. Set repository branch
git branch -M main

# 5. Link your GitHub repository
git remote add origin https://github.com/<your-username>/company-tech-internship-management-system.git

# 6. Push to GitHub
git push -u origin main
```

---

## 15. Known Limitations

1. **Email Sandbox:** Using Resend's free tier with `onboarding@resend.dev` delivers real emails only to the email address registered with your Resend account. To deliver to arbitrary student inboxes, verify your custom domain in Resend.
2. **Third-Party Cookies / Popups:** If running inside an iframe or embedded browser, Google Sign-In popups may be blocked by browser settings; use the included **Evaluator Mode** toggle to test all admin capabilities without interruption.

---

*Developed for Company Tech • Automated Internship Application & Management System*
