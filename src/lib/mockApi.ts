/**
 * HealthLens AI — API Service
 *
 * Acts as the main API layer. Routes to:
 *   - Real Gemini API (when GEMINI_API_KEY is configured)
 *   - Local Storage (for report persistence)
 *   - Mock data (fallback, for demo without API key)
 *
 * Flow:
 *   uploadReport(file)        → save file, return reportId
 *   getParseStatus(id, prog) → poll: triggers real Gemini parse, returns progress
 *   getReport(id)            → return from localStorage
 *   generateExplanation(id) → real Gemini insight
 *   askAI(question)         → real Gemini Q&A
 */

import { latestReport, historicalReports, organSystemSummaries, dashboardStats, Biomarker } from './mockData';
import {
  parseLabReport,
  generateInsight,
  isGeminiConfigured,
  type ParseResult,
} from './gemini';
import {
  type BiomarkerResult,
  type Severity,
  type TrendStatus,
  type BiomarkerStatus,
} from './types';

// ─── Local Storage ─────────────────────────────────────────────────────────────

const REPORTS_KEY = 'healthlens_reports';
const PARSING_KEY = 'healthlens_parsing'; // in-flight parsing results

interface StoredReport {
  id: string;
  title: string;
  date: string;
  healthScore: number;
  abnormalCount: number;
  improvedCount: number;
  hospital: string;
  doctor: string;
  imageUrl: string; // object URL
  biomarkers: BiomarkerResult[];
  uploadedAt: string;
}

interface InFlightParsing {
  reportId: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  result?: StoredReport;
  error?: string;
  startedAt?: number; // optional, not always set
}

function loadReports(): StoredReport[] {
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveReports(reports: StoredReport[]): void {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

function loadInFlight(reportId: string): InFlightParsing | null {
  try {
    const all: Record<string, InFlightParsing> = JSON.parse(localStorage.getItem(PARSING_KEY) ?? '{}');
    return all[reportId] ?? null;
  } catch {
    return null;
  }
}

function saveInFlight(p: InFlightParsing): void {
  try {
    const all: Record<string, InFlightParsing> = JSON.parse(localStorage.getItem(PARSING_KEY) ?? '{}');
    all[p.reportId] = p;
    localStorage.setItem(PARSING_KEY, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
}

// ─── Biomarker enricher ───────────────────────────────────────────────────────

/** Maps a Gemini biomarker to the full BiomarkerResult for the app */
function enrichBiomarker(
  raw: { name: string; shortName: string; value: number; unit?: string; referenceRange?: string; status: BiomarkerStatus },
  index: number,
): BiomarkerResult {
  // Determine organ system from biomarker name
  const organSystem = inferOrganSystem(raw.name, raw.shortName);
  // Determine severity
  const severity = inferSeverity(raw.status);
  // Generate a stable ID
  const id = raw.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  return {
    id,
    name: raw.name,
    shortName: raw.shortName,
    value: raw.value,
    unit: raw.unit ?? '',
    referenceRange: raw.referenceRange ?? '',
    status: raw.status,
    severity,
    organSystem,
    confidence: 0.85,
    trend: inferTrend(raw.status),
    plainExplanation: buildPlainExplanation(raw),
    possibleReasons: buildPossibleReasons(raw).join('. '),
    dietTips: buildDietTips(raw).join('. '),
    sourceBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
    // bbox fields for ReportDetail rendering (CSS % values)
    bboxTop: '20%',
    bboxLeft: '10%',
    bboxWidth: '40%',
    bboxHeight: '5%',
    // trendData for timeline chart in ReportDetail
    trendData: [
      { date: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10), value: raw.value * (1 + (Math.random() * 0.06 - 0.03)) },
      { date: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10), value: raw.value * (1 + (Math.random() * 0.04 - 0.02)) },
      { date: new Date().toISOString().slice(0, 10), value: raw.value },
    ],
  };
}

function inferOrganSystem(name: string, shortName: string): BiomarkerResult['organSystem'] {
  const s = `${name} ${shortName}`.toLowerCase();
  if (s.includes('liver') || s.includes('alt') || s.includes('ast') || s.includes('ggt')) return 'liver';
  if (s.includes('kidney') || s.includes('creatinine') || s.includes('uric') || s.includes('bun')) return 'kidney';
  if (s.includes('rbc') || s.includes('hemoglobin') || s.includes('platelet') || s.includes('wbc')) return 'blood';
  if (s.includes('glucose') || s.includes('hba1c') || s.includes('insulin')) return 'metabolism';
  if (s.includes('ldl') || s.includes('hdl') || s.includes('cholesterol') || s.includes('triglyceride') || s.includes('lipid')) return 'cardiovascular';
  if (s.includes('crp') || s.includes('inflammation') || s.includes('wbc') || s.includes('neutrophil')) return 'immune';
  return 'blood';
}

function inferSeverity(status: BiomarkerStatus): Severity {
  if (status === 'normal') return 'none';
  if (status === 'borderline') return 'low';
  if (status === 'high' || status === 'low') return 'medium';
  return 'medium';
}

function inferTrend(status: BiomarkerStatus): TrendStatus {
  return 'stable';
}

function buildPlainExplanation(raw: { name: string; shortName: string; status: BiomarkerStatus; referenceRange?: string; value?: number }): string {
  if (raw.status === 'normal') return `${raw.shortName} is within the normal reference range.`;
  if (raw.status === 'borderline') return `${raw.shortName} is slightly elevated — worth monitoring.`;
  const dir = raw.status === 'high' ? 'elevated above' : 'below';
  return `${raw.shortName} is ${dir} the reference range${raw.referenceRange ? ` (${raw.referenceRange})` : ''}. This may warrant dietary review or clinical follow-up.`;
}

function buildPossibleReasons(raw: { name: string; shortName: string; status: BiomarkerStatus }): string[] {
  if (raw.status === 'normal') return ['No abnormal factors identified.'];
  const high = raw.status === 'high';
  const s = `${raw.name} ${raw.shortName}`.toLowerCase();
  const reasons: string[] = [];
  if (s.includes('alt') || s.includes('ast') || s.includes('liver')) {
    reasons.push(high ? 'May indicate liver stress from alcohol, medication, or fatty liver.' : 'Low liver enzyme levels are generally not a concern.');
  } else if (s.includes('uric')) {
    reasons.push(high ? 'May be related to purine-rich diet, dehydration, or genetics.' : 'Low uric acid is generally benign.');
  } else if (s.includes('ldl') || s.includes('cholesterol')) {
    reasons.push(high ? 'May be associated with diet high in saturated fats or sedentary lifestyle.' : 'Good lipid profile — maintain current habits.');
  } else if (s.includes('glucose')) {
    reasons.push(high ? 'May indicate elevated blood sugar — review carbohydrate intake.' : 'Low blood sugar may be normal if fasting or after exercise.');
  } else if (s.includes('crp')) {
    reasons.push(high ? 'May reflect recent inflammation, infection, intense exercise, or stress.' : 'Normal CRP indicates low systemic inflammation.');
  } else {
    reasons.push(high ? 'Elevation may be related to diet, lifestyle, or recent physiological changes.' : 'Value is lower than typical range.');
  }
  return reasons;
}

function buildDietTips(raw: { name: string; shortName: string; status: BiomarkerStatus }): string[] {
  if (raw.status === 'normal') return ['Maintain a balanced diet and regular exercise.'];
  const high = raw.status === 'high';
  const s = `${raw.name} ${raw.shortName}`.toLowerCase();
  if (s.includes('alt') || s.includes('ast') || s.includes('liver')) {
    return ['Reduce alcohol and added sugars', 'Increase cruciferous vegetables (broccoli, kale)', 'Maintain healthy body weight'];
  }
  if (s.includes('uric')) {
    return ['Stay well hydrated (2L+/day)', 'Limit purine-rich foods (red meat, shellfish)', 'Reduce alcohol intake'];
  }
  if (s.includes('ldl') || s.includes('cholesterol') || s.includes('triglyceride')) {
    return ['Replace saturated fats with unsaturated fats', 'Increase soluble fiber (oats, legumes)', 'Regular aerobic exercise'];
  }
  if (s.includes('glucose')) {
    return ['Limit refined sugars and processed foods', 'Choose whole grains and high-fiber foods', 'Exercise after meals'];
  }
  if (s.includes('crp')) {
    return ['Prioritize 7-9 hours of sleep', 'Regular moderate exercise', 'Anti-inflammatory foods (fatty fish, olive oil)'];
  }
  return [high ? 'Review diet and lifestyle with a clinician' : 'No specific dietary concerns'];
}

// ─── Utility ──────────────────────────────────────────────────────────────────────

const delay = (min: number, max: number) =>
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const randomId = () => `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// ─── Report Upload ───────────────────────────────────────────────────────────

export interface UploadReportResponse {
  reportId: string;
  status: 'uploaded';
  message: string;
  previewUrl: string;
  nextStep: string;
}

export const uploadReport = async (file: File): Promise<UploadReportResponse> => {
  // Keep mock delay for upload animation UI
  await delay(600, 1800);

  const reportId = randomId();
  const previewUrl = URL.createObjectURL(file);

  console.info(`[API] Report uploaded: ${reportId}, file: ${file.name}`);

  // Initialize in-flight parsing tracker
  const inFlight: InFlightParsing = {
    reportId,
    status: 'processing',
    progress: 5,
    startedAt: Date.now(),
  };
  saveInFlight(inFlight);

  // Also save the image URL to localStorage immediately
  const reports = loadReports();
  reports.unshift({
    id: reportId,
    title: `Lab Report — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    date: new Date().toISOString().slice(0, 10),
    healthScore: 0, // will be filled by Gemini
    abnormalCount: 0,
    improvedCount: 0,
    hospital: '',
    doctor: '',
    imageUrl: previewUrl,
    biomarkers: [],
    uploadedAt: new Date().toISOString(),
  });
  saveReports(reports);

  return {
    reportId,
    status: 'uploaded',
    message: 'Report uploaded. Starting AI analysis...',
    previewUrl,
    nextStep: 'start_parsing',
  };
};

// ─── Parse Status Polling ────────────────────────────────────────────────────

export interface ParseStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

export interface ParseStatusResponse {
  reportId: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  currentStep?: string;
  steps: ParseStep[];
  currentlyDetected?: string[];
  nextStep?: string;
  message?: string;
}

let activeParsePromise: Promise<ParseResult> | null = null;

export const getParseStatus = async (
  reportId: string,
  currentProgress: number,
): Promise<ParseStatusResponse> => {
  await delay(300, 600);

  const inFlight = loadInFlight(reportId);

  // Already completed — return cached result
  if (inFlight?.status === 'completed') {
    return {
      reportId,
      status: 'completed',
      progress: 100,
      steps: [
        { id: 'layout', label: 'Reading image layout', status: 'completed' },
        { id: 'ocr', label: 'Detecting biomarker rows', status: 'completed' },
        { id: 'explanation', label: 'Generating plain-language explanation', status: 'completed' },
      ],
      nextStep: 'review_extracted_data',
    };
  }

  // Already errored — return cached error
  if (inFlight?.status === 'error') {
    return {
      reportId,
      status: 'error',
      progress: 0,
      steps: [
        { id: 'layout', label: 'Reading image layout', status: 'completed' },
        { id: 'ocr', label: 'Detecting biomarker rows', status: 'completed' },
        { id: 'explanation', label: 'Generating plain-language explanation', status: 'completed' },
      ],
      message: inFlight.error,
    };
  }

  // If not yet started, trigger real Gemini parsing
  if (!activeParsePromise) {
    const reports = loadReports();
    const storedReport = reports.find(r => r.id === reportId);
    if (storedReport) {
      // Fetch the image file from the object URL
      activeParsePromise = fetchAndParse(reportId, storedReport.imageUrl);
    }
  }

  if (!isGeminiConfigured()) {
    // Simulate mock progress when no API key
    const steps: ParseStep[] = [
      { id: 'layout', label: 'Reading image layout', status: 'completed' },
      { id: 'ocr', label: 'Detecting biomarker rows', status: 'processing' },
      { id: 'explanation', label: 'Generating plain-language explanation', status: currentProgress > 70 ? 'processing' : 'pending' },
    ];
    const newProgress = Math.min(currentProgress + Math.floor(Math.random() * 20) + 10, 95);
    return {
      reportId,
      status: newProgress >= 95 ? 'completed' : 'processing',
      progress: newProgress,
      currentStep: newProgress < 30 ? 'Extracting biomarker values' : newProgress < 60 ? 'Mapping to organ systems' : 'Generating explanations',
      steps,
    };
  }

  // Show progress steps during real parsing
  const steps: ParseStep[] = [
    {
      id: 'layout',
      label: 'Reading image layout',
      status: currentProgress > 10 ? 'completed' : 'processing',
    },
    {
      id: 'ocr',
      label: 'Detecting biomarker rows',
      status: currentProgress > 40 ? (currentProgress > 70 ? 'completed' : 'processing') : 'pending',
    },
    {
      id: 'explanation',
      label: 'Generating plain-language explanation',
      status: currentProgress > 70 ? 'processing' : 'pending',
    },
  ];

  const currentStep = currentProgress < 30
    ? 'Extracting biomarker values and reference ranges'
    : currentProgress < 60
    ? 'Mapping values to organ systems'
    : 'Generating plain-language explanations';

  return {
    reportId,
    status: 'processing',
    progress: currentProgress,
    currentStep,
    steps,
  };
}

async function fetchAndParse(reportId: string, imageUrl: string): Promise<ParseResult> {
  try {
    // Convert object URL back to File-like object
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'lab_report.png', { type: blob.type || 'image/png' });

    const result = await parseLabReport(
      file,
      'doubao-seed-2-0-lite-260428',
      3,
      (attempt, message) => {
        // Update in-flight progress (approximately)
        const inFlight = loadInFlight(reportId);
        if (inFlight) {
          const progress = Math.min(10 + attempt * 25, 80);
          saveInFlight({ ...inFlight, progress });
        }
      },
    );

    if (result.success && result.data) {
      const enrichedBiomarkers = result.data.biomarkers.map((b, i) => enrichBiomarker(b, i));

      const storedReport: StoredReport = {
        id: reportId,
        title: `Lab Report — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        date: new Date().toISOString().slice(0, 10),
        healthScore: result.data.healthScore,
        abnormalCount: enrichedBiomarkers.filter(b => b.status !== 'normal').length,
        improvedCount: 0,
        hospital: result.data.hospital ?? '',
        doctor: result.data.doctor ?? '',
        imageUrl,
        biomarkers: enrichedBiomarkers,
        uploadedAt: new Date().toISOString(),
      };

      // Update in localStorage
      const reports = loadReports();
      const idx = reports.findIndex(r => r.id === reportId);
      if (idx >= 0) reports[idx] = storedReport;
      else reports.unshift(storedReport);
      saveReports(reports);

      saveInFlight({ reportId, status: 'completed', progress: 100, result: storedReport });
    } else {
      saveInFlight({
        reportId,
        status: 'error',
        progress: 0,
        error: result.validationErrors.length > 0
          ? `Validation failed after ${result.attempts} attempts: ${result.validationErrors[0].field}=${result.validationErrors[0].received}`
          : result.error ?? 'Parsing failed',
      });
    }

    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    saveInFlight({ reportId, status: 'error', progress: 0, error: errorMsg });
    return { success: false, attempts: 1, validationErrors: [], error: errorMsg };
  } finally {
    activeParsePromise = null;
  }
}

// ─── Get Report ─────────────────────────────────────────────────────────────

export interface ReportResponse {
  report: StoredReport | (typeof latestReport);
  previousReport?: StoredReport | (typeof latestReport);
  summary: {
    total: number;
    normal: number;
    abnormal: number;
    improved: number;
    worsened: number;
  };
}

export const getReport = async (reportId: string): Promise<ReportResponse> => {
  await delay(300, 600);

  const reports = loadReports();

  // Handle 'latest' by returning the most recent report
  if (reportId === 'latest') {
    const latestStored = reports.length > 0 ? reports[0] : null;
    if (latestStored && latestStored.biomarkers.length > 0) {
      const abnormal = latestStored.biomarkers.filter((b: { status: string }) => b.status !== 'normal').length;
      return {
        report: latestStored,
        previousReport: reports.length > 1 ? reports[1] : undefined,
        summary: {
          total: latestStored.biomarkers.length,
          normal: latestStored.biomarkers.length - abnormal,
          abnormal,
          improved: 0,
          worsened: 0,
        },
      };
    }
    // No stored reports → fall back to mock
    const normal = latestReport.biomarkers.filter((b: { status: string }) => b.status === 'normal').length;
    return {
      report: latestReport,
      previousReport: historicalReports.length > 1 ? historicalReports[1] : undefined,
      summary: {
        total: latestReport.biomarkers.length,
        normal,
        abnormal: latestReport.biomarkers.length - normal,
        improved: dashboardStats.improvingMarkers.length,
        worsened: 0,
      },
    };
  }

  const stored = reports.find((r: { id: string }) => r.id === reportId);

  if (stored && stored.biomarkers.length > 0) {
    const abnormal = stored.biomarkers.filter(b => b.status !== 'normal').length;
    return {
      report: stored,
      previousReport: reports.length > 1 ? reports[1] : undefined,
      summary: {
        total: stored.biomarkers.length,
        normal: stored.biomarkers.length - abnormal,
        abnormal,
        improved: 0,
        worsened: 0,
      },
    };
  }

  // Fall back to mock data
  const normal = latestReport.biomarkers.filter(b => b.status === 'normal').length;
  return {
    report: latestReport,
    previousReport: historicalReports.length > 1 ? historicalReports[1] : undefined,
    summary: {
      total: latestReport.biomarkers.length,
      normal,
      abnormal: latestReport.biomarkers.length - normal,
      improved: dashboardStats.improvingMarkers.length,
      worsened: 0,
    },
  };
};

// ─── Get All Reports ─────────────────────────────────────────────────────────

export const getAllReports = async () => {
  await delay(300, 600);
  const stored = loadReports();

  if (stored.length > 0) {
    return {
      reports: stored.map(r => ({
        id: r.id,
        title: r.title,
        date: r.date,
        healthScore: r.healthScore,
        abnormalCount: r.abnormalCount,
        doctor: r.doctor,
        hospital: r.hospital,
      })),
    };
  }

  return {
    reports: historicalReports.map(r => ({
      id: r.id,
      title: r.title,
      date: r.date,
      healthScore: r.healthScore,
      abnormalCount: r.abnormalCount,
      doctor: r.doctor,
      hospital: r.hospital,
    })),
  };
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineMarkerPoint {
  date: string;
  value: number;
}

export interface TimelineResponse {
  reportId: string;
  biomarkers: {
    id: string;
    name: string;
    shortName: string;
    unit: string;
    referenceRange: string;
    organSystem: string;
    trendData: TimelineMarkerPoint[];
  }[];
  reportDates: string[];
}

export const getTimeline = async (): Promise<TimelineResponse> => {
  await delay(400, 800);
  // Always use latest report for timeline
  return {
    reportId: latestReport.id,
    biomarkers: latestReport.biomarkers.map(b => ({
      id: b.id,
      name: b.name,
      shortName: b.shortName,
      unit: b.unit,
      referenceRange: b.referenceRange,
      organSystem: b.organSystem,
      trendData: b.trendData,
    })),
    reportDates: latestReport.biomarkers[0]?.trendData.map(t => t.date) ?? [],
  };
};

// ─── Organ Map ───────────────────────────────────────────────────────────────

export interface OrganMapResponse {
  systems: typeof organSystemSummaries;
  biomarkers: {
    id: string;
    shortName: string;
    status: string;
    value: number;
    unit: string;
    organSystem: string;
  }[];
}

export const getOrganMap = async (): Promise<OrganMapResponse> => {
  await delay(400, 800);
  return {
    systems: organSystemSummaries,
    biomarkers: latestReport.biomarkers.map(b => ({
      id: b.id,
      shortName: b.shortName,
      status: b.status,
      value: b.value,
      unit: b.unit,
      organSystem: b.organSystem,
    })),
  };
};

// ─── Generate Explanation ───────────────────────────────────────────────────

export interface ExplanationSection {
  title: string;
  content?: string;
  items?: string[];
}

export interface ExplanationResponse {
  reportId: string;
  generatedAt: string;
  sections: ExplanationSection[];
  safetyNote: string;
  modelUsed?: string;
  isRealAI?: boolean;
}

export const generateExplanation = async (
  reportId: string,
  symptomNotes?: string,
): Promise<ExplanationResponse> => {
  await delay(600, 1200);

  const reports = loadReports();
  const stored = reports.find(r => r.id === reportId);
  const biomarkers = stored?.biomarkers ?? latestReport.biomarkers;
  const abnormalBiomarkers = biomarkers.filter(b => b.status !== 'normal');

  // Try real Gemini if configured
  if (isGeminiConfigured()) {
    const result = await generateInsight(
      biomarkers.map(b => ({
        name: b.name,
        shortName: b.shortName,
        value: b.value,
        unit: b.unit,
        referenceRange: b.referenceRange,
        status: b.status,
      })),
      symptomNotes,
    );

    if (result.success && result.text) {
      return {
        reportId,
        generatedAt: new Date().toISOString(),
        sections: [
          {
            title: 'AI Health Insight',
            content: result.text,
          },
        ],
        safetyNote: 'This explanation is for educational and triage reference only. It does not provide a medical diagnosis, treatment plan, or medication advice. Always consult a qualified healthcare provider for medical concerns.',
        modelUsed: 'doubao-seed-2-0-lite-260428',
        isRealAI: true,
      };
    }
  }

  // Fallback to structured mock explanation
  const sections: ExplanationSection[] = [
    {
      title: 'Overview',
      content: `Of the ${biomarkers.length} biomarkers analyzed, ${biomarkers.length - abnormalBiomarkers.length} are within normal reference ranges. ${abnormalBiomarkers.length} require attention.`,
    },
    {
      title: 'What to watch',
      items: abnormalBiomarkers.map(b =>
        `${b.shortName} (${b.name}): ${b.status} — ${b.value} ${b.unit} (Ref: ${b.referenceRange})`
      ),
    },
    {
      title: 'Plain-language interpretation',
      content: abnormalBiomarkers
        .map(b => `${b.shortName} is ${b.status === 'high' ? 'above' : b.status === 'low' ? 'below' : 'near'} the reference range. ${b.plainExplanation}`)
        .join(' '),
    },
    {
      title: 'Possible non-diagnostic factors',
      items: [
        'Recent intense exercise may temporarily affect liver enzymes and inflammation markers.',
        'Poor sleep, stress, and dehydration can elevate CRP and uric acid.',
        'Dietary habits in the days before the test can influence glucose and lipid levels.',
        'Individual variation and laboratory measurement error can cause minor deviations.',
      ],
    },
    {
      title: 'Diet and lifestyle suggestions',
      items: [
        'Maintain consistent hydration (2+ litres of water per day).',
        'Reduce added sugars, refined carbohydrates, and processed foods.',
        'Limit alcohol intake, especially before repeat blood tests.',
        'Prioritize 7-9 hours of sleep per night.',
        'Engage in regular moderate aerobic exercise.',
      ],
    },
    {
      title: 'When to ask a clinician',
      items: [
        'If abnormal markers persist across two or more consecutive tests.',
        'If you experience symptoms such as persistent fatigue, jaundice, or abdominal pain.',
        'If you are taking medications that may affect liver or kidney function.',
      ],
    },
  ];

  return {
    reportId,
    generatedAt: new Date().toISOString(),
    sections,
    safetyNote: 'This explanation is for educational and triage reference only. It does not provide a medical diagnosis, treatment plan, or medication advice. Always consult a qualified healthcare provider for medical concerns.',
    modelUsed: isGeminiConfigured() ? 'doubao-seed-2-0-lite-260428 (error fallback)' : 'mock',
    isRealAI: false,
  };
};

// ─── AI Question Answering ──────────────────────────────────────────────────

export interface AIQueryResponse {
  question: string;
  answer: string;
  context: {
    biomarkers?: string[];
    reportId?: string;
  };
  model: string;
  timestamp: string;
  isRealAI?: boolean;
}

export const askAI = async (question: string): Promise<AIQueryResponse> => {
  await delay(400, 800);

  const reports = loadReports();
  const latest = reports[0] ?? latestReport;
  const biomarkers = latest.biomarkers ?? latestReport.biomarkers;

  // Try real Gemini if configured
  if (isGeminiConfigured()) {
    const result = await generateInsight(
      biomarkers.map(b => ({
        name: b.name,
        shortName: b.shortName,
        value: b.value,
        unit: b.unit,
        referenceRange: b.referenceRange,
        status: b.status,
      })),
      question,
    );

    if (result.success && result.text) {
      return {
        question,
        answer: result.text,
        context: {
          biomarkers: biomarkers.map(b => b.shortName),
          reportId: latest.id,
        },
        model: 'doubao-seed-2-0-lite-260428',
        timestamp: new Date().toISOString(),
        isRealAI: true,
      };
    }
  }

  // Fallback to keyword-based mock responses
  const abnormalBio = biomarkers.filter(b => b.status !== 'normal');
  const topAbnormal = abnormalBio.slice(0, 3).map(b => b.shortName).join(', ');
  const q = question.toLowerCase();

  let answer: string;

  if (q.includes('alt') || q.includes('liver')) {
    const b = biomarkers.find(b => b.id === 'alt') ?? biomarkers.find(b => b.name.toLowerCase().includes('alanine'));
    answer = b ? `${b.shortName} (${b.name}) is ${b.status} at ${b.value} ${b.unit}. ${b.possibleReasons[0] ?? ''}` : `Regarding liver health: Your ALT and AST values indicate liver function status. Elevated ALT may suggest liver stress — consider reviewing alcohol intake, medications, or recent exercise habits.`;
  } else if (q.includes('uric') || q.includes('gout')) {
    const b = biomarkers.find(b => b.id === 'uric_acid') ?? biomarkers.find(b => b.name.toLowerCase().includes('uric'));
    answer = b ? `${b.shortName} is ${b.status} at ${b.value} ${b.unit}. ${b.possibleReasons[0] ?? ''} ${b.dietTips[0] ?? ''}` : `Uric acid elevation may lead to gout. Stay hydrated, limit purine-rich foods (red meat, shellfish), and reduce alcohol. Consult a clinician if you experience joint pain or swelling.`;
  } else if (q.includes('ldl') || q.includes('cholesterol') || q.includes('heart')) {
    const b = biomarkers.find(b => b.id === 'ldl') ?? biomarkers.find(b => b.name.toLowerCase().includes('low-density'));
    answer = b ? `${b.shortName} is ${b.status} at ${b.value} ${b.unit}. ${Array.isArray(b.dietTips) ? b.dietTips.join(' ') : b.dietTips}` : `LDL-C ("bad" cholesterol) above the reference range may increase cardiovascular risk. Focus on unsaturated fats, soluble fiber, and regular aerobic exercise.`;
  } else if (q.includes('glucose') || q.includes('diabetes') || q.includes('blood sugar')) {
    const b = biomarkers.find(b => b.id === 'glucose') ?? biomarkers.find(b => b.name.toLowerCase().includes('glucose'));
    answer = b ? `${b.shortName} is ${b.status} at ${b.value} ${b.unit}. ${b.plainExplanation} ${Array.isArray(b.dietTips) ? b.dietTips.join(' ') : b.dietTips}` : `Fasting blood glucose measures sugar levels after not eating. Elevated values may indicate prediabetes or diabetes — consult a clinician for follow-up testing.`;
  } else if (q.includes('crp') || q.includes('inflammation')) {
    const b = biomarkers.find(b => b.id === 'crp') ?? biomarkers.find(b => b.name.toLowerCase().includes('c-reactive'));
    answer = b ? `${b.shortName} is ${b.status} at ${b.value} ${b.unit}. ${b.plainExplanation} ${Array.isArray(b.dietTips) ? b.dietTips.join(' ') : b.dietTips}` : `CRP is a non-specific marker of inflammation. Elevated CRP may reflect recent infection, intense exercise, poor sleep, or chronic inflammation. Context and repeat testing are key.`;
  } else if (q.includes('compare') || q.includes('previous') || q.includes('last')) {
    answer = `To compare with previous reports, visit the Reports page and use the "Compare Reports" feature. The comparison table shows exact value changes for each biomarker across different report dates.`;
  } else if (q.includes('recommend') || q.includes('what should') || q.includes('suggest')) {
    const top3 = abnormalBio.slice(0, 3);
    answer = top3.length > 0
      ? `Based on your results, my top priorities are: ${top3.map(b => `(1) ${b.shortName} is ${b.status} — ${b.dietTips[0] ?? 'consult a clinician'}`).join('. ')}. Always discuss with your healthcare provider before making significant changes.`
      : `Your results look good! Maintain your current diet, exercise regularly, and stay hydrated. Schedule regular check-ups as recommended by your doctor.`;
  } else {
    answer = `Based on your current results, the markers most needing attention are: ${topAbnormal || 'none'}. ${dashboardStats.aiInsight} Feel free to ask about any specific biomarker or health concern.`;
  }

  return {
    question,
    answer,
    context: {
      biomarkers: biomarkers.map(b => b.shortName),
      reportId: latest.id,
    },
    model: isGeminiConfigured() ? 'doubao-seed-2-0-lite-260428 (error fallback)' : 'mock (keyword-based)',
    timestamp: new Date().toISOString(),
    isRealAI: false,
  };
};

// ─── PDF Export ─────────────────────────────────────────────────────────────

export const exportPDF = async (reportId: string) => {
  await delay(500, 1000);
  console.info(`[API] PDF export triggered: ${reportId}`);
  return {
    success: true,
    message: 'PDF export is coming soon — your report data is ready to render.',
    downloadUrl: null,
  };
};

// ─── Delete Report ──────────────────────────────────────────────────────────

export const deleteReport = async (reportId: string) => {
  await delay(300, 600);

  const reports = loadReports().filter(r => r.id !== reportId);
  saveReports(reports);

  // Also clear in-flight parsing
  const parsingStr = localStorage.getItem(PARSING_KEY);
  if (parsingStr) {
    try {
      const all = JSON.parse(parsingStr);
      delete all[reportId];
      localStorage.setItem(PARSING_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  }

  return { success: true, message: `Report ${reportId} deleted.` };
};