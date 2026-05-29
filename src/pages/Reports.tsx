import { useState } from "react";
import { Link } from "react-router-dom";
import { type ReactNode } from "react";
import {
  FileText, ArrowUpRight, Search, Filter, Calendar, Activity,
  CheckCircle2, AlertCircle, GitCompare, ArrowRight,
  TrendingUp, TrendingDown, Minus, X, ChevronRight, AlertTriangle
} from "lucide-react";
import { cn } from "../lib/utils";
import { historicalReports } from "../lib/mockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
  });
}

function buildTags(report: typeof historicalReports[0]): string[] {
  const systems = [...new Set(report.biomarkers.map(b => {
    const map: Record<string, string> = {
      liver: 'Liver', blood: 'Blood', kidney: 'Kidney',
      metabolism: 'Metabolism', cardiovascular: 'Cardio', immune: 'Immune',
    };
    return map[b.organSystem] ?? b.organSystem;
  }))];
  return systems;
}

// ─── Compare Modal ───────────────────────────────────────────────────────────
function CompareModal({ reports, onClose }: { reports: typeof historicalReports; onClose: () => void }) {
  const [leftId, setLeftId] = useState(reports[reports.length - 1]?.id ?? reports[0].id);
  const [rightId, setRightId] = useState(reports[0].id);

  const leftReport = reports.find(r => r.id === leftId)!;
  const rightReport = reports.find(r => r.id === rightId)!;

  // Build shared biomarker list from both reports
  const leftMap = new Map(leftReport.biomarkers.map(b => [b.shortName, b]));
  const rightMap = new Map(rightReport.biomarkers.map(b => [b.shortName, b]));

  const biomarkerKeys = [...new Set([...leftMap.keys(), ...rightMap.keys()])].sort();

  function getChange(bio: typeof leftReport.biomarkers[0] | undefined, other: typeof leftReport.biomarkers[0] | undefined) {
    if (!bio || !other) return null;
    const diff = bio.value - other.value;
    const pct = other.value !== 0 ? ((diff / other.value) * 100).toFixed(1) : '0';
    return { diff, pct: Number(pct) };
  }

  function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; cls: string }> = {
      normal:    { label: 'Normal',    cls: 'bg-teal-50 text-teal-700 border-teal-100' },
      high:      { label: 'High',      cls: 'bg-rose-50 text-rose-700 border-rose-100' },
      low:       { label: 'Low',      cls: 'bg-blue-50 text-blue-700 border-blue-100' },
      borderline:{ label: 'Borderline', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    };
    const c = config[status] ?? config.normal;
    return <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border", c.cls)}>{c.label}</span>;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Compare Reports</h2>
              <p className="text-xs text-gray-500">Select two reports to see changes in biomarker values</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Selectors */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1 w-full">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-10">Older</span>
            <select
              value={leftId}
              onChange={e => setLeftId(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>{r.title} — {formatDate(r.date)}</option>
              ))}
            </select>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex items-center gap-3 flex-1 w-full">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-10">Newer</span>
            <select
              value={rightId}
              onChange={e => setRightId(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>{r.title} — {formatDate(r.date)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-3">

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="col-span-3">Biomarker</div>
              <div className="col-span-2 text-right">May 2025 (Older)</div>
              <div className="col-span-2 text-right">Current</div>
              <div className="col-span-3 text-center">Change</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {biomarkerKeys.map(key => {
              const leftBio = leftMap.get(key);
              const rightBio = rightMap.get(key);
              const change = getChange(leftBio, rightBio);

              const isAbnormal = (bio: typeof leftBio) => bio && bio.status !== 'normal';
              const wasAbnormal = isAbnormal(leftBio);
              const isNowAbnormal = isAbnormal(rightBio);

              // Determine trend direction for the change
              let TrendIcon = Minus;
              let trendColor = 'text-gray-400';
              let trendLabel = 'Stable';

              if (change && Math.abs(change.diff) > 0.001) {
                if (wasAbnormal) {
                  // Abnormal improving is good
                  TrendIcon = change.diff < 0 ? TrendingDown : TrendingUp;
                  trendColor = change.diff < 0 ? 'text-teal-500' : 'text-rose-500';
                } else {
                  // Normal staying normal is fine
                  TrendIcon = change.diff > 0 ? TrendingUp : TrendingDown;
                  trendColor = change.diff > 0 ? 'text-amber-500' : 'text-teal-500';
                }
                trendLabel = `${change.diff > 0 ? '+' : ''}${change.diff.toFixed(2)} (${change.pct}%)`;
              }

              return (
                <div
                  key={key}
                  className={cn(
                    "grid grid-cols-12 gap-3 px-4 py-4 rounded-2xl border transition-all",
                    isNowAbnormal ? "bg-rose-50/40 border-rose-100" : "bg-white border-gray-100 hover:border-gray-200"
                  )}
                >
                  {/* Biomarker Name */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isNowAbnormal ? "bg-rose-400" : "bg-teal-400"
                    )} />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{key}</div>
                      <div className="text-[10px] text-gray-400">{rightBio?.name ?? leftBio?.name}</div>
                    </div>
                  </div>

                  {/* Old Value */}
                  <div className="col-span-2 flex flex-col items-end justify-center">
                    {leftBio ? (
                      <>
                        <div className="font-bold text-gray-900">{leftBio.value}</div>
                        <div className="text-[9px] text-gray-400">{leftBio.unit}</div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>

                  {/* New Value */}
                  <div className="col-span-2 flex flex-col items-end justify-center">
                    {rightBio ? (
                      <>
                        <div className={cn("font-bold", isNowAbnormal ? "text-rose-700" : "text-gray-900")}>
                          {rightBio.value}
                        </div>
                        <div className="text-[9px] text-gray-400">{rightBio.unit}</div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>

                  {/* Change Indicator */}
                  <div className="col-span-3 flex items-center justify-center gap-2">
                    {change ? (
                      <>
                        <TrendIcon className={cn("w-4 h-4 shrink-0", trendColor)} />
                        <div className="text-center">
                          <div className={cn("text-sm font-bold", trendColor)}>{trendLabel}</div>
                          {leftBio && rightBio && (
                            <div className="text-[9px] text-gray-400">{leftBio.referenceRange} {leftBio.unit}</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <Minus className="w-4 h-4 text-gray-300" />
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2 flex items-center justify-center">
                    {rightBio ? <StatusBadge status={rightBio.status} /> : <span className="text-xs text-gray-400">—</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              {
                label: 'Improved',
                value: rightReport.improvedCount,
                icon: <TrendingDown className="w-5 h-5 text-teal-500" />,
                bg: 'bg-teal-50',
                border: 'border-teal-100',
              },
              {
                label: 'Regressed',
                value: Math.max(0, rightReport.abnormalCount - leftReport.abnormalCount + 1),
                icon: <TrendingUp className="w-5 h-5 text-rose-500" />,
                bg: 'bg-rose-50',
                border: 'border-rose-100',
              },
              {
                label: 'Health Score',
                value: `${leftReport.healthScore} → ${rightReport.healthScore}`,
                icon: <Activity className="w-5 h-5 text-brand-500" />,
                bg: 'bg-brand-50',
                border: 'border-brand-100',
              },
            ].map(s => (
              <div key={s.label} className={cn("p-4 rounded-2xl border flex flex-col gap-2", s.bg, s.border)}>
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-xs font-semibold text-gray-600">{s.label}</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            Close
          </button>
          <Link
            to="/insights"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center gap-2"
          >
            Get AI Insight for Current Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Reports Page ────────────────────────────────────────────────────────
export default function Reports() {
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lab Reports</h1>
          <p className="text-sm text-gray-500 mt-2">
            {historicalReports.length} reports on file — showing most recent first.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-brand-100 transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            Compare Reports
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200/60 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full md:w-64 transition-all"
            />
          </div>
          <button className="p-2 border border-gray-200/60 bg-white rounded-full text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {historicalReports.map((report, idx) => {
          const { label, Icon, color } = {
            reviewed: { label: 'Reviewed', Icon: CheckCircle2, color: 'text-green-500' },
            archived: { label: 'Archived', Icon: Activity, color: 'text-gray-400' },
          }[report.id === 'rpt_2026_05_21' ? 'reviewed' : 'archived'] ?? { label: 'Unknown', Icon: Activity, color: 'text-gray-400' };

          const tags = buildTags(report);

          return (
            <div
              key={report.id}
              className="group bg-white border border-gray-200/60 rounded-3xl p-5 hover:border-brand-200 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ArrowUpRight className="w-5 h-5 text-brand-500" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pr-10">
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-5 flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    report.id === 'rpt_2026_05_21' ? "bg-brand-50 text-brand-600" : "bg-gray-50 text-gray-400"
                  )}>
                    <FileText className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors text-lg">
                      {report.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(report.date)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 hidden md:block"></span>
                      <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                        {report.biomarkers.length} markers
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 hidden md:block"></span>
                      <span className={cn("flex items-center gap-1.5", color)}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score, Attention, Tags */}
                <div className="flex items-center gap-8 shrink-0 md:pl-6 md:border-l border-gray-100">

                  {/* Health Score */}
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Score</span>
                    <div className={cn(
                      "flex items-center gap-1.5 border px-2.5 py-1 rounded-lg",
                      report.healthScore >= 85 ? "border-teal-100 bg-teal-50" : "border-amber-100 bg-amber-50"
                    )}>
                      <Activity className={cn("w-3.5 h-3.5", report.healthScore >= 85 ? "text-teal-600" : "text-amber-600")} />
                      <span className={cn(
                        "text-sm font-bold",
                        report.healthScore >= 85 ? "text-teal-700" : "text-amber-700"
                      )}>
                        {report.healthScore}
                      </span>
                    </div>
                  </div>

                  {/* Abnormal Count */}
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Attention</span>
                    <div className={cn(
                      "flex items-center gap-1.5 border px-2.5 py-1 rounded-lg",
                      report.abnormalCount > 0 ? "border-amber-100 bg-amber-50" : "border-green-100 bg-green-50"
                    )}>
                      {report.abnormalCount > 0
                        ? <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        : <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                      <span className={cn(
                        "text-sm font-bold",
                        report.abnormalCount > 0 ? "text-amber-700" : "text-green-700"
                      )}>
                        {report.abnormalCount}
                      </span>
                    </div>
                  </div>

                  {/* Organ System Tags */}
                  <div className="hidden md:flex gap-1.5 items-center w-36 flex-wrap justify-end">
                    {tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                    {tags.length > 2 && (
                      <span className="text-[10px] font-medium text-gray-400 px-1 py-0.5">
                        +{tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-50">
                <Link
                  to={`/report/${report.id}`}
                  className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-brand-600 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  to="/timeline"
                  className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-brand-600 transition-colors"
                >
                  View Timeline
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare Modal */}
      {showCompare && (
        <CompareModal
          reports={historicalReports}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}