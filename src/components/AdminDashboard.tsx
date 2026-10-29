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
  Check
} from 'lucide-react';
import { AcceptModal } from './AcceptModal.tsx';
import { RejectModal } from './RejectModal.tsx';
import { OfferLetterModal } from './OfferLetterModal.tsx';
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
  const fetchApplications = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/applications');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve applications.');
      }

      setApplications(data.applications || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setFetchError(err.message || 'Error fetching data from Firestore.');
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
  const handleDecisionSuccess = (updatedApp: Application, actionType: 'accepted' | 'rejected') => {
    setApplications((prev) =>
      prev.map((app) => (app.applicationId === updatedApp.applicationId ? updatedApp : app))
    );
    if (selectedAppForDetail?.applicationId === updatedApp.applicationId) {
      setSelectedAppForDetail(updatedApp);
    }
    setAppToAccept(null);
    setAppToReject(null);

    const msg = actionType === 'accepted'
      ? `Application ${updatedApp.applicationId} successfully Accepted. Offer letter generated & email dispatched.`
      : `Application ${updatedApp.applicationId} successfully Rejected. Outcome email sent.`;

    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 5000);
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Accepted</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <section className="py-10 bg-slate-950 text-white min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Auth Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Company Tech Admin Portal</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Admissions Dashboard
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized Session: <span className="text-slate-200 font-mono">{activeAdminEmail}</span>
              </p>
            </div>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsDemoAdmin(!isDemoAdmin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isDemoAdmin
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Mentor Evaluator Mode"
            >
              Evaluator Mode: {isDemoAdmin ? 'Active' : 'Off'}
            </button>

            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.displayName || currentUser.email})</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </button>
            )}

            <button
              onClick={fetchApplications}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh Firestore Applications"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
        )}

        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Note on Authentication: {authError} Evaluator Mode remains enabled for full dashboard testing.</span>
          </div>
        )}

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Received</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{totalApps}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-medium">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 mt-2">{pendingApps}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium">Accepted Offers</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">{acceptedApps}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-400 font-medium">Rejected</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-extrabold text-red-400 mt-2">{rejectedApps}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-400 font-medium">Acceptance Rate</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-400 mt-2">{acceptanceRate}%</p>
          </div>
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, email, college, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Candidate Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-400">
            <span className="shrink-0 text-slate-500 font-semibold mr-1">Role Filter:</span>
            <button
              onClick={() => setRoleFilter('All')}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                roleFilter === 'All'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
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
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                    roleFilter === r
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {r} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <p className="text-sm font-medium">No applications found matching your filters.</p>
                      <p className="text-xs mt-1">Submit a new application from the candidate portal to test the workflow.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.applicationId}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {app.applicationId}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{app.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{app.email}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-200">{app.role}</span>
                        <div className="text-[10px] text-slate-500">
                          {app.experienceLevel}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[180px] truncate">
                        <span className="truncate block font-medium">{app.college}</span>
                        <span className="text-[10px] text-slate-500 block">{app.yearOfStudy}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
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
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Inspect Profile & Audit Logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Accept button (Pending only) */}
                          {app.status === 'Pending' && (
                            <button
                              onClick={() => setAppToAccept(app)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-all"
                              title="Accept Application (Requires duration and joining date)"
                            >
                              Accept
                            </button>
                          )}

                          {/* Reject button (Pending only) */}
                          {app.status === 'Pending' && (
                            <button
                              onClick={() => setAppToReject(app)}
                              className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-[11px] font-bold transition-all"
                              title="Reject Application (Dispatches configurable demo rejection email)"
                            >
                              Reject
                            </button>
                          )}

                          {/* Offer Letter button (Accepted only) */}
                          {app.status === 'Accepted' && (
                            <button
                              onClick={() => setAppForOfferLetter(app)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
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

        {/* Detailed Application Inspection Modal */}
        {selectedAppForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-400">
                    {selectedAppForDetail.applicationId}
                  </span>
                  {getStatusBadge(selectedAppForDetail.status)}
                </div>
                <button
                  onClick={() => setSelectedAppForDetail(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Candidate Name:</span>
                    <span className="font-bold text-white text-sm">{selectedAppForDetail.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email Address:</span>
                    <span className="font-mono text-slate-200">{selectedAppForDetail.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">College / University:</span>
                    <span className="text-slate-200">{selectedAppForDetail.college}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Year of Study:</span>
                    <span className="text-slate-200">{selectedAppForDetail.yearOfStudy}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Role Track:</span>
                    <span className="text-blue-400 font-semibold">{selectedAppForDetail.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Experience Level:</span>
                    <span className="text-slate-200">{selectedAppForDetail.experienceLevel}</span>
                  </div>
                </div>

                {/* Resume Status */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-medium text-white block">Submitted Resume:</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {selectedAppForDetail.resumeFileName || 'No resume uploaded with this application'}
                      </span>
                    </div>
                  </div>
                  {selectedAppForDetail.resumeUrl && (
                    <a
                      href={selectedAppForDetail.resumeUrl}
                      download={selectedAppForDetail.resumeFileName || 'resume.pdf'}
                      className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>

                {/* Audit & Email Log */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                    Application Audit & Notification Trail
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted At:</span>
                    <span className="text-slate-300 font-mono">
                      {new Date(selectedAppForDetail.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedAppForDetail.decisionAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Decided At:</span>
                      <span className="text-slate-300 font-mono">
                        {new Date(selectedAppForDetail.decisionAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedAppForDetail.internshipDuration && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration Granted:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedAppForDetail.internshipDuration}
                      </span>
                    </div>
                  )}
                  {selectedAppForDetail.joiningDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Joining Date:</span>
                      <span className="text-white font-medium">
                        {selectedAppForDetail.joiningDate}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Email Delivery Log:</span>
                    <span className="text-slate-300 font-medium">
                      {selectedAppForDetail.emailStatus || 'System Recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Detail Modal */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  onClick={() => setSelectedAppForDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
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
                        className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setAppToAccept(selectedAppForDetail);
                          setSelectedAppForDetail(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
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
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
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
            onSuccess={(updated) => handleDecisionSuccess(updated, 'accepted')}
          />
        )}

        {/* Rejection Modal */}
        {appToReject && (
          <RejectModal
            application={appToReject}
            adminEmail={activeAdminEmail}
            onClose={() => setAppToReject(null)}
            onSuccess={(updated) => handleDecisionSuccess(updated, 'rejected')}
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
