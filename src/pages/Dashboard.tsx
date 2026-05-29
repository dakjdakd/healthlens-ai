import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Brain,
  ChevronRight,
  TrendingUp,
  FileText,
  ScanLine,
  ArrowUpRight,
  Info
} from "lucide-react";
import { cn } from "../lib/utils";
import { latestReport, organSystemSummaries, dashboardStats } from "../lib/mockData";
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

// Derive trend chart data from the last 5 data points of selected biomarkers in latestReport
function buildTrendData() {
  const selected = ['alt', 'ldl', 'glucose'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

  // Flatten trend data for charting — use 5 most recent data points
  const bios = latestReport.biomarkers.filter(b => selected.includes(b.id));

  return months.map((month, i) => {
    const point: Record<string, number | string> = { month };
    bios.forEach(b => {
      const data = b.trendData.slice(-5);
      const val = data[i]?.value ?? b.value;
      point[b.shortName] = val;
    });
    return point;
  });
}

const trendData = buildTrendData();

export default function Dashboard() {
  // Compute abnormal count directly from report data
  const abnormalCount = latestReport.biomarkers.filter(b => b.status !== 'normal').length;

  const abnormalBreakdown = {
    highRisk: latestReport.biomarkers.filter(b => b.status !== 'normal' && b.severity === 'high').length,
    mediumRisk: latestReport.biomarkers.filter(b => b.status !== 'normal' && b.severity === 'medium').length,
    slight: latestReport.biomarkers.filter(b => b.status !== 'normal' && b.severity === 'low').length,
  };

  // Build the "Needs Attention" list from real abnormal data
  const attentionList = latestReport.biomarkers
    .filter(b => b.status !== 'normal')
    .sort((a, b) => {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {dashboardStats.trendDescription.split(' ')[0] === 'Mostly' ? 'Amelia' : 'Amelia'}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            Last report analyzed: May 21, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Upload New Report
          </Link>
        </div>
      </div>

      {/* Core Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">Health Score</h3>
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">{dashboardStats.trendDescription}</span>
          </div>
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 relative shrink-0">
              <ResponsiveContainer width={64} height={64}>
                <PieChart>
                  <Pie
                    data={[
                      { value: latestReport.healthScore },
                      { value: 100 - latestReport.healthScore }
                    ]}
                    cx={28}
                    cy={28}
                    innerRadius={20}
                    outerRadius={28}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#0d9488" />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pt-1 pr-2">
                <span className="text-lg font-bold text-gray-900">{latestReport.healthScore}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-tight">
              Based on {latestReport.biomarkers.length} biomarkers from the latest report
            </p>
          </div>
        </div>

        {/* Abnormal Biomarkers */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900">Abnormal Biomarkers</h3>
            <div className="bg-rose-50 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
              {abnormalCount}
            </div>
          </div>
          <div className="mt-auto space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High Risk</span>
              <span className="font-semibold text-gray-900">{abnormalBreakdown.highRisk}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Risk</span>
              <span className="font-semibold text-gray-900">{abnormalBreakdown.mediumRisk}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-300"></span> Slight Abnormal</span>
              <span className="font-semibold text-gray-900">{abnormalBreakdown.slight}</span>
            </div>
          </div>
        </div>

        {/* Improving Trends */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900">Improving Trends</h3>
            <div className="bg-teal-50 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
              {dashboardStats.improvingMarkers.length}
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">Metrics showing positive progression:</p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {dashboardStats.improvingMarkers.map(marker => (
              <span key={marker} className="text-[10px] uppercase tracking-wider font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {marker}
              </span>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Needs Attention</h3>
          </div>
          <div className="space-y-2 mt-auto">
            {attentionList.slice(0, 3).map(bio => (
              <div key={bio.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-xs">
                <span className="font-medium text-gray-700">{bio.shortName}</span>
                <span className={cn(
                  "font-semibold px-2 py-0.5 rounded-md capitalize",
                  bio.severity === 'high' ? "text-rose-600 bg-rose-50" :
                  bio.severity === 'medium' ? "text-amber-600 bg-amber-50" :
                  "text-orange-600 bg-orange-50"
                )}>
                  {bio.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Latest Lab Report Preview */}
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Latest Lab Report</h3>
          </div>
          <div className="relative flex-1 bg-gray-100 rounded-2xl overflow-hidden min-h-[240px] group border border-gray-200">
            <img
              src={latestReport.imageUrl}
              alt="Lab Report"
              className="w-full h-full object-cover opacity-60 mix-blend-multiply"
            />
            {/* Mock OCR Highlights — colored by abnormality level */}
            <div className="absolute top-[25%] left-[10%] w-[45%] h-[6%] border border-teal-400 bg-teal-400/20 rounded shadow-[0_0_8px_rgba(45,212,191,0.4)]" title="Normal values" />
            <div className="absolute top-[40%] left-[10%] w-[35%] h-[6%] border border-rose-400 bg-rose-400/20 rounded shadow-[0_0_8px_rgba(243,113,113,0.4)]" title="Abnormal values" />
            <div className="absolute top-[55%] left-[10%] w-[50%] h-[6%] border border-amber-400 bg-amber-400/20 rounded shadow-[0_0_8px_rgba(251,191,36,0.4)]" title="Borderline values" />

            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <Link to="/report/latest" className="w-full bg-white text-gray-900 text-sm font-medium py-2 rounded-xl text-center shadow-sm">
                View Parsing Detail
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <ScanLine className="w-3.5 h-3.5" /> {latestReport.biomarkers.length} biomarkers extracted
            </div>
            <span className="text-xs text-gray-400 font-medium">Uploaded by: {latestReport.doctor}</span>
          </div>
        </div>

        {/* Middle: Biomarker Trends */}
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">Biomarker Trends</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-medium bg-white shadow-sm rounded-md text-gray-900">3M</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700">6M</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700">1Y</button>
            </div>
          </div>
          <div className="flex-1 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="ALT" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="LDL-C" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Glucose" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> ALT</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> LDL-C</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Glucose</span>
          </div>
        </div>

        {/* Right: AI Plain-language Summary */}
        <div className="bg-gradient-to-br from-brand-50/50 to-white border border-brand-100 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Brain className="w-24 h-24 text-brand-600" />
          </div>

          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="bg-brand-100 p-2 rounded-xl">
              <Brain className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-semibold text-gray-900">AI Health Insights</h3>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white p-5 rounded-2xl shadow-sm text-sm text-gray-700 leading-relaxed relative z-10 mb-6 flex-1">
            "{dashboardStats.aiInsight}"
          </div>

          <div className="space-y-2 relative z-10 mt-auto">
            <Link to="/report/latest" className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl text-sm font-medium text-gray-700 transition-colors group">
              <span>Review liver panel</span>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
            </Link>
            <Link to="/insights" className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl text-sm font-medium text-gray-700 transition-colors group">
              <span>Check diet suggestions</span>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
            </Link>
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-transparent rounded-xl text-sm font-medium text-white transition-colors group">
              <span>Ask a clinician</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom: Organ System Cards */}
      <div className="pt-2">
        <h3 className="font-semibold text-gray-900 tracking-tight mb-4 flex items-center gap-2">
          System Overview <Info className="w-4 h-4 text-gray-400" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {organSystemSummaries.map(sys => (
            <Link
              key={sys.id}
              to="/organ-map"
              className="bg-white border border-gray-200 p-4 rounded-3xl hover:border-gray-300 hover:shadow-sm transition-all flex flex-col justify-between min-h-[100px]"
            >
              <span className="text-sm font-semibold text-gray-900 mb-2">{sys.name}</span>
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider w-fit",
                sys.color === 'orange' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                sys.color === 'amber' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                "bg-teal-50 text-teal-700 border border-teal-100"
              )}>
                {sys.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}