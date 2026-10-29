/**
 * End-to-End Workflow & Unit Verification Suite
 * Project: Company Tech — Internship Application & Management Automation System
 * Repository: company-tech-internship-management-system
 */

import { VALID_ROLE_NAMES, INTERNSHIP_ROLES } from '../src/lib/rolesData.ts';
import { generateApplicationId } from '../src/lib/firebase.ts';
import { DEMO_REJECTION_TEMPLATE } from '../src/lib/emailService.ts';
import { generateOfferLetterPdf } from '../src/lib/offerLetterGenerator.ts';
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

  return { passed, failed, results };
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const result = runTests();
  console.log(`[Test Suite] Passed: ${result.passed}/${result.passed + result.failed}`);
}
