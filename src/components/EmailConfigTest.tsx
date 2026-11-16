import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  AtSign, 
  Copy, 
  Check, 
  Info,
  Server
} from 'lucide-react';

interface EmailConfigTestProps {
  getAuthHeaders: () => Promise<Record<string, string>>;
  adminEmail: string;
}

interface EmailConfig {
  apiKeyConfigured: boolean;
  apiKeyValidFormat: boolean;
  apiKeyMasked: string;
  emailFrom: string;
  supportEmail: string;
  adminEmail: string;
  resendSandboxNotice?: string;
}

interface DiagnosticResult {
  success: boolean;
  category: string;
  statusCode?: number;
  messageId?: string;
  message?: string;
  error?: string;
  details?: string;
  guidance?: string;
  deliveryNote?: string;
  recipient?: string;
  timestamp: string;
}

export const EmailConfigTest: React.FC<EmailConfigTestProps> = ({ getAuthHeaders, adminEmail }) => {
  const [recipient, setRecipient] = useState(adminEmail || 'gthanushree1566@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load active email configuration
  const loadConfig = async () => {
    setIsLoadingConfig(true);
    setConfigError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/email-config', { headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load email configuration.');
      }
      setConfig(data.config);
    } catch (err: any) {
      console.error('Error fetching email configuration:', err);
      setConfigError(err.message || 'Unable to retrieve email settings.');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) return;

    setIsSending(true);
    setResult(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ recipient: recipient.trim() }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error executing test email:', err);
      setResult({
        success: false,
        category: 'network_error',
        error: err.message || 'Failed to connect to backend test service.',
        details: 'An unexpected client or network error occurred during test execution.',
        guidance: 'Verify backend server is running and reachable.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyMessageId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E4E6E2] rounded-2xl p-5 sm:p-6 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E4E6E2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#2F6B60] border border-[#C8DDD7] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1C1F1D] flex flex-wrap items-center gap-2">
              <span>Email Configuration & Live Delivery Test</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EEF5F2] text-[#23534A] border border-[#C8DDD7]">
                Resend Integration
              </span>
            </h2>
            <p className="text-xs text-[#6E7571] mt-0.5">
              Verify API credentials, inspect provider status, and dispatch a real test message to confirm delivery readiness.
            </p>
          </div>
        </div>

        <button
          onClick={loadConfig}
          disabled={isLoadingConfig}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#F8F9F7] hover:bg-[#F3F4F1] text-[#1C1F1D] text-xs font-medium flex items-center gap-1.5 border border-[#D6D9D3] transition-colors cursor-pointer"
          title="Reload environment configuration"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingConfig ? 'animate-spin' : ''}`} />
          <span>Reload Settings</span>
        </button>
      </div>

      {configError && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>Configuration Warning: {configError}</span>
        </div>
      )}

      {/* Configuration Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
        {/* EMAIL_PROVIDER_API_KEY */}
        <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2]">
          <div className="flex items-center justify-between text-xs text-[#4B524E]">
            <span className="font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2F6B60]" />
              EMAIL_PROVIDER_API_KEY
            </span>
            {config?.apiKeyConfigured && config?.apiKeyValidFormat ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            ) : config?.apiKeyConfigured ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                FORMAT ISSUE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                NOT SET
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-[#1C1F1D] mt-2 truncate">
            {config ? config.apiKeyMasked : 'Loading...'}
          </p>
          <p className="text-[11px] text-[#6E7571] mt-1">
            {config?.apiKeyConfigured
              ? 'Key detected in environment (format validated)'
              : 'Required for real Resend email delivery'}
          </p>
        </div>

        {/* EMAIL_FROM */}
        <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2]">
          <div className="flex items-center justify-between text-xs text-[#4B524E]">
            <span className="font-semibold flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#2F6B60]" />
              EMAIL_FROM (Sender)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF5F2] text-[#23534A] border border-[#C8DDD7]">
              CONFIGURED
            </span>
          </div>
          <p className="text-xs font-mono text-[#1C1F1D] mt-2 truncate">
            {config ? config.emailFrom : 'Loading...'}
          </p>
          <p className="text-[11px] text-[#6E7571] mt-1">
            Configured sender address for all system emails
          </p>
        </div>

        {/* SUPPORT_EMAIL */}
        <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2]">
          <div className="flex items-center justify-between text-xs text-[#4B524E]">
            <span className="font-semibold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#2F6B60]" />
              SUPPORT_EMAIL (Alert Target)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF5F2] text-[#23534A] border border-[#C8DDD7]">
              ADMIN TARGET
            </span>
          </div>
          <p className="text-xs font-mono text-[#1C1F1D] mt-2 truncate">
            {config ? config.supportEmail : 'Loading...'}
          </p>
          <p className="text-[11px] text-[#6E7571] mt-1">
            Receives real-time intake notifications on new submissions
          </p>
        </div>
      </div>

      {/* Resend Sandbox Guidance Advisory */}
      <div className="mt-4 p-3.5 rounded-xl bg-[#EEF5F2]/70 border border-[#C8DDD7] text-xs text-[#4B524E] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#2F6B60] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#23534A]">Resend Provider Delivery Rules:</p>
          <p className="text-[#4B524E] leading-relaxed text-[11.5px]">
            When using Resend&apos;s free sandbox domain (<code className="font-mono text-[#1C1F1D]">onboarding@resend.dev</code>), Resend policy strictly allows deliveries to the registered Resend account address (<strong className="text-[#1C1F1D] font-mono">{config?.adminEmail || adminEmail}</strong>). To send to student/applicant email domains, add and verify a custom domain in your Resend Dashboard.
          </p>
        </div>
      </div>

      {/* Interactive Test Form */}
      <form onSubmit={handleSendTestEmail} className="mt-5 p-4 rounded-xl bg-[#F8F9F7] border border-[#E4E6E2]">
        <label className="block text-xs font-semibold text-[#4B524E] mb-1.5">
          Test Recipient Email Address
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-[#6E7571] absolute left-3 top-3" />
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. gthanushree1566@gmail.com"
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#D6D9D3] text-xs sm:text-sm text-[#1C1F1D] placeholder-[#8A918D] focus:outline-none focus:ring-2 focus:ring-[#2F6B60]/20 focus:border-[#2F6B60]"
            />
          </div>

          <button
            type="button"
            onClick={() => setRecipient(adminEmail || 'gthanushree1566@gmail.com')}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-[#F3F4F1] text-[#1C1F1D] text-xs font-medium border border-[#D6D9D3] transition-colors shrink-0 cursor-pointer"
            title="Use registered Administrator email"
          >
            Use Admin Email
          </button>

          <button
            type="submit"
            disabled={isSending || !recipient.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#2F6B60] hover:bg-[#24554C] disabled:bg-[#D6D9D3] disabled:text-[#6E7571] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Contacting Resend...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Test Email</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-[#6E7571] mt-2">
          Note: This triggers a real HTTPS request to the Resend API endpoint (<code className="font-mono">https://api.resend.com/emails</code>). No mock responses are used.
        </p>
      </form>

      {/* Actual Provider Results Display */}
      {result && (
        <div className={`mt-5 p-4 sm:p-5 rounded-xl border ${
          result.success 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-red-50/70 border-red-200 text-red-900'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-sm text-[#1C1F1D]">
                  {result.success ? 'Email Accepted by Resend Provider' : 'Email Test Result: Action Required'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  result.success 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {result.category.toUpperCase()} {result.statusCode ? `(HTTP ${result.statusCode})` : ''}
                </span>
              </div>

              {/* Message Details */}
              <p className="text-xs sm:text-sm text-[#4B524E] leading-relaxed">
                {result.message || result.error}
              </p>

              {/* Message ID for successful dispatch */}
              {result.messageId && (
                <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6E7571] font-semibold">Resend Message ID:</span>
                    <span className="font-mono text-emerald-800 font-bold">{result.messageId}</span>
                  </div>
                  <button
                    onClick={() => copyMessageId(result.messageId!)}
                    className="p-1 rounded hover:bg-[#F3F4F1] text-[#4B524E] hover:text-[#1C1F1D] transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Copy message ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}

              {/* Detailed Technical Details */}
              {result.details && (
                <div className="text-xs bg-white p-2.5 rounded-lg border border-[#E4E6E2] text-[#4B524E]">
                  <span className="font-semibold text-[#6E7571] block mb-0.5">Provider Response / Technical Details:</span>
                  <span className="font-mono text-[11px] break-all text-[#1C1F1D]">{result.details}</span>
                </div>
              )}

              {/* Guidance / Actionable Solution */}
              {result.guidance && (
                <div className="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Recommended Resolution:</span>
                    <span className="leading-relaxed">{result.guidance}</span>
                  </div>
                </div>
              )}

              {/* Explicit Delivery Status Notice */}
              <div className="pt-2 text-[11px] text-[#6E7571] flex items-center gap-1.5 border-t border-[#E4E6E2]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B60] shrink-0" />
                <span>
                  {result.deliveryNote || 'A successful test confirms provider acceptance. Actual inbox delivery depends on recipient mailbox filters.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
