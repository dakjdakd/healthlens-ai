# HealthLens AI

<div align="center">

![HealthLens Banner](https://img.shields.io/badge/HealthLens-AI-4F46E5?style=for-the-badge&labelColor=1E293B)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](#license)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&labelColor=1E293B)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&labelColor=1E293B)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&labelColor=1E293B)](https://vitejs.dev)

**Understand your blood test results with AI-powered insights**

[Demo](#-live-demo) · [Features](#-features) · [Setup](#-setup) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure)

</div>

---

## 🎯 Live Demo

> **Tip:** The app ships with rich demo data for user *Amelia* — no API key needed to explore all features.

👉 **[https://github.com/dakjdakd/healthlens-ai](https://github.com/dakjdakd/healthlens-ai)** (this repo)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 **Upload Lab Report** | Drag-and-drop or select a lab report image; Gemini AI extracts biomarker data automatically |
| 🩺 **14 Biomarkers Tracked** | WBC, RBC, Hemoglobin, Platelets, ALT, AST, Creatinine, Uric Acid, Total Cholesterol, HDL, LDL, Triglycerides, Glucose, CRP |
| 📊 **Health Score Dashboard** | At-a-glance organ system health overview with improving/worsening/stable trend indicators |
| 📈 **Historical Timeline** | Multi-report trend charts showing biomarker changes over time |
| 🗺️ **Organ Map** | Body diagram visualizing which biomarkers relate to which organ systems |
| 💬 **AI Insights** | Plain-language explanations for each biomarker result, powered by Gemini |
| 🧠 **Q&A Assistant** | Ask free-form health questions and get AI-powered answers grounded in your report data |

---

## 🧪 Health Score System

Each biomarker is evaluated against reference ranges and assigned a severity level:

| Status | Color | Meaning |
|---|---|---|
| ✅ **Normal** | Green | Value within healthy range |
| ⚠️ **Borderline** | Yellow/Orange | Slightly outside range; monitor closely |
| 🔴 **High/Low** | Red | Significantly abnormal; consult a physician |

Your overall **Health Score** is a weighted composite of all biomarker severities, updated every time you upload a new report.

---

## 🚀 Setup

### Prerequisites

- **Node.js** ≥ 18
- A **Gemini API Key** (optional — app works in demo mode without it)

### 1 — Clone the repo

```bash
git clone https://github.com/dakjdakd/healthlens-ai.git
cd healthlens-ai
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment *(optional, for real AI parsing)*

```bash
# Copy the example env file
cp .env.example .env.local
```

Open `.env.local` and fill in your key:

```env
VITE_GEMINI_API_KEY=your_key_here
```

> Get your key at [Google AI Studio](https://aistudio.google.com) — free tier available.

**Without a key**, the app runs in **demo mode** using built-in sample data.

### 4 — Run the dev server

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

### Build for production

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 6 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router v7 |
| **Charts** | Recharts |
| **Animations** | Motion (Framer Motion alternative) |
| **AI** | `@google/genai` v2.x SDK |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
healthlens-ai/
├── src/
│   ├── components/        # Reusable UI components (Navbar, Footer, etc.)
│   ├── pages/             # Route-level page components
│   │   ├── Dashboard.tsx
│   │   ├── Upload.tsx
│   │   ├── ReportDetail.tsx
│   │   ├── Timeline.tsx
│   │   ├── OrganMap.tsx
│   │   ├── Insights.tsx
│   │   └── Reports.tsx
│   ├── lib/
│   │   ├── gemini.ts       # Real Gemini AI integration
│   │   ├── mockApi.ts      # API router (real / mock / localStorage)
│   │   ├── mockData.ts     # Demo data for user Amelia
│   │   └── types.ts        # Shared TypeScript types
│   ├── App.tsx             # Root component + routes
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind
├── public/
├── .env.example            # Env template (safe to commit)
├── .gitignore               # Excludes .env.local, node_modules, build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### API Layer Routing

The app decides at runtime which backend to use:

```
User action
    │
    ▼
mockApi.ts  ──── is VITE_GEMINI_API_KEY set?
    │
    ├─── YES ──→  gemini.ts  ──→  Gemini API (real parsing)
    │
    └─── NO ───── is healthlens_reports in localStorage?
                │
                ├─── YES ──→  localStorage (persisted reports)
                │
                └─── NO ──→  mockData.ts  ──→  Demo mode
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## ⚠️ Medical Disclaimer

> HealthLens AI provides **informational insights only**. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with any questions regarding your health or medical conditions.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.