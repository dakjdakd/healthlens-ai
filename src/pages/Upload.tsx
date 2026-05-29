import { useState, useRef, type DragEvent, type ChangeEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ScanLine,
  Activity,
  ChevronRight,
  Database,
  Lock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "../lib/utils";
import { uploadReport, getParseStatus } from "../lib/mockApi";
import { ParseStatusResponse } from "../lib/types";
import { isGeminiConfigured } from "../lib/gemini";

export default function UploadPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'completed' | 'error'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('Extracting biomarkers...');
  const [steps, setSteps] = useState<ParseStatusResponse['steps']>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [extractedCount, setExtractedCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      await startParsingFlow(file);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      await startParsingFlow(file);
    }
  };

  const simulateError = () => {
    setStatus('error');
    setPreview(null);
    setErrorMessage('Simulated upload failure for demonstration.');
  };

  const startParsingFlow = async (file: File) => {
    try {
      setStatus('uploading');
      setProgress(0);
      setErrorMessage('');

      const uploadRes = await uploadReport(file);
      setReportId(uploadRes.reportId);

      setStatus('parsing');

      // Polling for parsing complete
      let currentProgress = 0;
      while (currentProgress < 100) {
        const pollRes = await getParseStatus(uploadRes.reportId, currentProgress);

        currentProgress = pollRes.progress;
        setProgress(pollRes.progress);

        if (pollRes.currentStep) setCurrentStepText(pollRes.currentStep);
        if (pollRes.steps) setSteps(pollRes.steps);

        if (pollRes.status === 'completed' || currentProgress >= 100) {
          // Fetch the parsed biomarker count from localStorage
          try {
            const reports = JSON.parse(localStorage.getItem('healthlens_reports') ?? '[]');
            const latest = reports.find((r: { id: string }) => r.id === uploadRes.reportId);
            setExtractedCount(latest?.biomarkers?.length ?? 0);
          } catch {
            setExtractedCount(0);
          }
          setStatus('completed');
          setProgress(100);
          break;
        } else if (pollRes.status === 'error') {
          setErrorMessage(pollRes.message ?? 'Parsing failed. Please try with a clearer image.');
          setStatus('error');
          break;
        }
      }

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Lab Report</h1>
         <p className="text-gray-500 mt-2">HealthLens AI extracts the data and translates it into plain language.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Upload & Parsing Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[450px]">
          
          {status === 'idle' && (
            <div 
              className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:bg-brand-50/50 hover:border-brand-400 transition-colors cursor-pointer flex flex-col items-center justify-center text-center group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="bg-brand-50 p-5 rounded-full mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-10 h-10 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Click to upload or drag & drop</h3>
              <p className="text-gray-500 max-w-sm mb-6">Upload a blood test, annual checkup report, or lab panel image.</p>
              
              <div className="flex gap-2 mb-8">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">JPG</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">PNG</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">PDF</span>
              </div>

              <button className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                Select File
              </button>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); simulateError(); }}
                className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Simulate upload error
              </button>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,application/pdf"
              />
            </div>
          )}

          {(status === 'uploading' || status === 'parsing') && (
            <div className="w-full h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
              {preview && (
                <div className="relative w-40 h-52 rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-200">
                  <img src={preview} alt="Document preview" className="w-full h-full object-cover blur-[2px] opacity-80 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-brand-500/10 mix-blend-overlay" />
                  
                  {/* Scanner line */}
                  <div className="absolute left-0 right-0 h-1 bg-brand-400 shadow-[0_0_12px_rgba(45,212,191,1)] animate-[scan_2s_ease-in-out_infinite]" />
                  
                  {/* Green shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand-200/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                </div>
              )}

              <div className="w-full mb-8">
                <div className="flex justify-between text-xs font-medium text-brand-600 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    {status === 'uploading' ? 'Uploading...' : currentStepText}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-6 w-full text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                {steps && steps.length > 0 ? (
                  steps.map(step => (
                     <Step 
                       key={step.id}
                       active={step.status === 'processing' || step.status === 'completed'} 
                       done={step.status === 'completed'} 
                       title={step.label} 
                       icon={step.id === 'explanation' ? <Sparkles className="w-4 h-4" /> : step.id === 'ocr' ? <Database className="w-4 h-4" /> : <ScanLine className="w-4 h-4" />} 
                       isLast={step.id === 'explanation'}
                     />
                  ))
                ) : (
                  <>
                    <Step active={status !== 'idle'} done={status === 'parsing' || status === 'completed'} title="Uploading document" icon={<UploadCloud className="w-4 h-4" />} />
                    <Step active={status === 'parsing'} done={false} title="Initializing AI parser" icon={<ScanLine className="w-4 h-4" />} isLast />
                  </>
                )}
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Extraction Complete</h2>
              <p className="text-gray-500 mb-3">
                {extractedCount > 0
                  ? `${extractedCount} biomarker${extractedCount !== 1 ? 's' : ''} extracted from your report.`
                  : 'Data extracted from your report.'}
              </p>
              <p className="text-xs text-gray-400 mb-10">
                Powered by Gemini AI {isGeminiConfigured() ? '' : '(demo mode — configure GEMINI_API_KEY for real extraction)'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/report/latest" className="bg-brand-600 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                  Review Extracted Data <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/dashboard" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-8 py-3 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  Open Health Dashboard <Activity className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
             <div className="text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Failed</h2>
              <p className="text-gray-500 mb-3 text-sm max-w-sm mx-auto">
                {errorMessage || "Couldn't read the image clearly. Try a brighter, flatter photo."}
              </p>
              {!isGeminiConfigured() && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-800 text-xs px-4 py-3 rounded-xl mb-6 max-w-sm mx-auto text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    No API key detected. Add <code className="font-mono bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> to <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> for real parsing.
                  </span>
                </div>
              )}

              <button
                onClick={() => setStatus('idle')}
                className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}

        </div>

        {/* Right: Info Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-brand-500" />
              What we extract:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Biomarker name
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Value and unit
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Reference range
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Abnormal flags
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Organ system mapping
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200/60 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-500" />
              Privacy &amp; Processing
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Lab image {isGeminiConfigured() ? 'sent to Gemini AI API' : 'processed locally in demo mode'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{isGeminiConfigured() ? 'Your image is sent to Google Gemini for parsing — never stored on our servers.' : 'Configure GEMINI_API_KEY to enable real AI parsing.'}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Data stays in your browser</div>
                  <div className="text-xs text-gray-500 mt-0.5">Extracted results and reports are saved in localStorage only — no cloud database.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">No account required</div>
                  <div className="text-xs text-gray-500 mt-0.5">Anonymous usage — no login, no email, no tracking.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function Step({ active, done, title, icon, isLast, key: _stepKey }: { active: boolean, done: boolean, title: string, icon: ReactNode, isLast?: boolean, key?: string }) {
  return (
    <div className={cn("flex items-start gap-4 transition-all duration-300 relative", active ? "opacity-100" : "opacity-40", done ? "text-gray-900" : active ? "text-brand-700" : "text-gray-500")}>
      <div className="relative mt-1">
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-brand-500 relative z-10 bg-gray-50 rounded-full" />
        ) : active ? (
          <div className="w-5 h-5 bg-white border-2 border-brand-500 rounded-full flex items-center justify-center relative z-10">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 relative z-10 bg-gray-50"></div>
        )}
        {/* Connection line */}
        {!isLast && <div className="absolute top-5 left-2.5 bottom-[-24px] w-px bg-gray-200 -z-0"></div>}
      </div>
      <div>
        <span className={cn("text-sm font-medium flex items-center gap-2")}>
          <span className="opacity-70">{icon}</span> {title}
        </span>
      </div>
    </div>
  );
}
