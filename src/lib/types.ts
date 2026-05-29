// ─── Gemini API Raw Types ─────────────────────────────────────────────────────

/** Raw biomarker data returned by Gemini (before validation) */
export interface GeminiBiomarkerRaw {
  name?: unknown;
  shortName?: unknown;
  value?: unknown;
  unit?: unknown;
  referenceRange?: unknown;
  status?: unknown;
}

/** Raw top-level structure Gemini is expected to return */
export interface GeminiReportRaw {
  biomarkers?: unknown;
  healthScore?: unknown;
  doctor?: unknown;
  hospital?: unknown;
}

/** Validated biomarker after GeminiBiomarkerRaw passes validation */
export interface GeminiBiomarker {
  name: string;
  shortName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: BiomarkerStatus;
}

/** Final validated report from Gemini */
export interface GeminiReport {
  biomarkers: GeminiBiomarker[];
  healthScore: number;
  doctor?: string;
  hospital?: string;
}

// ─── Validation Error ─────────────────────────────────────────────────────────

export interface ValidationError {
  biomarkerIndex: number;
  field: string;
  expected: string;
  received: unknown;
}

// ─── Original Types ──────────────────────────────────────────────────────────

export type BiomarkerStatus = 'normal' | 'borderline' | 'high' | 'low';
export type TrendStatus = 'improving' | 'stable' | 'worsening' | 'stable_high';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BiomarkerResult {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: BiomarkerStatus;
  severity: Severity;
  organSystem: string;
  confidence: number;
  trend: TrendStatus;
  previousValue?: number;
  plainExplanation: string;
  possibleReasons: string;
  dietTips: string;
  sourceBoundingBox?: BoundingBox;
  bboxTop?: string;
  bboxLeft?: string;
  bboxWidth?: string;
  bboxHeight?: string;
  trendData?: Array<{ date: string; value: number }>;
}

export type Severity = 'low' | 'medium' | 'high' | 'none';

export interface ReportSummary {
  totalBiomarkers: number;
  normal: number;
  borderline: number;
  high: number;
  low: number;
  needsAttention: number;
}

export interface MockReport {
  reportId: string;
  title: string;
  uploadedAt: string;
  sourceType: string;
  extractionConfidence: number;
  healthScore: number;
  summary: ReportSummary;
  disclaimer: string;
  biomarkers: BiomarkerResult[];
}

export interface ParseStatusResponse {
  reportId: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  currentStep?: string;
  steps?: {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'completed';
  }[];
  currentlyDetected?: string[];
  nextStep?: string;
  message?: string;
}

export interface UploadResponse {
  reportId: string;
  status: string;
  message: string;
  previewUrl: string;
  nextStep: string;
}

export interface OrganSystemResult {
  id: string;
  name: string;
  status: string;
  score: number;
  highlightColor: string;
  biomarkers: string[];
  summary: string;
}

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
}
