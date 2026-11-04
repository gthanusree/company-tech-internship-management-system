import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { RolesSection } from './components/RolesSection.tsx';
import { ApplicationForm } from './components/ApplicationForm.tsx';
import { StatusTracker } from './components/StatusTracker.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ConfirmationModal } from './components/ConfirmationModal.tsx';
import { OfferLetterModal } from './components/OfferLetterModal.tsx';
import { VerificationChecklistModal } from './components/VerificationChecklistModal.tsx';
import { SignInGateway } from './components/SignInGateway.tsx';
import { Footer } from './components/Footer.tsx';
import { Application } from './types/index.ts';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'apply' | 'track' | 'admin' | 'auth'>('auth');
  const [selectedRole, setSelectedRole] = useState<string>('Frontend Developer');

  // Confirmation Modal state
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  // Status Tracker prefill credentials
  const [trackerCreds, setTrackerCreds] = useState<{ appId: string; email: string }>({
    appId: '',
    email: '',
  });

  // Offer Letter preview modal
  const [offerLetterApp, setOfferLetterApp] = useState<Application | null>(null);

  // Verification Checklist modal
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);

  const handleSelectRole = (roleTitle: string) => {
    setSelectedRole(roleTitle);
    setActiveView('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const formEl = document.getElementById('application-form-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleApplicationSubmitted = (app: Application) => {
    setSubmittedApp(app);
  };

  const handleTrackStatusFromConfirmation = (appId: string, email: string) => {
    setSubmittedApp(null);
    setTrackerCreds({ appId, email });
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view: 'home' | 'apply' | 'track' | 'admin' | 'auth') => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Universal Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={navigateTo}
        onOpenChecklist={() => setIsChecklistOpen(true)}
        isAdminLoggedIn={true}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* 1. Home / Roles Overview View */}
        {activeView === 'home' && (
          <>
            <Hero
              onApplyClick={() => navigateTo('apply')}
              onTrackClick={() => navigateTo('track')}
              onExploreRoles={() => {
                const el = document.getElementById('roles-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
            <div id="roles-section">
              <RolesSection onSelectRole={handleSelectRole} />
            </div>
            <ApplicationForm
              selectedRoleFromHero={selectedRole}
              onSuccess={handleApplicationSubmitted}
            />
          </>
        )}

        {/* 2. Direct Apply View */}
        {activeView === 'apply' && (
          <div className="py-8">
            <ApplicationForm
              selectedRoleFromHero={selectedRole}
              onSuccess={handleApplicationSubmitted}
            />
          </div>
        )}

        {/* 3. Status Tracker View */}
        {activeView === 'track' && (
          <div className="py-8">
            <StatusTracker
              initialAppId={trackerCreds.appId}
              initialEmail={trackerCreds.email}
              onViewOfferLetter={(app) => setOfferLetterApp(app)}
            />
          </div>
        )}

        {/* 4. Admin Admissions Dashboard View */}
        {activeView === 'admin' && (
          <div className="py-6">
            <AdminDashboard />
          </div>
        )}

        {/* 5. Security Gateway / Sign-In View */}
        {activeView === 'auth' && (
          <SignInGateway
            onAdminLogin={() => navigateTo('admin')}
            onApplicantAccess={() => navigateTo('home')}
            onTrackStatusAccess={() => navigateTo('track')}
            onOpenChecklist={() => setIsChecklistOpen(true)}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenChecklist={() => setIsChecklistOpen(true)}
      />

      {/* Confirmation Modal */}
      {submittedApp && (
        <ConfirmationModal
          application={submittedApp}
          onClose={() => setSubmittedApp(null)}
          onTrackStatus={handleTrackStatusFromConfirmation}
        />
      )}

      {/* Offer Letter Preview Modal */}
      {offerLetterApp && (
        <OfferLetterModal
          application={offerLetterApp}
          onClose={() => setOfferLetterApp(null)}
        />
      )}

      {/* 20-Point E2E Verification Checklist Modal */}
      <VerificationChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        onNavigateToApply={() => navigateTo('apply')}
        onNavigateToTrack={() => navigateTo('track')}
        onNavigateToAdmin={() => navigateTo('admin')}
      />
    </div>
  );
}
