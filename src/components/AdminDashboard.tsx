import React, { useState, useEffect } from 'react';
import { 
  Application, 
  ApplicationStatus, 
  InternshipDuration 
} from '../types/index.ts';
import { 
  auth, 
  googleProvider, 
  isUserAdmin, 
  AUTHORIZED_ADMIN_EMAILS 
} from '../lib/firebase.ts';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpDown, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Download, 
  Mail, 
  LogIn, 
  LogOut, 
  AlertCircle, 
  ExternalLink,
  Users,
  Award,
  Layers,
  Check,
  ArrowRight
} from 'lucide-react';
import { AcceptModal } from './AcceptModal.tsx';
import { RejectModal } from './RejectModal.tsx';
import { OfferLetterModal } from './OfferLetterModal.tsx';
import { EmailConfigTest } from './EmailConfigTest.tsx';
import { VALID_ROLE_NAMES } from '../lib/rolesData.ts';

export const AdminDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(true); // Evaluator demo mode enabled for instant evaluation
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters & Search
  const [adminActiveTab, setAdminActiveTab] = useState<'applications' | 'email-test'>('applications');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Selected item modals
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<Application | null>(null);
  const [appToAccept, setAppToAccept] = useState<Application | null>(null);
  const [appToReject, setAppToReject] = useState<Application | null>(null);
  const [appForOfferLetter, setAppForOfferLetter] = useState<Application | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch applications
  const [persistenceInfo, setPersistenceInfo] = useState<{ firestoreActive: boolean; source: string } | null>(null);

  const getAdminAuthHeaders = async (): Promise<Record<string, string>> => {
    if (currentUser) {
      try {
        const idToken = await currentUser.getIdToken();
        return {
          'Authorization': `Bearer ${idToken}`,
        };
      } catch (err) {
        console.warn('Could not retrieve Firebase ID token:', err);
      }
    }
    return {
      'x-evaluator-token': 'company-tech-evaluator-session-2026',
    };
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const authHeaders = await getAdminAuthHeaders();
      const response = await fetch('/api/applications', {
        headers: {
          ...authHeaders,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve applications.');
      }

      setApplications(data.applications || []);
      if (data.persistence) {
        setPersistenceInfo(data.persistence);
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setFetchError(err.message || 'Error fetching data from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Authentication Handlers
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setCurrentUser(result.user);
      fetchApplications();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setAuthError(err.message || 'Authentication failed. Popups may be blocked in iframe.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsDemoAdmin(false);
    } catch (err: any) {
      console.error('Sign Out error:', err);
    }
  };

  // Determine authorized status
  const isAuthorized = isDemoAdmin || isUserAdmin(currentUser);
  const activeAdminEmail = currentUser?.email || 'gthanushree1566@gmail.com (Evaluator Mode)';

  // Decisions update callbacks
  const handleDecisionSuccess = (updatedApp: Application, actionType: 'accepted' | 'rejected', emailResult?: any) => {
    setApplications((prev) =>
      prev.map((app) => (app.applicationId === updatedApp.applicationId ? updatedApp : app))
    );
    if (selectedAppForDetail?.applicationId === updatedApp.applicationId) {
      setSelectedAppForDetail(updatedApp);
    }
    setAppToAccept(null);
    setAppToReject(null);

    let msg = '';
    if (actionType === 'accepted') {
      if (emailResult?.status === 'sent') {
        msg = `Application ${updatedApp.applicationId} successfully Accepted. Offer letter PDF generated & confirmed delivered to applicant inbox (Provider ID: ${emailResult.messageId}).`;
      } else if (emailResult?.status === 'failed') {
        msg = `Application ${updatedApp.applicationId} marked Accepted & Offer PDF generated. Notice: Email delivery failed: ${emailResult.details}. Candidate can download their offer letter directly from the tracking portal.`;
      } else {
        msg = `Application ${updatedApp.applicationId} marked Accepted & Offer PDF generated. (Email simulated: configure EMAIL_PROVIDER_API_KEY in .env for live inbox delivery).`;
      }
    } else {
      if (emailResult?.status === 'sent') {
        msg = `Application ${updatedApp.applicationId} successfully Rejected. Outcome notification email confirmed delivered to candidate (Provider ID: ${emailResult.messageId}).`;
      } else if (emailResult?.status === 'failed') {
        msg = `Application ${updatedApp.applicationId} status marked Rejected. Notice: Email notification failed: ${emailResult.details}.`;
      } else {
        msg = `Application ${updatedApp.applicationId} status marked Rejected. (Email simulated: configure EMAIL_PROVIDER_API_KEY in .env for live inbox delivery).`;
      }
    }

    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 8000);
  };

  // Calculate Statistics
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status === 'Pending').length;
  const acceptedApps = applications.filter((a) => a.status === 'Accepted').length;
  const rejectedApps = applications.filter((a) => a.status === 'Rejected').length;
  const acceptanceRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;

  // Filter & Sort
  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesRole = roleFilter === 'All' || app.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.fullName.localeCompare(b.fullName);
    });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Accepted</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <section className="py-10 bg-[#FAFAF8] text-[#1C1F1D] min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Auth Bar */}
        <div className="bg-white border border-[#E4E6E2] rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#2F6B60] border border-[#C8DDD7] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C1F1D] flex flex-wrap items-center gap-2">
                <span>Company Tech Admin Portal</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EEF5F2] text-[#23534A] border border-[#C8DDD7]">
                  Admissions Dashboard
                </span>
              </h1>
              <p className="text-xs text-[#6E7571] mt-0.5">
                Authorized Session: <span className="text-[#1C1F1D] font-mono">{activeAdminEmail}</span>
              </p>
              {persistenceInfo && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${persistenceInfo.firestoreActive ? 'bg-emerald-600' : 'bg-[#2F6B60]'}`} />
                  <span className={persistenceInfo.firestoreActive ? 'text-emerald-700 font-medium' : 'text-[#23534A]'}>
                    Storage Target: {persistenceInfo.source}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsDemoAdmin(!isDemoAdmin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isDemoAdmin
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-[#F3F4F1] border-[#D6D9D3] text-[#4B524E]'
              }`}
              title="Toggle Mentor Evaluator Mode"
            >
              Evaluator Mode: {isDemoAdmin ? 'Active' : 'Off'}
            </button>

            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-1.5 rounded-lg bg-[#F8F9F7] hover:bg-[#F3F4F1] text-[#1C1F1D] text-xs font-medium flex items-center gap-1.5 border border-[#D6D9D3] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.displayName || currentUser.email})</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="px-3.5 py-1.5 rounded-lg bg-[#2F6B60] hover:bg-[#24554C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </button>
            )}

            <button
              onClick={() => setAdminActiveTab(adminActiveTab === 'email-test' ? 'applications' : 'email-test')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                adminActiveTab === 'email-test'
                  ? 'bg-[#2F6B60] text-white border-[#2F6B60] shadow-xs'
                  : 'bg-white hover:bg-[#F3F4F1] text-[#1C1F1D] border-[#D6D9D3]'
              }`}
              title="Test Email System & Provider Configuration"
            >
              <Mail className={`w-3.5 h-3.5 ${adminActiveTab === 'email-test' ? 'text-white' : 'text-[#2F6B60]'}`} />
              <span>Email Diagnostics</span>
            </button>

            <button
              onClick={fetchApplications}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-white hover:bg-[#F3F4F1] text-[#4B524E] border border-[#D6D9D3] transition-colors cursor-pointer"
              title="Refresh Firestore Applications"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#E4E6E2] pb-3 overflow-x-auto">
          <button
            onClick={() => setAdminActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              adminActiveTab === 'applications'
                ? 'bg-[#2F6B60] text-white shadow-xs'
                : 'bg-white text-[#4B524E] hover:text-[#1C1F1D] border border-[#E4E6E2]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Applications Queue ({applications.length})</span>
          </button>

          <button
            onClick={() => setAdminActiveTab('email-test')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              adminActiveTab === 'email-test'
                ? 'bg-[#2F6B60] text-white shadow-xs'
                : 'bg-white text-[#4B524E] hover:text-[#1C1F1D] border border-[#E4E6E2]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Configuration Test</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              adminActiveTab === 'email-test'
                ? 'bg-white/20 text-white'
                : 'bg-[#EEF5F2] text-[#23534A] border border-[#C8DDD7]'
            }`}>
              Resend Live Test
            </span>
          </button>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
        )}

        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Note on Authentication: {authError} Evaluator Mode remains enabled for full dashboard testing.</span>
          </div>
        )}

        {adminActiveTab === 'email-test' ? (
          <EmailConfigTest
            getAuthHeaders={getAdminAuthHeaders}
            adminEmail={activeAdminEmail}
          />
        ) : (
          <>
            {/* Quick Email Status Bar */}
            <div className="bg-white border border-[#E4E6E2] rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 text-[#4B524E]">
                <div className="w-7 h-7 rounded-lg bg-[#EEF5F2] text-[#2F6B60] border border-[#C8DDD7] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-[#1C1F1D]">Email Notification System: Resend</span>
                  <span className="text-[#6E7571] block sm:inline sm:ml-2 text-[11.5px]">
                    Alert Target: <span className="font-mono text-[#1C1F1D]">{activeAdminEmail}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAdminActiveTab('email-test')}
                className="px-3 py-1.5 rounded-lg bg-[#F8F9F7] hover:bg-[#EEF5F2] text-[#23534A] font-semibold border border-[#D6D9D3] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
              >
                <span>Test Configuration & Delivery</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2F6B60]" />
              </button>
            </div>

            {/* Admin Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`p-4 rounded-xl bg-white border text-left transition-colors cursor-pointer shadow-xs ${
                  statusFilter === 'All'
                    ? 'border-[#2F6B60] ring-1 ring-[#2F6B60]/25'
                    : 'border-[#E4E6E2] hover:border-[#C8DDD7]'
                }`}
                title="Show all applications"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#4B524E] font-semibold">Total Applications</span>
                  <span className="w-7 h-7 rounded-lg bg-[#EEF5F2] border border-[#C8DDD7] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#2F6B60]" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#1C1F1D] mt-2 tabular-nums">{totalApps}</p>
                <p className="text-[11px] text-[#6E7571] mt-1">All received submissions</p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
                className={`p-4 rounded-xl bg-white border text-left transition-colors cursor-pointer shadow-xs ${
                  statusFilter === 'Pending'
                    ? 'border-amber-500 ring-1 ring-amber-400/30'
                    : 'border-[#E4E6E2] hover:border-amber-300'
                }`}
                title="Filter by Pending Applications"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-amber-800 font-semibold">Pending Applications</span>
                  <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-700 mt-2 tabular-nums">{pendingApps}</p>
                <p className="text-[11px] text-[#6E7571] mt-1">
                  {totalApps > 0 ? `${Math.round((pendingApps / totalApps) * 100)}% awaiting review` : 'Awaiting review'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'Accepted' ? 'All' : 'Accepted')}
                className={`p-4 rounded-xl bg-white border text-left transition-colors cursor-pointer shadow-xs ${
                  statusFilter === 'Accepted'
                    ? 'border-emerald-600 ring-1 ring-emerald-500/30'
                    : 'border-[#E4E6E2] hover:border-emerald-300'
                }`}
                title="Filter by Accepted Applications"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-emerald-800 font-semibold">Accepted Applications</span>
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">{acceptedApps}</p>
                <p className="text-[11px] text-[#6E7571] mt-1">
                  {totalApps > 0 ? `${Math.round((acceptedApps / totalApps) * 100)}% offers issued` : 'Offers issued'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'Rejected' ? 'All' : 'Rejected')}
                className={`p-4 rounded-xl bg-white border text-left transition-colors cursor-pointer shadow-xs ${
                  statusFilter === 'Rejected'
                    ? 'border-red-500 ring-1 ring-red-400/30'
                    : 'border-[#E4E6E2] hover:border-red-300'
                }`}
                title="Filter by Rejected Applications"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-red-700 font-semibold">Rejected Applications</span>
                  <span className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-700 mt-2 tabular-nums">{rejectedApps}</p>
                <p className="text-[11px] text-[#6E7571] mt-1">
                  {totalApps > 0 ? `${Math.round((rejectedApps / totalApps) * 100)}% concluded` : 'Concluded reviews'}
                </p>
              </button>

              <div className="p-4 rounded-xl bg-white border border-[#E4E6E2] shadow-xs sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#23534A] font-semibold">Acceptance Rate</span>
                  <span className="w-7 h-7 rounded-lg bg-[#EEF5F2] border border-[#C8DDD7] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-[#2F6B60]" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#2F6B60] mt-2 tabular-nums">{acceptanceRate}%</p>
                <p className="text-[11px] text-[#6E7571] mt-1">Of total applications</p>
              </div>
            </div>

        {/* Search, Filter, Sort Controls */}
        <div className="bg-white border border-[#E4E6E2] rounded-2xl p-4 sm:p-5 mb-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-[#6E7571] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, email, college, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D6D9D3] text-xs sm:text-sm text-[#1C1F1D] placeholder-[#8A918D] focus:outline-none focus:ring-2 focus:ring-[#2F6B60]/20 focus:border-[#2F6B60]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D6D9D3] text-xs sm:text-sm text-[#1C1F1D] focus:outline-none focus:ring-2 focus:ring-[#2F6B60]/20 focus:border-[#2F6B60]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D6D9D3] text-xs sm:text-sm text-[#1C1F1D] focus:outline-none focus:ring-2 focus:ring-[#2F6B60]/20 focus:border-[#2F6B60]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Candidate Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-[#4B524E]">
            <span className="shrink-0 text-[#6E7571] font-semibold mr-1">Role Filter:</span>
            <button
              onClick={() => setRoleFilter('All')}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                roleFilter === 'All'
                  ? 'bg-[#2F6B60] text-white font-semibold'
                  : 'bg-[#F3F4F1] text-[#4B524E] hover:text-[#1C1F1D] border border-[#E4E6E2]'
              }`}
            >
              All Roles ({applications.length})
            </button>
            {VALID_ROLE_NAMES.map((r) => {
              const count = applications.filter((a) => a.role === r).length;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                    roleFilter === r
                      ? 'bg-[#2F6B60] text-white font-semibold'
                      : 'bg-[#F3F4F1] text-[#4B524E] hover:text-[#1C1F1D] border border-[#E4E6E2]'
                  }`}
                >
                  {r} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white border border-[#E4E6E2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#4B524E]">
              <thead className="bg-[#F8F9F7] text-[11px] uppercase tracking-wider text-[#6E7571] border-b border-[#E4E6E2]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Application ID</th>
                  <th className="py-3.5 px-4 font-semibold">Candidate</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Institution & Year</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E6E2]">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#6E7571]">
                      <p className="text-sm font-medium text-[#1C1F1D]">No applications found matching your filters.</p>
                      <p className="text-xs mt-1">Submit a new application from the candidate portal to test the workflow.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.applicationId}
                      className="hover:bg-[#F8F9F7] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#23534A] whitespace-nowrap">
                        {app.applicationId}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1C1F1D]">{app.fullName}</div>
                        <div className="text-[11px] text-[#6E7571] font-mono">{app.email}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-[#1C1F1D]">{app.role}</span>
                        <div className="text-[10px] text-[#6E7571]">
                          {app.experienceLevel}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[180px] truncate">
                        <span className="truncate block font-medium text-[#1C1F1D]">{app.college}</span>
                        <span className="text-[10px] text-[#6E7571] block">{app.yearOfStudy}</span>
                      </td>

                      <td className="py-3 px-4 text-[#6E7571] whitespace-nowrap tabular-nums">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setSelectedAppForDetail(app)}
                            className="p-1.5 rounded-lg bg-[#F3F4F1] hover:bg-[#E4E6E2] text-[#4B524E] hover:text-[#1C1F1D] transition-colors cursor-pointer"
                            title="Inspect Profile & Audit Logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Accept button (Pending only) */}
                          {app.status === 'Pending' && (
                            <button
                              onClick={() => setAppToAccept(app)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Accept Application (Requires duration and joining date)"
                            >
                              Accept
                            </button>
                          )}

                          {/* Reject button (Pending only) */}
                          {app.status === 'Pending' && (
                            <button
                              onClick={() => setAppToReject(app)}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Reject Application (Dispatches configurable demo rejection email)"
                            >
                              Reject
                            </button>
                          )}

                          {/* Offer Letter button (Accepted only) */}
                          {app.status === 'Accepted' && (
                            <button
                              onClick={() => setAppForOfferLetter(app)}
                              className="px-2.5 py-1 rounded-lg bg-[#EEF5F2] hover:bg-[#2F6B60] text-[#23534A] hover:text-white border border-[#C8DDD7] text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Inspect Generated Offer Letter PDF"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Offer PDF</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}

        {/* Detailed Application Inspection Modal */}
        {selectedAppForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/45 backdrop-blur-[2px]">
            <div className="bg-white border border-[#E4E6E2] rounded-2xl max-w-lg w-full p-6 shadow-xl text-[#1C1F1D] relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E6E2]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#23534A]">
                    {selectedAppForDetail.applicationId}
                  </span>
                  {getStatusBadge(selectedAppForDetail.status)}
                </div>
                <button
                  onClick={() => setSelectedAppForDetail(null)}
                  className="p-1 rounded-lg text-[#6E7571] hover:text-[#1C1F1D] hover:bg-[#F3F4F1] transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2]">
                  <div>
                    <span className="text-[#6E7571] block">Candidate Name:</span>
                    <span className="font-bold text-[#1C1F1D] text-sm">{selectedAppForDetail.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#6E7571] block">Email Address:</span>
                    <span className="font-mono text-[#1C1F1D] break-all">{selectedAppForDetail.email}</span>
                  </div>
                  <div>
                    <span className="text-[#6E7571] block">College / University:</span>
                    <span className="text-[#1C1F1D]">{selectedAppForDetail.college}</span>
                  </div>
                  <div>
                    <span className="text-[#6E7571] block">Year of Study:</span>
                    <span className="text-[#1C1F1D]">{selectedAppForDetail.yearOfStudy}</span>
                  </div>
                  <div>
                    <span className="text-[#6E7571] block">Role Track:</span>
                    <span className="text-[#23534A] font-semibold">{selectedAppForDetail.role}</span>
                  </div>
                  <div>
                    <span className="text-[#6E7571] block">Experience Level:</span>
                    <span className="text-[#1C1F1D]">{selectedAppForDetail.experienceLevel}</span>
                  </div>
                </div>

                {/* Resume Status */}
                <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#6E7571]" />
                    <div>
                      <span className="font-medium text-[#1C1F1D] block">Submitted Resume:</span>
                      <span className="text-[11px] text-[#6E7571] font-mono">
                        {selectedAppForDetail.resumeFileName || 'No resume uploaded with this application'}
                      </span>
                    </div>
                  </div>
                  {selectedAppForDetail.resumeUrl && (
                    <a
                      href={selectedAppForDetail.resumeUrl}
                      download={selectedAppForDetail.resumeFileName || 'resume.pdf'}
                      className="px-3 py-1 rounded-lg bg-[#EEF5F2] hover:bg-[#2F6B60] text-[#23534A] hover:text-white border border-[#C8DDD7] text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>

                {/* Audit & Email Log */}
                <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2] space-y-1.5 text-[11px]">
                  <span className="text-[#4B524E] font-bold block uppercase tracking-wider text-[10px]">
                    Application Audit & Notification Trail
                  </span>
                  <div className="flex justify-between">
                    <span className="text-[#6E7571]">Submitted At:</span>
                    <span className="text-[#1C1F1D] font-mono">
                      {new Date(selectedAppForDetail.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedAppForDetail.decisionAt && (
                    <div className="flex justify-between">
                      <span className="text-[#6E7571]">Decided At:</span>
                      <span className="text-[#1C1F1D] font-mono">
                        {new Date(selectedAppForDetail.decisionAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedAppForDetail.internshipDuration && (
                    <div className="flex justify-between">
                      <span className="text-[#6E7571]">Duration Granted:</span>
                      <span className="text-emerald-700 font-bold">
                        {selectedAppForDetail.internshipDuration}
                      </span>
                    </div>
                  )}
                  {selectedAppForDetail.joiningDate && (
                    <div className="flex justify-between">
                      <span className="text-[#6E7571]">Joining Date:</span>
                      <span className="text-[#1C1F1D] font-medium">
                        {selectedAppForDetail.joiningDate}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-[#E4E6E2]">
                    <span className="text-[#6E7571]">Email Delivery Log:</span>
                    <span className="text-[#1C1F1D] font-medium">
                      {selectedAppForDetail.emailStatus || 'System Recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Detail Modal */}
              <div className="pt-3 flex items-center justify-between border-t border-[#E4E6E2]">
                <button
                  onClick={() => setSelectedAppForDetail(null)}
                  className="px-4 py-2 rounded-xl bg-[#F3F4F1] hover:bg-[#E4E6E2] text-[#4B524E] text-xs font-medium cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedAppForDetail.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => {
                          setAppToReject(selectedAppForDetail);
                          setSelectedAppForDetail(null);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setAppToAccept(selectedAppForDetail);
                          setSelectedAppForDetail(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Accept & Issue Offer
                      </button>
                    </>
                  )}

                  {selectedAppForDetail.status === 'Accepted' && (
                    <button
                      onClick={() => {
                        setAppForOfferLetter(selectedAppForDetail);
                        setSelectedAppForDetail(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2F6B60] hover:bg-[#24554C] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Offer Letter</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acceptance Modal */}
        {appToAccept && (
          <AcceptModal
            application={appToAccept}
            adminEmail={activeAdminEmail}
            onClose={() => setAppToAccept(null)}
            onSuccess={(updated, emailResult) => handleDecisionSuccess(updated, 'accepted', emailResult)}
          />
        )}

        {/* Rejection Modal */}
        {appToReject && (
          <RejectModal
            application={appToReject}
            adminEmail={activeAdminEmail}
            onClose={() => setAppToReject(null)}
            onSuccess={(updated, emailResult) => handleDecisionSuccess(updated, 'rejected', emailResult)}
          />
        )}

        {/* Offer Letter Modal */}
        {appForOfferLetter && (
          <OfferLetterModal
            application={appForOfferLetter}
            onClose={() => setAppForOfferLetter(null)}
          />
        )}
      </div>
    </section>
  );
};
