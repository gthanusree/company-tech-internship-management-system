import React, { useState, useEffect } from 'react';
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
import { testConnection } from './lib/firebase.ts';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'auth' | 'home' | 'apply' | 'track' | 'admin'>('auth');
  const [selectedRole, setSelectedRole] = useState<string>('Frontend Developer');

  // Confirmation Modal state
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  // Status Tracker prefill
  const [trackerCreds, setTrackerCreds] = useState<{ appId: string; email: string }>({
    appId: '',
    email: '',
  });

  // Offer Letter preview modal
  const [offerLetterApp, setOfferLetterApp] = useState<Application | null>(null);

  // Verification Checklist modal
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);

  // Firestore connection status
  const [dbStatus, setDbStatus] = useState<{ checked: boolean; ok: boolean; message: string }>({
    checked: false,
    ok: false,
    message: 'Connecting to Firestore...',
  });

  useEffect(() => {
    // Validate Firestore connection on boot (Skill requirement)
    testConnection().then((res) => {
      setDbStatus({
        checked: true,
        ok: res.ok,
        message: res.message,
      });
    });
  }, []);

  const handleSelectRole = (roleTitle: string) => {
    setSelectedRole(roleTitle);
    setActiveView('apply');
    // Scroll to form smoothly
    setTimeout(() => {
      const formEl = document.getElementById('application-form-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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

  // Render initial Security Gateway / Sign-In Screen
  if (activeView === 'auth') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        <SignInGateway
          onAdminLogin={(adminEmail) => {
            setActiveView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onApplicantAccess={() => {
            setActiveView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTrackStatusAccess={() => {
            setActiveView('track');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenChecklist={() => setIsChecklistOpen(true)}
        />

        {/* 20-Point E2E Verification Checklist Modal */}
        <VerificationChecklistModal
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          onNavigateToApply={() => {
            setActiveView('apply');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToTrack={() => {
            setActiveView('track');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToAdmin={() => {
            setActiveView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Banner if offline */}
      {dbStatus.checked && !dbStatus.ok && (
        <div className="bg-amber-500/20 text-amber-300 text-xs py-2 px-4 border-b border-amber-500/30 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Note: {dbStatus.message}. Verify network connection for real-time Firestore persistence.</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenChecklist={() => setIsChecklistOpen(true)}
        isAdminLoggedIn={true}
        onSignOut={() => {
          setActiveView('auth');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <Hero
              onApplyClick={() => {
                setActiveView('apply');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTrackClick={() => {
                setActiveView('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreRoles={() => {
                const el = document.getElementById('roles-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <RolesSection onSelectRole={handleSelectRole} />
            <ApplicationForm
              selectedRoleFromHero={selectedRole}
              onSuccess={handleApplicationSubmitted}
            />
          </>
        )}

        {activeView === 'apply' && (
          <ApplicationForm
            selectedRoleFromHero={selectedRole}
            onSuccess={handleApplicationSubmitted}
          />
        )}

        {activeView === 'track' && (
          <StatusTracker
            initialAppId={trackerCreds.appId}
            initialEmail={trackerCreds.email}
            onViewOfferLetter={(app) => setOfferLetterApp(app)}
          />
        )}

        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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

      {/* Digital Offer Letter Modal */}
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
        onNavigateToApply={() => {
          setActiveView('apply');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToTrack={() => {
          setActiveView('track');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToAdmin={() => {
          setActiveView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
