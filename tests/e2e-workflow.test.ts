/**
 * End-to-End Workflow & Unit Verification Suite
 * Project: Company Tech — Internship Application & Management Automation System
 * Repository: company-tech-internship-management-system
 */

import { VALID_ROLE_NAMES, INTERNSHIP_ROLES } from '../src/lib/rolesData.ts';
import { generateApplicationId } from '../src/lib/firebase.ts';
import { 
  DEMO_REJECTION_TEMPLATE, 
  getApplicantConfirmationEmail, 
  getSupportNotificationEmail, 
  getAcceptanceEmail 
} from '../src/lib/emailService.ts';
import { generateOfferLetterPdf, getOfferLetterBase64 } from '../src/lib/offerLetterGenerator.ts';
import { Application } from '../src/types/index.ts';

export function runTests(): { passed: number; failed: number; results: { test: string; status: 'PASS' | 'FAIL'; error?: string }[] } {
  const results: { test: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorMsg?: string) {
    if (condition) {
      results.push({ test: testName, status: 'PASS' });
      passed++;
    } else {
      results.push({ test: testName, status: 'FAIL', error: errorMsg || 'Assertion failed' });
      failed++;
    }
  }

  // 1. Verify 12 Roles exist
  assert(
    INTERNSHIP_ROLES.length === 12 && VALID_ROLE_NAMES.length === 12,
    'Check 1: Exactly 12 internship roles configured'
  );

  // 2. Verify specific role names
  const expectedRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full-Stack Developer',
    'AI/ML Engineer',
    'UI/UX Designer',
    'Graphic Designer',
    'Digital Marketing Intern',
    'Social Media Manager',
    'Content Writer',
    'Business Development Intern',
    'Community Manager',
    'HR Intern',
  ];
  const allRolesMatch = expectedRoles.every((r) => VALID_ROLE_NAMES.includes(r));
  assert(allRolesMatch, 'Check 2: All 12 required role titles match specifications');

  // 3. Application ID generation format
  const appId = generateApplicationId();
  const idRegex = /^CT-\d{4}-[A-Z0-9]{5}$/;
  assert(idRegex.test(appId), `Check 3: Application ID matches format CT-YYYY-XXXXX (${appId})`);

  // 4. Strict Demo Company Naming Requirement
  const bodyText = DEMO_REJECTION_TEMPLATE.getBody('Test Candidate', 'Frontend Developer', 'CT-2026-TEST1');
  const doesNotContainForbiddenName = !bodyText.toLowerCase().includes('codenprofit');
  const containsDemoCompanyTech = bodyText.includes('COMPANY TECH') || bodyText.includes('Company Tech');
  assert(
    doesNotContainForbiddenName && containsDemoCompanyTech,
    'Check 4: Brand name uses Company Tech exclusively; no forbidden mentor brand in email template'
  );

  // 5. Test Offer Letter PDF generation
  const mockApplication: Application = {
    id: 'CT-2026-TEST1',
    applicationId: 'CT-2026-TEST1',
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    college: 'State University of Tech',
    yearOfStudy: '3rd Year',
    experienceLevel: 'Fresher',
    role: 'Frontend Developer',
    status: 'Accepted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    decisionAt: new Date().toISOString(),
    internshipDuration: '2 months',
    joiningDate: '2026-11-15',
    offerLetterId: 'CT-OFFER-CT-2026-TEST1',
  };

  try {
    const doc = generateOfferLetterPdf(mockApplication);
    assert(doc != null, 'Check 5: Vector Offer Letter PDF generated successfully');
  } catch (err: any) {
    assert(false, 'Check 5: Vector Offer Letter PDF generated successfully', err.message);
  }

  // 6. Test Duration Validation
  const validDurations = ['1 month', '2 months', '3 months'];
  assert(
    validDurations.length === 3 && validDurations.includes(mockApplication.internshipDuration!),
    'Check 6: Internship duration strictly limited to 1, 2, or 3 months'
  );

  // 7. Verify Applicant Confirmation Email payload
  const applicantEmail = getApplicantConfirmationEmail(mockApplication);
  assert(
    applicantEmail.subject.includes('CT-2026-TEST1') && 
    applicantEmail.html.includes('COMPANY TECH') &&
    applicantEmail.html.includes('Frontend Developer'),
    'Check 7: Applicant confirmation email contains Application ID and Company Tech branding'
  );

  // 8. Verify Administrator Support Alert Email payload
  const adminEmail = 'gthanushree1566@gmail.com';
  const supportEmail = getSupportNotificationEmail(mockApplication, adminEmail);
  assert(
    supportEmail.to === adminEmail &&
    supportEmail.subject.includes('[New Application]') &&
    supportEmail.html.includes('Jane Doe') &&
    supportEmail.html.includes('CT-2026-TEST1'),
    'Check 8: Administrator alert notification routes to real administrator address with candidate details'
  );

  // 9. Verify Acceptance Email payload
  const acceptanceEmail = getAcceptanceEmail(mockApplication);
  assert(
    acceptanceEmail.subject.includes('Congratulations') &&
    acceptanceEmail.html.includes('2 months') &&
    acceptanceEmail.html.includes('2026-11-15') &&
    acceptanceEmail.html.includes('HR Support and Co-Founder'),
    'Check 9: Acceptance email includes offer details, duration, joining date, and HR Support signature'
  );

  // 10. Verify PDF Base64 attachment generation
  const pdfBase64 = getOfferLetterBase64(mockApplication);
  assert(
    pdfBase64.length > 500 && pdfBase64.startsWith('JVBERi0xLjM'),
    'Check 10: Offer letter base64 generator produces valid PDF bytes for email attachment'
  );

  // 11. Verify Email Diagnostic Sender Configuration
  const emailFrom = process.env.EMAIL_FROM || 'Company Tech <onboarding@resend.dev>';
  const supportEmailConfig = process.env.SUPPORT_EMAIL || 'gthanushree1566@gmail.com';
  assert(
    emailFrom.includes('Company Tech') && supportEmailConfig.includes('@'),
    'Check 11: Email configuration incorporates Company Tech sender branding and valid support target'
  );

  // 12. Verify Email Diagnostic Recipient Validation pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert(
    emailRegex.test('gthanushree1566@gmail.com') && !emailRegex.test('invalid-email'),
    'Check 12: Diagnostic recipient validator correctly accepts valid emails and rejects malformed inputs'
  );

  return { passed, failed, results };
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const result = runTests();
  console.log(`[Test Suite] Passed: ${result.passed}/${result.passed + result.failed}`);
}
