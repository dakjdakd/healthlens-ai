import { Shield, Lock, Database, Trash2, EyeOff, CheckCircle2, Globe, FileText, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

// Privacy policy sections
const policySections = [
  {
    title: "1. Data Collection",
    content: "HealthLens AI is a demo application. In its current prototype state, it does not collect, store, or transmit any personally identifiable health information to external servers. All data processing occurs within your browser session and uses mock data for demonstration purposes.",
    icon: Database,
  },
  {
    title: "2. Mock Data Disclaimer",
    content: "This application runs entirely on mock data. No real medical records, biomarker values, or personal health information is uploaded, stored, or processed. Any data you enter during a session is temporary and is not persisted beyond the current browser session unless you explicitly save it locally.",
    icon: FileText,
  },
  {
    title: "3. Local-First Architecture",
    content: "We are designing HealthLens AI with a local-first philosophy. Future versions will prioritize on-device processing where possible — meaning your biomarker data would be analyzed locally in your browser without being sent to cloud servers. This approach maximizes privacy by design.",
    icon: EyeOff,
  },
  {
    title: "4. No Third-Party Sharing",
    content: "In the current prototype and planned production versions, your health data is never shared with hospitals, insurers, employers, or any third parties. We do not have advertising, affiliate marketing, or data brokerage arrangements.",
    icon: Globe,
  },
  {
    title: "5. Encryption (Planned)",
    content: "Future production versions will implement end-to-end encryption for any stored laboratory results and biomarker data. Encryption keys will be managed locally on your device and will not be accessible to our servers.",
    icon: Lock,
  },
  {
    title: "6. Data Minimization",
    content: "We follow the principle of data minimization: we collect only what is strictly necessary for the application to function. We do not collect GPS location, device identifiers, browsing history, or any other data beyond what you explicitly provide during the lab report upload process.",
    icon: Shield,
  },
  {
    title: "7. User Control and Deletion",
    content: "You retain full control over your data. You can delete all locally stored reports, extracted metrics, and profile data at any time through the Settings page. There is no account system in this prototype — so there is no stored identity to delete beyond your local browser data.",
    icon: Trash2,
  },
  {
    title: "8. Audit Trail (Planned)",
    content: "Future versions will include a complete audit trail that lets you see exactly when and how your data was accessed or used for analytical improvements. You will be able to review and export this audit log.",
    icon: CheckCircle2,
  },
];

const rightsAndNotices = [
  {
    title: "Not a Medical Diagnosis",
    content: "HealthLens AI provides educational health explanations and triage suggestions only. It cannot and does not substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.",
    type: "warning" as const,
  },
  {
    title: "Right to be Informed",
    content: "You have the right to know what data is collected, how it is processed, and how long it is retained. This Privacy page will be updated as features evolve. We encourage you to review this page periodically.",
    type: "info" as const,
  },
  {
    title: "Right to Withdraw",
    content: "You may withdraw consent to data processing at any time by clearing your browser data or using the delete function in Settings. Note that withdrawing consent for data already processed in the current session does not affect prior processing.",
    type: "info" as const,
  },
];

export default function Privacy() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Privacy & Data Policy</h1>
        <p className="text-sm text-gray-500 mt-3 max-w-2xl mx-auto leading-relaxed">
          Sensitive health data deserves careful handling. HealthLens AI is built with a privacy-first mindset.
          This page explains exactly how your data is — and is not — used.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Demo Mode", sub: "No real data", icon: Database },
          { label: "Local-First", sub: "On-device processing", icon: EyeOff },
          { label: "No Sharing", sub: "Zero third parties", icon: Globe },
          { label: "Full Control", sub: "Delete anytime", icon: Trash2 },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-teal-600" />
              </div>
              <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
              <div className="text-xs text-gray-500 mt-1">{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Policy Sections */}
      <div className="space-y-6 mb-10">
        <h2 className="text-lg font-bold text-gray-900">Policy Details</h2>
        {policySections.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-teal-50 text-teal-600 p-3 rounded-xl shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Rights & Notices */}
      <div className="space-y-4 mb-10">
        <h2 className="text-lg font-bold text-gray-900">Your Rights & Important Notices</h2>
        {rightsAndNotices.map((notice, i) => (
          <div
            key={i}
            className={cn(
              "rounded-3xl p-6 border shadow-sm",
              notice.type === 'warning'
                ? "bg-amber-50/50 border-amber-100"
                : "bg-sky-50/50 border-sky-100"
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn(
                "w-5 h-5 shrink-0 mt-0.5",
                notice.type === 'warning' ? "text-amber-600" : "text-sky-600"
              )} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{notice.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cookie & Analytics Note */}
      <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-200/60 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          Cookies & Analytics
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          This prototype does not use third-party analytics, advertising cookies, or tracking pixels.
          Session information (if any) is stored only in browser localStorage and is never transmitted to our servers.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          If you have enabled Gemini API features in the production version, API calls to Google's servers may be subject
          to Google's privacy policy in addition to this document. We recommend reviewing Google's privacy practices
          if you use AI-powered features.
        </p>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Questions?</h3>
        <p className="text-sm text-gray-500 mb-4">
          If you have any questions about this privacy policy or data handling practices, please contact us.
          This is a prototype — feedback is welcome.
        </p>
        <div className="text-xs text-gray-400">
          Last updated: May 2026 — HealthLens AI Prototype
        </div>
      </div>
    </div>
  );
}