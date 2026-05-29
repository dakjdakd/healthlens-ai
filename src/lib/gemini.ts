/**
 * HealthLens AI — Doubao AI Service
 *
 * Handles all real AI calls via the Doubao (火山引擎 Ark) API:
 *   - Lab report image parsing (multimodal OCR + structured extraction)
 *   - AI health insights generation
 *
 * Uses the OpenAI-compatible responses API (base_url: ark.cn-beijing.volces.com/api/v3).
 */

import {
  type GeminiBiomarkerRaw,
  type GeminiBiomarker,
  type GeminiReport,
  type ValidationError,
  type BiomarkerStatus,
} from './types';
import OpenAI from 'openai';

// ─── Model Config ─────────────────────────────────────────────────────────────

const DEFAULT_MODEL = 'doubao-seed-2-0-lite-260428';

// ─── Internal Helpers ─────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Prompt Templates ─────────────────────────────────────────────────────────

/**
 * System prompt for lab report extraction.
 * Emphasizes strict JSON schema to enable validation.
 */
const SYSTEM_INSTRUCTION = `You are a precise medical lab report analyzer. Your only job is to extract structured data from the image — nothing else.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no explanation, no code fences. The response must start with '{' and be parseable by JSON.parse().`;

/**
 * User prompt instructing what to extract from the lab report image.
 */
function buildExtractionPrompt() {
  return `Analyze this lab report image and extract all biomarker data.

Return a single JSON object with this exact structure:
{
  "biomarkers": [
    {
      "name": "Full biomarker name in English",
      "shortName": "Standard abbreviation (e.g. ALT, LDL-C)",
      "value": 0.0,
      "unit": "e.g. U/L, mmol/L, mg/L",
      "referenceRange": "e.g. 7-56, <3.12, >1.0",
      "status": "normal | borderline | high | low"
    }
  ],
  "healthScore": 85
}

Rules:
- biomarkers MUST be a non-empty array
- value MUST be a number (integer or float)
- status MUST be exactly one of: normal, borderline, high, low
- healthScore MUST be an integer from 1 to 100
- shortName MUST be 2-10 characters, no spaces
- Do not guess or invent data; only extract what is visible
- If a biomarker value is outside the reference range, set status to "high" or "low" accordingly
- If value is within range, status must be "normal"
- If value is near the boundary (within 10%), status should be "borderline"
- Return only the JSON object — no extra text`;
}

/** Prompt for generating plain-language health insights */
const INSIGHT_SYSTEM_INSTRUCTION = `You are a helpful, empathetic health assistant. You explain medical lab results in plain, accessible language. You are NOT a doctor and cannot diagnose — but you can provide educational context.

Rules:
- Always remind users to consult a healthcare professional for medical decisions
- Be clear and concise, avoiding medical jargon where possible
- When interpreting biomarker results, explain what the marker means, why it might be elevated/lowered, and general lifestyle suggestions
- If you don't know something, say so rather than guessing
- For abnormal markers, focus on actionable, evidence-based suggestions
- Language: respond in the same language as the user's question (supports English and Chinese)`;

function buildInsightPrompt(
  biomarkers: GeminiBiomarker[],
  question?: string,
) {
  const abnormal = biomarkers.filter(b => b.status !== 'normal');
  const normal = biomarkers.filter(b => b.status === 'normal');

  let prompt = 'Based on the following lab report biomarkers:\n\n';
  prompt += biomarkers
    .map(b => `- ${b.shortName} (${b.name}): ${b.value} ${b.unit} | Ref: ${b.referenceRange} | Status: ${b.status}`)
    .join('\n');

  prompt += `\n\nAbnormal markers (${abnormal.length}): ${abnormal.map(b => b.shortName).join(', ') || 'none'}
Normal markers (${normal.length}): ${normal.map(b => b.shortName).join(', ') || 'none'}`;

  if (question) {
    prompt += `\n\nUser question: ${question}`;
    prompt += '\n\nProvide a clear, helpful answer based on the biomarker data above.';
  } else {
    prompt += '\n\nProvide a brief overview of the results with actionable suggestions.';
  }

  prompt += '\n\nAlways include a reminder that this is educational only and not a medical diagnosis.';

  return prompt;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates that raw AI output conforms to our schema.
 * Returns ValidationError[] if invalid, empty array if valid.
 */
function validateGeminiOutput(raw: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (raw === null || raw === undefined) {
    errors.push({ biomarkerIndex: -1, field: 'root', expected: 'non-null object', received: raw });
    return errors;
  }

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    errors.push({ biomarkerIndex: -1, field: 'root', expected: 'object', received: typeof raw });
    return errors;
  }

  const obj = raw as Record<string, unknown>;

  // Validate biomarkers array
  if (!Array.isArray(obj.biomarkers)) {
    errors.push({ biomarkerIndex: -1, field: 'biomarkers', expected: 'non-empty array', received: obj.biomarkers });
    return errors; // can't continue validating without array
  }

  if (obj.biomarkers.length === 0) {
    errors.push({ biomarkerIndex: -1, field: 'biomarkers', expected: 'non-empty array', received: [] });
    return errors;
  }

  // Validate each biomarker
  const validStatuses: BiomarkerStatus[] = ['normal', 'borderline', 'high', 'low'];

  obj.biomarkers.forEach((bio: unknown, idx: number) => {
    if (bio === null || typeof bio !== 'object') {
      errors.push({ biomarkerIndex: idx, field: 'biomarker', expected: 'object', received: bio });
      return;
    }

    const b = bio as Record<string, unknown>;

    const stringFields: Array<keyof GeminiBiomarkerRaw> = ['name', 'shortName'];
    stringFields.forEach(field => {
      if (typeof b[field] !== 'string' || (b[field] as string).trim() === '') {
        errors.push({ biomarkerIndex: idx, field, expected: 'non-empty string', received: b[field] });
      }
    });

    // shortName: 2-10 chars, no spaces
    const shortName = b.shortName as string;
    if (typeof shortName === 'string' && (shortName.length < 2 || shortName.length > 10 || shortName.includes(' '))) {
      errors.push({ biomarkerIndex: idx, field: 'shortName', expected: '2-10 chars, no spaces', received: shortName });
    }

    // unit & referenceRange: skip validation (they're often embedded in name or omitted by OCR)
    // We'll handle missing values downstream in enrichBiomarker()

    // value: must be number
    if (typeof b.value !== 'number' || Number.isNaN(b.value)) {
      errors.push({ biomarkerIndex: idx, field: 'value', expected: 'number', received: b.value });
    }

    // status: must be one of the 4 valid values
    if (!validStatuses.includes(b.status as BiomarkerStatus)) {
      errors.push({ biomarkerIndex: idx, field: 'status', expected: 'normal | borderline | high | low', received: b.status });
    }
  });

  // Validate healthScore
  if (typeof obj.healthScore !== 'number' || obj.healthScore < 1 || obj.healthScore > 100 || !Number.isInteger(obj.healthScore)) {
    errors.push({ biomarkerIndex: -1, field: 'healthScore', expected: 'integer 1-100', received: obj.healthScore });
  }

  return errors;
}

// ─── Parse Result ────────────────────────────────────────────────────────────

export interface ParseResult {
  success: boolean;
  data?: GeminiReport;
  rawText?: string;
  attempts: number;
  validationErrors: ValidationError[];
  error?: string;
}

// ─── Client Factory ──────────────────────────────────────────────────────────

function createDoubaoClient(): OpenAI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env as Record<string, string | undefined>;
  const apiKey = env.VITE_ARK_API_KEY ?? env.ARK_API_KEY;
  return new OpenAI({
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

function getApiKey(): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env as Record<string, string | undefined>;
  return env.VITE_ARK_API_KEY ?? env.ARK_API_KEY;
}

// ─── Main Export: Parse Lab Report ───────────────────────────────────────────

/**
 * Sends a lab report image to Doubao, validates the output,
 * and retries up to `maxRetries` times until valid JSON is returned.
 */
export async function parseLabReport(
  imageFile: File,
  model = DEFAULT_MODEL,
  maxRetries = 3,
  onProgress?: (attempt: number, message: string) => void,
): Promise<ParseResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      attempts: 0,
      validationErrors: [],
      error: 'ARK_API_KEY is not set. Please configure your API key in .env.local',
    };
  }

  const base64 = await fileToBase64(imageFile);

  let lastError: string | undefined;
  let lastValidationErrors: ValidationError[] = [];
  let lastRawText: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    onProgress?.(attempt, `Attempting extraction (${attempt}/${maxRetries})...`);

    try {
      const client = createDoubaoClient();

      const response = await client.responses.create({
        model,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_image',
                detail: 'auto' as const,
                image_url: `data:${imageFile.type || 'image/jpeg'};base64,${base64}`,
              },
              {
                type: 'input_text',
                text: buildExtractionPrompt(),
              },
            ],
          },
        ],
        temperature: 0.1,
      });

      // Debug: log full response to console for debugging
      console.debug('[Doubao] Full response:', JSON.stringify(response, null, 2));
      onProgress?.(attempt, `Response received, validating...`);

      const text = response.output_text ?? '';
      lastRawText = text;

      if (!text.trim()) {
        lastError = 'Empty response from Doubao';
        await delay(500 * attempt);
        continue;
      }

      // Try to extract JSON from response (handle markdown code blocks)
      let parsed: unknown;
      try {
        const cleanText = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        parsed = JSON.parse(cleanText);
      } catch {
        // Try to find JSON in the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            lastError = `Invalid JSON: ${text.slice(0, 200)}`;
            await delay(500 * attempt);
            continue;
          }
        } else {
          lastError = `No JSON found in response: ${text.slice(0, 200)}`;
          await delay(500 * attempt);
          continue;
        }
      }

      // Validate output
      const errors = validateGeminiOutput(parsed);

      if (errors.length > 0) {
        lastValidationErrors = errors;
        lastError = `Validation failed: ${errors.slice(0, 3).map(e => `${e.field}[${e.biomarkerIndex}]=${e.received}`).join(', ')}`;
        onProgress?.(attempt, `Validation failed, retrying (${attempt}/${maxRetries})...`);
        await delay(500 * attempt);
        continue;
      }

      // All good — build result
      const obj = parsed as Record<string, unknown>;
      const biomarkerRaws = obj.biomarkers as GeminiBiomarkerRaw[];

      const biomarkers: GeminiBiomarker[] = biomarkerRaws.map((b) => ({
        name: b.name as string,
        shortName: b.shortName as string,
        value: b.value as number,
        unit: b.unit as string,
        referenceRange: b.referenceRange as string,
        status: b.status as BiomarkerStatus,
      }));

      return {
        success: true,
        data: {
          biomarkers,
          healthScore: (obj.healthScore as number) ?? 75,
        },
        rawText: text,
        attempts: attempt,
        validationErrors: [],
      };

    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.debug('[Doubao] API error:', err);
      onProgress?.(attempt, `API error: ${lastError}`);
      await delay(500 * attempt);
    }
  }

  // All retries exhausted
  return {
    success: false,
    rawText: lastRawText,
    attempts: maxRetries,
    validationErrors: lastValidationErrors,
    error: lastError ?? 'Max retries exceeded',
  };
}

// ─── Generate AI Insight ────────────────────────────────────────────────────

export interface InsightResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Uses Doubao to generate a plain-language health insight from biomarker data.
 */
export async function generateInsight(
  biomarkers: GeminiBiomarker[],
  question?: string,
): Promise<InsightResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured. Add VITE_ARK_API_KEY to .env.local to enable AI insights.',
    };
  }

  try {
    const client = createDoubaoClient();

    const response = await client.responses.create({
      model: DEFAULT_MODEL,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: buildInsightPrompt(biomarkers, question),
            },
          ],
        },
      ],
      temperature: 0.7,
    });

    return {
      success: true,
      text: response.output_text ?? '',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URI prefix (data:image/...;base64,)
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Checks whether an ARK API key is configured.
 * Use this to display UI hints when running in demo mode.
 */
export function isGeminiConfigured(): boolean {
  return !!getApiKey();
}