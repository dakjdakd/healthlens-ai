import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getReport, type ReportResponse } from "../lib/mockApi";
import type { TrendPoint } from "../lib/mockData";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  FileText,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Minus,
  MessageSquare,
  FileDown,
  GitCompare,
  Info,
  X
} from "lucide-react";
import { cn } from "../lib/utils";

// Organ group definitions
const groups = [
  { name: 'Liver', keys: ['liver'] },
  { name: 'Kidney', keys: ['kidney'] },
  { name: 'Blood', keys: ['blood'] },
  { name: 'Metabolic', keys: ['metabolism'] },
  { name: 'Cardiovascular', keys: ['cardiovascular'] },
  { name: 'Inflammation', keys: ['immune'] },
];

export default function ReportDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const [selectedBio, setSelectedBio] = useState<{
  id: string; shortName: string; name: string; value: number; unit: string;
  referenceRange: string; status: string; organSystem: string;
  bboxTop: string; bboxLeft: string; bboxWidth: string; bboxHeight: string;
  trendData: TrendPoint[];
} | null>(null);
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [symptomsAdded, setSymptomsAdded] = useState(false);
  const [symptomsText, setSymptomsText] = useState("");
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const report = reportData?.report;
  const biomarkers = report?.biomarkers ?? [];

  useEffect(() => {
    setLoading(true);
    const reportId = params.id ?? 'latest';
    getReport(reportId).then(data => {
      setReportData(data);
      setLoading(false);
    });
  }, [params.id]);

  // Keep selectedBio in sync when biomarkers change
  useEffect(() => {
    if (biomarkers.length > 0 && !selectedBio) {
      setSelectedBio(biomarkers[0]);
    }
  }, [biomarkers, selectedBio]);

  const groupedBiomarkers = useMemo(() => {
    return groups.map(g => ({
      ...g,
      items: biomarkers.filter(b => g.keys.includes(b.organSystem)),
    })).filter(g => g.items.length > 0);
  }, [biomarkers]);

  const abnormalCount = biomarkers.filter(b => b.status !== 'normal').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report || biomarkers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500 font-medium">No report data found.</p>
        <Link to="/upload" className="text-brand-600 font-semibold text-sm hover:underline">
          Upload a lab report first
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-3 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Report: {report.title}
            </h1>
            <span className="bg-gray-100 px-2.5 py-1 rounded-md text-sm font-bold text-gray-600 uppercase tracking-wider">
              {new Date(report.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3 font-medium">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Uploaded from: <span className="text-gray-700">Mock lab report image</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-500" /> Extraction confidence: <span className="text-gray-700">94%</span>
            </span>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-white border rounded-2xl px-5 py-3 flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl font-bold text-gray-900">{report.biomarkers.length}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mt-0.5">Extracted markers</span>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3 flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl font-bold text-rose-600">{abnormalCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 mt-0.5">Need attention</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 flex-1 min-h-0 items-start">

        {/* Left: Document View with OCR bounding boxes */}
        <div className="lg:col-span-3 bg-white border border-gray-200/60 shadow-sm rounded-3xl p-4 flex flex-col sticky top-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-brand-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Source Extraction</h3>
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl relative overflow-hidden group min-h-[400px]">
            <img
              src={report.imageUrl}
              alt="Original Report"
              className="w-full h-full object-cover opacity-60 mix-blend-multiply"
            />

            {/* Bounding boxes from each biomarker's bbox data */}
            {report.biomarkers.map(bio => {
              const isSelected = selectedBio !== null && selectedBio.id === bio.id;
              const isAbnormal = bio.status !== 'normal';

              return (
                <div
                  key={bio.id}
                  onClick={() => setSelectedBio(bio)}
                  className={cn(
                    "absolute border-2 rounded transition-all cursor-pointer shadow-sm group/box",
                    isAbnormal ? "border-amber-400 bg-amber-400/10 hover:bg-amber-400/30" : "border-teal-400 bg-teal-400/10 hover:bg-teal-400/30",
                    isSelected && isAbnormal ? "ring-2 ring-amber-500 ring-offset-2 z-10 bg-amber-400/40" : "",
                    isSelected && !isAbnormal ? "ring-2 ring-teal-500 ring-offset-2 z-10 bg-teal-400/40" : ""
                  )}
                  style={{
                    top: bio.bboxTop,
                    left: bio.bboxLeft,
                    width: bio.bboxWidth,
                    height: bio.bboxHeight,
                  }}
                >
                  <div className="absolute left-[105%] top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] whitespace-nowrap px-2 py-1 rounded opacity-0 group-hover/box:opacity-100 transition-opacity z-20 pointer-events-none font-bold">
                    {bio.shortName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle: Biomarker Groups */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {groupedBiomarkers.map(group => (
            <div key={group.name} className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{group.name} Panel</h2>

              <div className="flex flex-col gap-3">
                {group.items.map(bio => {
                  const isAbnormal = bio.status !== 'normal';
                  const isSelected = selectedBio !== null && selectedBio.id === bio.id;

                  // Compute trend direction from last 2 data points
                  const latestVal = bio.trendData[bio.trendData.length - 1]?.value;
                  const prevVal = bio.trendData[bio.trendData.length - 2]?.value;
                  let TrendIcon = Minus;
                  let trendColor = "text-gray-400";
                  if (latestVal != null && prevVal != null && Math.abs(latestVal - prevVal) > latestVal * 0.03) {
                    if (isAbnormal) {
                      TrendIcon = latestVal < prevVal ? TrendingDown : TrendingUp;
                      trendColor = latestVal < prevVal ? "text-teal-500" : "text-amber-500";
                    } else {
                      TrendIcon = TrendingDown; // generally good
                      trendColor = "text-teal-500";
                    }
                  }

                  return (
                    <div
                      key={bio.id}
                      onClick={() => setSelectedBio(bio)}
                      className={cn(
                        "flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group/card",
                        isSelected ? "bg-brand-50/50 border-brand-200 ring-1 ring-brand-500/10 shadow-sm" : "bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {/* Name & Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{bio.shortName}</h3>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                            isAbnormal ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-teal-50 text-teal-700 border-teal-100"
                          )}>
                            {bio.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{bio.name}</p>
                      </div>

                      {/* Values */}
                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Value</p>
                          <div className="flex items-baseline gap-1">
                            <span className={cn(
                              "font-bold text-lg leading-none tracking-tight",
                              isAbnormal ? "text-amber-600" : "text-gray-900"
                            )}>{bio.value}</span>
                            <span className="text-xs font-medium text-gray-500">{bio.unit}</span>
                          </div>
                        </div>

                        <div className="hidden min-[400px]:block">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ref Range</p>
                          <p className="text-sm font-medium text-gray-600">{bio.referenceRange}</p>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trend</p>
                          <TrendIcon className={cn("w-4 h-4", trendColor)} />
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 flex items-center justify-end sm:border-l sm:pl-4 sm:border-gray-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/timeline'); }}
                          className="text-[11px] font-bold bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-brand-600 transition-colors"
                        >
                          Timeline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: AI Summary & Actions */}
        <div className="lg:col-span-3 flex flex-col gap-6 sticky top-6">

          {/* AI Summary Card */}
          <div className="bg-gradient-to-br from-brand-50/80 to-white border border-brand-100 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Brain className="w-24 h-24 text-brand-600" />
            </div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="bg-brand-100 p-2 rounded-xl">
                <Brain className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Report Summary</h3>
            </div>

            <div className="relative z-10 text-sm leading-relaxed space-y-3">
              <p className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white text-gray-700 shadow-sm">
                Overall, your results are stable. <span className="font-medium text-gray-900">{report.biomarkers.filter(b => b.status === 'normal').length} of {report.biomarkers.length}</span> markers are within healthy reference ranges.
              </p>
              <p className="bg-amber-50/50 backdrop-blur-sm p-3 rounded-2xl border border-amber-100/50 text-amber-900 shadow-sm">
                Mild elevations were noted in Uric Acid, ALT, CRP, and LDL-C. These are consistent with mild metabolic stress or dietary factors.
              </p>
              {symptomsAdded && (
                <div className="bg-teal-50/70 backdrop-blur-sm p-3 rounded-2xl border border-teal-100 text-teal-900 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <span className="font-bold flex items-center gap-1.5 mb-1">
                    <Info className="w-4 h-4" /> Symptom Context Added
                  </span>
                  Based on your notes, the mild CRP and ALT elevation may be related to temporary systemic stress rather than acute organ dysfunction. Prioritizing rest is recommended.
                </div>
              )}
            </div>
          </div>

          {/* Actions List */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSymptomModalOpen(true)}
              className="w-full bg-white border border-gray-200 text-gray-700 font-semibold text-sm py-3 px-4 rounded-2xl shadow-sm hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-all flex items-center gap-3 justify-center group"
            >
              <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
              Add Symptom Notes
            </button>

            <button onClick={() => navigate('/insights')} className="w-full bg-gray-900 text-white font-semibold text-sm py-3 px-4 rounded-2xl shadow-sm hover:bg-gray-800 transition-all flex items-center gap-3 justify-center">
              <Brain className="w-4 h-4" />
              Ask AI / Detailed Insights
            </button>

            <div className="h-px bg-gray-200 my-1 w-1/2 mx-auto" />

            <button onClick={() => navigate('/reports')} className="w-full bg-transparent border-2 border-dashed border-gray-200 text-gray-600 font-medium text-sm py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <GitCompare className="w-4 h-4" /> Compare previous report
            </button>
            <button className="w-full bg-transparent border-2 border-dashed border-gray-200 text-gray-600 font-medium text-sm py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <FileDown className="w-4 h-4" /> Export PDF Summary
            </button>
          </div>
        </div>

      </div>

      {/* Symptom Notes Modal */}
      {symptomModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-xl font-bold text-gray-900">Add Symptom Context</h2>
              <button onClick={() => setSymptomModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6 font-medium">
                Providing lifestyle and symptom context helps the AI generate more accurate, personalized interpretations of your results.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    How have you been feeling lately? (Fatigue, sleep, stress)
                  </label>
                  <textarea
                    value={symptomsText}
                    onChange={(e) => setSymptomsText(e.target.value)}
                    placeholder="e.g. I've been feeling extremely tired lately and staying up very late..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all min-h-[120px] resize-none text-gray-900"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {["Fatigue", "Poor Diet", "Low Sleep", "Alcohol Use", "Intense Workout"].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSymptomsText(prev => prev ? `${prev}, ${tag}` : tag)}
                      className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 mt-4 flex gap-3">
              <button
                onClick={() => setSymptomModalOpen(false)}
                className="flex-1 font-semibold text-sm bg-gray-100 text-gray-700 py-3 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSymptomsAdded(true);
                  setSymptomModalOpen(false);
                }}
                className="flex-1 font-semibold text-sm bg-gray-900 text-white py-3 rounded-2xl hover:bg-gray-800 transition-colors"
              >
                Update AI Context
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}