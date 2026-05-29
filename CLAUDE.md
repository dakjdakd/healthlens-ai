# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HealthLens AI is a React SPA that helps users understand their blood test (lab report) results. Upload a lab report image, and the app extracts biomarker data via Gemini AI and presents it with plain-language explanations.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build
npm run lint      # ESLint check
npm run test      # Vitest unit tests
```

## Architecture

### AI Layer: `src/lib/gemini.ts`
Handles all real Gemini API calls using `@google/genai` v2.x SDK. Key functions:
- `parseLabReport(file)` — sends image to Gemini, retries until valid JSON is returned, validates output against schema
- `generateInsight(biomarkers, question?)` — plain-language health explanation
- `isGeminiConfigured()` — checks for `VITE_GEMINI_API_KEY` in env

### API Layer: `src/lib/mockApi.ts`
Main data router. Routes requests to:
1. Real Gemini (when API key configured) → `gemini.ts`
2. localStorage (for persisted reports) → reads/writes `healthlens_reports` key
3. Mock fallback (demo mode, no API key) → `mockData.ts`

Key functions: `uploadReport()`, `getParseStatus()`, `getReport()`, `getAllReports()`, `deleteReport()`, `generateExplanation()`, `askAI()`

### Mock Data: `src/lib/mockData.ts`
Demo data for user "Amelia" with consistent report date "May 21, 2026". Defines:
- `mockBiomarkers` — template definitions for 14 biomarkers (WBC, RBC, Hemoglobin, Platelets, ALT, AST, Creatinine, UricAcid, TotalChol, HDL, LDL, Triglycerides, Glucose, CRP)
- `latestReport` — current report with populated values, trendData, status, severity
- `historicalReports` — 3 past reports for timeline comparison
- `dashboardStats` — improving/worsening/stable marker lists

### Dual Biomarker Type System

Two type definitions exist for historical reasons. Both are used throughout the codebase:

**`src/lib/types.ts`** (`BiomarkerResult`) — Used by `mockApi.ts` (StoredReport) and all page components
**`src/lib/mockData.ts`** (`Biomarker`) — Used in mock data and `ReportDetail.tsx`

The `enrichBiomarker()` function in `mockApi.ts` maps raw Gemini data → `BiomarkerResult`. Do not conflate the two — they have different fields (e.g., `trendData` vs `trend`).

### Persistence

Reports are stored in `localStorage` under `healthlens_reports` as JSON array. Each stored report holds `BiomarkerResult[]`. Mock reports (from `latestReport`) are always available as fallback if no stored reports exist.

### Routing

- `/` → Landing page
- `/dashboard` → Overview with health score, organ system summary, improvement trends
- `/upload` → Upload and parse lab report images
- `/report/latest` → Detailed view of most recent report with biomarker list
- `/timeline` → Historical trend charts across multiple reports
- `/organ-map` → Body diagram showing biomarker distribution by organ
- `/insights` → AI-generated health explanation
- `/reports` → List all stored reports

## Environment Configuration

Copy `.env.example` → `.env.local` and add your API key to enable real parsing:
```
VITE_GEMINI_API_KEY=your_key_here
```

Without the key, the app runs in demo mode using mock data. The Upload page shows a warning when no key is detected.