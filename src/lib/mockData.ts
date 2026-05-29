/**
 * HealthLens AI - Mock Data Layer
 * Central source of truth for all mock data.
 * Used by Dashboard, ReportDetail, Timeline, OrganMap, Explanation pages.
 *
 * IMPORTANT: All data references the same user "Amelia", date "May 21, 2026"
 * to maintain consistency across the application.
 */

export type Status = 'normal' | 'high' | 'low' | 'borderline';
export type Severity = 'low' | 'medium' | 'high' | 'none';
export type OrganSystem = 'liver' | 'blood' | 'kidney' | 'metabolism' | 'cardiovascular' | 'immune';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendPoint {
  date: string;        // ISO date string: "YYYY-MM-DD"
  value: number;
}

export interface Biomarker {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  /** Display range: "min - max" or "<max" or ">min" */
  referenceRange: string;
  status: Status;
  severity: Severity;
  organSystem: OrganSystem;
  plainExplanation: string;
  possibleReasons: string;
  dietTips: string;
  trendData: TrendPoint[];
  /** Map to the bounding box on the mock report image */
  bboxTop: string;     // CSS-style percentage: "22%"
  bboxLeft: string;
  bboxWidth: string;
  bboxHeight: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;        // ISO: "YYYY-MM-DD"
  healthScore: number;
  abnormalCount: number;
  improvedCount: number;
  hospital: string;
  doctor: string;
  imageUrl: string;
  biomarkers: Biomarker[];
}

// ============================================================
// User Profile (consistent with Dashboard.tsx "Welcome back, Amelia")
// ============================================================
export const userProfile = {
  name: "Amelia",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  age: 32,
  sex: "Female",
  height: 165,        // cm
  weight: 58,         // kg
  lastReportDate: "2026-05-21",
  overallTrend: "improving" as "improving" | "stable" | "declining",
};

// ============================================================
// Biomarker Definitions (14 total — matching summary: "14 biomarkers extracted")
// ============================================================
export const mockBiomarkers: Record<string, Omit<Biomarker, 'value' | 'status' | 'severity' | 'trendData'>> = {

  // ─── Blood / Hematology ─────────────────────────────────
  WBC: {
    id: 'wbc',
    name: 'White Blood Cell Count',
    shortName: 'WBC',
    unit: '10⁹/L',
    referenceRange: '3.50 - 9.50',
    organSystem: 'immune',
    plainExplanation: "White blood cells are your immune system's soldiers. They help fight infections and inflammation throughout the body.",
    possibleReasons: 'High levels usually mean your body is actively fighting an infection or inflammation. Low levels may indicate a weakened immune system, often from viral infections or certain medications.',
    dietTips: 'Ensure adequate intake of Vitamin C (citrus fruits), Vitamin E (almonds), and Zinc (seeds, legumes) to support white blood cell production and immune function.',
    bboxTop: '18%', bboxLeft: '10%', bboxWidth: '42%', bboxHeight: '5%',
  },

  RBC: {
    id: 'rbc',
    name: 'Red Blood Cell Count',
    shortName: 'RBC',
    unit: '10¹²/L',
    referenceRange: '4.30 - 5.80',
    organSystem: 'blood',
    plainExplanation: 'Red blood cells carry oxygen from your lungs to every tissue in your body and transport carbon dioxide back for exhalation.',
    possibleReasons: 'Low RBC (anemia) can result from iron deficiency, vitamin B12 deficiency, or chronic disease. High RBC may occur with dehydration, living at high altitude, or sleep apnea.',
    dietTips: 'Eat iron-rich foods like spinach, red meat, and beans. Pair iron sources with Vitamin C foods to enhance absorption. Limit excessive tea/coffee with meals.',
    bboxTop: '24%', bboxLeft: '10%', bboxWidth: '38%', bboxHeight: '5%',
  },

  Hemoglobin: {
    id: 'hemoglobin',
    name: 'Hemoglobin',
    shortName: 'Hb',
    unit: 'g/dL',
    referenceRange: '12.0 - 16.0',
    organSystem: 'blood',
    plainExplanation: 'Hemoglobin is the iron-rich protein in red blood cells that binds oxygen and delivers it throughout your body. Low hemoglobin is the hallmark of anemia.',
    possibleReasons: 'Low hemoglobin often reflects iron deficiency anemia, chronic blood loss, or B12/folate deficiency. High hemoglobin may be a compensatory response to low oxygen levels.',
    dietTips: 'Prioritize iron-rich foods (lean red meat, dark leafy greens, lentils). Include vitamin C with iron sources. Consider fortified cereals and breads for supplemental iron.',
    bboxTop: '30%', bboxLeft: '10%', bboxWidth: '36%', bboxHeight: '5%',
  },

  Platelets: {
    id: 'platelets',
    name: 'Platelet Count',
    shortName: 'PLT',
    unit: '10⁹/L',
    referenceRange: '125 - 350',
    organSystem: 'blood',
    plainExplanation: 'Platelets are tiny cell fragments that help your blood clot. They stop bleeding when you get a cut or injury.',
    possibleReasons: 'Low platelets (thrombocytopenia) may result from viral infections, liver disease, or autoimmune conditions. High platelets can occur after surgery, infection, or iron deficiency.',
    dietTips: 'Maintain a balanced diet rich in vitamin K (leafy greens) for healthy clotting. Avoid excessive alcohol which can reduce platelet production.',
    bboxTop: '36%', bboxLeft: '10%', bboxWidth: '40%', bboxHeight: '5%',
  },

  // ─── Liver ───────────────────────────────────────────────
  ALT: {
    id: 'alt',
    name: 'Alanine Aminotransferase',
    shortName: 'ALT',
    unit: 'U/L',
    referenceRange: '7 - 56',
    organSystem: 'liver',
    plainExplanation: 'ALT is an enzyme found mostly in the liver. When liver cells are damaged or inflamed, ALT leaks into the bloodstream — making it one of the best markers for liver health.',
    possibleReasons: 'Elevated ALT is a common sign of liver inflammation from fatty liver disease, heavy alcohol use, certain medications (e.g., statins, acetaminophen), or recent viral infection.',
    dietTips: 'Reduce added sugars, refined carbs, and alcohol intake. Increase liver-friendly foods: walnuts, green tea, and cruciferous vegetables (broccoli, cauliflower). Maintain a healthy body weight.',
    bboxTop: '42%', bboxLeft: '10%', bboxWidth: '44%', bboxHeight: '5%',
  },

  AST: {
    id: 'ast',
    name: 'Aspartate Aminotransferase',
    shortName: 'AST',
    unit: 'U/L',
    referenceRange: '8 - 40',
    organSystem: 'liver',
    plainExplanation: 'AST is an enzyme found in the liver, heart, and muscles. Like ALT, it rises when these tissues are damaged.',
    possibleReasons: 'High AST often accompanies high ALT in liver conditions. If AST is disproportionately higher than ALT, it may point to alcohol-related liver stress or muscle injury.',
    dietTips: 'Maintain a balanced diet and avoid binge drinking. If you exercise intensely, ensure adequate rest and hydration. Consider reviewing any supplements or medications with your doctor.',
    bboxTop: '48%', bboxLeft: '10%', bboxWidth: '42%', bboxHeight: '5%',
  },

  // ─── Kidney ─────────────────────────────────────────────
  Creatinine: {
    id: 'creatinine',
    name: 'Creatinine',
    shortName: 'Cr',
    unit: 'μmol/L',
    referenceRange: '44 - 97',
    organSystem: 'kidney',
    plainExplanation: 'Creatinine is a waste product from muscle metabolism. Healthy kidneys filter it out of your blood — so elevated levels can indicate kidney function is reduced.',
    possibleReasons: 'Elevated creatinine may result from dehydration, kidney disease, high meat intake, certain medications, or strenuous exercise. Mild elevations are common and often reversible.',
    dietTips: 'Stay well-hydrated. Reduce excessive protein supplements. Maintain a healthy weight. Monitor blood pressure. Consult a nephrologist if persistent elevation is noted.',
    bboxTop: '54%', bboxLeft: '10%', bboxWidth: '38%', bboxHeight: '5%',
  },

  UricAcid: {
    id: 'uric_acid',
    name: 'Uric Acid',
    shortName: 'UA',
    unit: 'μmol/L',
    referenceRange: '208 - 428',
    organSystem: 'kidney',
    plainExplanation: 'Uric acid is a waste product created when your body breaks down purines (found in seafood, red meat, and alcohol). High levels can cause gout or kidney stones.',
    possibleReasons: 'Elevated uric acid is commonly caused by a purine-rich diet, alcohol consumption, dehydration, or reduced kidney function. Genetic factors also play a significant role.',
    dietTips: 'Drink plenty of water (2+ litres/day). Limit alcohol, sugary drinks, red meat, and shellfish. Cherries and low-fat dairy products may naturally help lower uric acid levels.',
    bboxTop: '60%', bboxLeft: '10%', bboxWidth: '36%', bboxHeight: '5%',
  },

  // ─── Cardiovascular / Lipids ──────────────────────────────
  TotalChol: {
    id: 'total_chol',
    name: 'Total Cholesterol',
    shortName: 'TC',
    unit: 'mmol/L',
    referenceRange: '< 5.2',
    organSystem: 'cardiovascular',
    plainExplanation: 'Total cholesterol measures all the cholesterol in your blood — including both "good" (HDL) and "bad" (LDL) types. It is one component of overall cardiovascular risk assessment.',
    possibleReasons: 'Elevated total cholesterol is often related to diet, lack of exercise, body weight, genetics, and smoking. It tends to increase with age.',
    dietTips: 'Replace saturated fats (butter, fatty meats) with unsaturated fats (olive oil, avocado, nuts). Increase soluble fiber from oats, barley, and legumes. Aim for at least 30 minutes of moderate exercise most days.',
    bboxTop: '66%', bboxLeft: '10%', bboxWidth: '40%', bboxHeight: '5%',
  },

  HDL: {
    id: 'hdl',
    name: 'High-Density Lipoprotein',
    shortName: 'HDL-C',
    unit: 'mmol/L',
    referenceRange: '> 1.0',
    organSystem: 'cardiovascular',
    plainExplanation: "HDL is the 'good' cholesterol. It helps remove other forms of cholesterol from your bloodstream and transports it to the liver for processing — a protective effect against artery hardening.",
    possibleReasons: 'Low HDL is often associated with sedentary lifestyle, smoking, obesity, type 2 diabetes, and diets high in refined carbohydrates. Genetics also influence HDL levels.',
    dietTips: 'Regular aerobic exercise ( brisk walking, cycling, swimming) is one of the most effective ways to raise HDL. Replace refined carbs with whole grains. Avoid smoking. Moderate alcohol can mildly raise HDL.',
    bboxTop: '72%', bboxLeft: '10%', bboxWidth: '38%', bboxHeight: '5%',
  },

  LDL: {
    id: 'ldl',
    name: 'Low-Density Lipoprotein Cholesterol',
    shortName: 'LDL-C',
    unit: 'mmol/L',
    referenceRange: '< 3.12',
    organSystem: 'cardiovascular',
    plainExplanation: 'LDL is the "bad" cholesterol. It can build up on artery walls, forming plaques that narrow or block arteries — increasing the risk of heart attack and stroke.',
    possibleReasons: 'High LDL is driven by diets rich in saturated and trans fats, lack of exercise, overweight, smoking, genetics (familial hypercholesterolemia), and conditions like hypothyroidism or diabetes.',
    dietTips: 'Replace saturated fats with unsaturated fats. Increase soluble fiber (oats, beans, lentils, apples). Include plant sterols/stanols. Lose excess weight. Regular exercise helps lower LDL.',
    bboxTop: '78%', bboxLeft: '10%', bboxWidth: '44%', bboxHeight: '5%',
  },

  Triglycerides: {
    id: 'triglycerides',
    name: 'Triglycerides',
    shortName: 'TG',
    unit: 'mmol/L',
    referenceRange: '< 1.70',
    organSystem: 'cardiovascular',
    plainExplanation: 'Triglycerides are the most common type of fat in the body. They store energy from food. High levels in the blood are linked to atherosclerosis and cardiovascular disease.',
    possibleReasons: 'High triglycerides are often caused by eating more calories than you burn, especially from refined carbs and alcohol. Obesity, diabetes, and certain medications can also contribute.',
    dietTips: 'Cut back on refined sugars (sodas, sweets, white bread). Limit alcohol intake. Replace simple carbs with whole grains and vegetables. Eat fatty fish 2× per week for omega-3s.',
    bboxTop: '84%', bboxLeft: '10%', bboxWidth: '42%', bboxHeight: '5%',
  },

  // ─── Metabolic ───────────────────────────────────────────
  Glucose: {
    id: 'glucose',
    name: 'Fasting Blood Glucose',
    shortName: 'Glucose',
    unit: 'mmol/L',
    referenceRange: '3.90 - 6.10',
    organSystem: 'metabolism',
    plainExplanation: "Fasting blood glucose measures the amount of sugar in your blood after not eating for at least 8 hours. It is the primary screening test for diabetes and prediabetes.",
    possibleReasons: 'High fasting glucose suggests impaired glucose regulation (prediabetes or diabetes), often driven by insulin resistance, poor diet, lack of exercise, or genetics. Stress and certain medications can also raise levels.',
    dietTips: 'Limit refined sugars and processed foods. Focus on high-fiber foods (whole grains, legumes, vegetables). Include lean proteins and healthy fats at each meal. Walk or exercise after meals to improve insulin sensitivity.',
    bboxTop: '90%', bboxLeft: '10%', bboxWidth: '40%', bboxHeight: '5%',
  },

  // ─── Inflammation ───────────────────────────────────────
  CRP: {
    id: 'crp',
    name: 'C-Reactive Protein',
    shortName: 'CRP',
    unit: 'mg/L',
    referenceRange: '< 3.0',
    organSystem: 'immune',
    plainExplanation: 'CRP is a general inflammation marker produced by the liver in response to inflammation anywhere in the body. It is non-specific — it tells you inflammation is present but not where or why.',
    possibleReasons: 'Elevated CRP can result from recent infection, chronic inflammation, intense exercise, poor sleep, stress, obesity, or autoimmune conditions. A single mild elevation is common and often benign.',
    dietTips: 'Prioritize sleep (7-9 hours/night). Maintain a healthy weight. Exercise regularly but avoid overtraining. Reduce processed foods. Anti-inflammatory foods include berries, fatty fish, olive oil, and leafy greens.',
    bboxTop: '96%', bboxLeft: '10%', bboxWidth: '36%', bboxHeight: '5%',
  },
};

// ============================================================
// Full Report — 14 Biomarkers (consistent: "May 21, 2026", Amelia)
// ============================================================
// Trend data spans Nov 2024 → Aug 2025 → Dec 2025 → May 2026
const trend = (pts: [string, number][]) => pts.map(([date, value]) => ({ date, value }));

export const latestReport: Report = {
  id: 'rpt_2026_05_21',
  title: 'Annual Checkup — May 2026',
  date: '2026-05-21',
  healthScore: 82,
  abnormalCount: 4,
  improvedCount: 5,
  hospital: 'City Medical Centre',
  doctor: 'Dr. Rachel Thompson',
  imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  biomarkers: [
    // ── Blood ──
    { ...mockBiomarkers.WBC,        value: 10.2, status: 'high',        severity: 'low',     trendData: trend([['2024-11-10', 8.5], ['2025-08-18', 9.1], ['2025-12-02', 9.8], ['2026-05-21', 10.2]]) },
    { ...mockBiomarkers.RBC,        value: 4.6,  status: 'normal',      severity: 'none',    trendData: trend([['2024-11-10', 4.8], ['2025-08-18', 4.7], ['2025-12-02', 4.5], ['2026-05-21',  4.6]]) },
    { ...mockBiomarkers.Hemoglobin, value: 13.2, status: 'normal',     severity: 'none',    trendData: trend([['2024-11-10', 13.8], ['2025-08-18', 13.5], ['2025-12-02', 13.3], ['2026-05-21', 13.2]]) },
    { ...mockBiomarkers.Platelets, value: 245,  status: 'normal',     severity: 'none',    trendData: trend([['2024-11-10', 260], ['2025-08-18', 250], ['2025-12-02', 248], ['2026-05-21', 245]]) },

    // ── Liver ──
    { ...mockBiomarkers.ALT,        value: 68,   status: 'high',        severity: 'medium', trendData: trend([['2024-11-10', 35], ['2025-08-18', 48], ['2025-12-02', 44], ['2026-05-21', 68]]) },
    { ...mockBiomarkers.AST,        value: 39,   status: 'normal',      severity: 'none',    trendData: trend([['2024-11-10', 22], ['2025-08-18', 35], ['2025-12-02', 36], ['2026-05-21', 39]]) },

    // ── Kidney ──
    { ...mockBiomarkers.Creatinine, value: 82,   status: 'normal',      severity: 'none',    trendData: trend([['2024-11-10', 78], ['2025-08-18', 80], ['2025-12-02', 79], ['2026-05-21', 82]]) },
    { ...mockBiomarkers.UricAcid,   value: 462,  status: 'high',        severity: 'high',    trendData: trend([['2024-11-10', 380], ['2025-08-18', 420], ['2025-12-02', 445], ['2026-05-21', 462]]) },

    // ── Cardiovascular ──
    { ...mockBiomarkers.TotalChol,  value: 5.1,  status: 'normal',      severity: 'none',    trendData: trend([['2024-11-10', 5.6], ['2025-08-18', 5.4], ['2025-12-02', 5.3], ['2026-05-21', 5.1]]) },
    { ...mockBiomarkers.HDL,        value: 1.42, status: 'normal',      severity: 'none',    trendData: trend([['2024-11-10', 1.30], ['2025-08-18', 1.35], ['2025-12-02', 1.38], ['2026-05-21', 1.42]]) },
    { ...mockBiomarkers.LDL,        value: 3.58, status: 'borderline',  severity: 'medium', trendData: trend([['2024-11-10', 4.2], ['2025-08-18', 3.9], ['2025-12-02', 3.72], ['2026-05-21', 3.58]]) },
    { ...mockBiomarkers.Triglycerides, value: 1.52, status: 'normal',  severity: 'none',    trendData: trend([['2024-11-10', 1.8], ['2025-08-18', 1.65], ['2025-12-02', 1.58], ['2026-05-21', 1.52]]) },

    // ── Metabolism ──
    { ...mockBiomarkers.Glucose,    value: 5.8,  status: 'normal',      severity: 'none',    trendData: trend([['2024-11-10', 5.5], ['2025-08-18', 5.9], ['2025-12-02', 5.6], ['2026-05-21', 5.8]]) },

    // ── Inflammation ──
    { ...mockBiomarkers.CRP,        value: 4.8,  status: 'high',        severity: 'medium', trendData: trend([['2024-11-10', 1.5], ['2025-08-18', 2.1], ['2025-12-02', 2.8], ['2026-05-21', 4.8]]) },
  ],
};

// ============================================================
// Historical Reports (for Reports.tsx / compare feature)
// ============================================================
export const historicalReports: Report[] = [
  latestReport,
  {
    id: 'rpt_2025_12_02',
    title: 'Routine Follow-up — Dec 2025',
    date: '2025-12-02',
    healthScore: 85,
    abnormalCount: 2,
    improvedCount: 4,
    hospital: 'City Medical Centre',
    doctor: 'Dr. Rachel Thompson',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    biomarkers: latestReport.biomarkers.map(b => ({
      ...b,
      trendData: b.trendData.filter(t => t.date <= '2025-12-02'),
    })),
  },
  {
    id: 'rpt_2025_08_18',
    title: 'Routine Follow-up — Aug 2025',
    date: '2025-08-18',
    healthScore: 80,
    abnormalCount: 5,
    improvedCount: 3,
    hospital: 'City Medical Centre',
    doctor: 'Dr. Michael Chen',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    biomarkers: latestReport.biomarkers.map(b => ({
      ...b,
      trendData: b.trendData.filter(t => t.date <= '2025-08-18'),
    })),
  },
  {
    id: 'rpt_2024_11_10',
    title: 'Annual Checkup — Nov 2024',
    date: '2024-11-10',
    healthScore: 88,
    abnormalCount: 1,
    improvedCount: 2,
    hospital: 'City Medical Centre',
    doctor: 'Dr. Rachel Thompson',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    biomarkers: latestReport.biomarkers.map(b => ({
      ...b,
      trendData: b.trendData.filter(t => t.date <= '2024-11-10'),
    })),
  },
];

// ============================================================
// Organ System Summaries (for Dashboard / OrganMap)
// ============================================================
export const organSystemSummaries = [
  {
    id: 'liver',
    name: 'Liver',
    status: 'attention' as const,
    color: 'orange',
    score: 72,
    biomarkers: ['ALT', 'AST'],
    aiText: 'Your ALT is slightly above the standard reference range. This mild elevation may be associated with recent diet, alcohol intake, medication, or metabolic stress. Maintaining a balanced diet, reviewing these values in 3 months, and consulting a clinician if persistent is recommended.',
    hotspot: { cx: 45, cy: 110, r: 8 },
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    status: 'borderline' as const,
    color: 'amber',
    score: 79,
    biomarkers: ['LDL-C', 'HDL-C', 'Triglycerides', 'Total Chol.'],
    aiText: 'LDL-C (the "bad" cholesterol) is borderline elevated. While not acutely alarming, optimizing lipid profile through dietary changes, regular aerobic exercise, and maintaining healthy weight reduces long-term cardiovascular risk.',
    hotspot: { cx: 55, cy: 80, r: 9 },
  },
  {
    id: 'metabolism',
    name: 'Metabolism',
    status: 'watch' as const,
    color: 'amber',
    score: 84,
    biomarkers: ['Glucose'],
    aiText: 'Fasting glucose is within the normal range and stable. Continued adherence to a balanced diet with limited refined sugars and regular physical activity is advisable for long-term metabolic health.',
    hotspot: { cx: 50, cy: 130, r: 7 },
  },
  {
    id: 'kidney',
    name: 'Kidney',
    status: 'attention' as const,
    color: 'orange',
    score: 76,
    biomarkers: ['Uric Acid', 'Creatinine'],
    aiText: 'Uric acid is persistently above the reference range. While creatinine is normal, the uric acid elevation warrants attention — particularly regarding diet, hydration status, and potential discussion with a clinician if symptoms of gout appear.',
    hotspot: { cx: 35, cy: 125, r: 6 },
  },
  {
    id: 'blood',
    name: 'Blood',
    status: 'normal' as const,
    color: 'teal',
    score: 91,
    biomarkers: ['RBC', 'Hemoglobin', 'Platelets'],
    aiText: 'Hematological parameters including red blood cells, hemoglobin, and platelets are all within healthy reference ranges, indicating normal oxygen transport and clotting function.',
    hotspot: { cx: 25, cy: 60, r: 5 },
  },
  {
    id: 'immune',
    name: 'Immune',
    status: 'attention' as const,
    color: 'orange',
    score: 74,
    biomarkers: ['WBC', 'CRP'],
    aiText: 'WBC and CRP are mildly elevated. This non-specific finding may reflect recent exercise intensity, sleep quality, temporary inflammation, or a subclinical infection. It is not a diagnosis — context and repeat testing are key.',
    hotspot: { cx: 50, cy: 50, r: 6 },
  },
];

// ============================================================
// Dashboard Summary Stats (computed from latestReport)
// ============================================================
export const dashboardStats = {
  healthScore: latestReport.healthScore,
  trendDescription: 'Mostly stable',
  abnormalCount: latestReport.abnormalCount,
  improvedCount: latestReport.improvedCount,
  attentionBreakdown: {
    highRisk: 1,   // Uric Acid (severity: high)
    mediumRisk: 2, // ALT, LDL, CRP (severity: medium)
    slight: 1,     // WBC (severity: low)
  },
  improvingMarkers: ['LDL-C', 'Triglycerides', 'HDL-C', 'Total Chol.', 'RBC'],
  attentionMarkers: [
    { name: 'Uric Acid', status: 'High', severity: 'high' },
    { name: 'ALT',       status: 'High', severity: 'medium' },
    { name: 'CRP',       status: 'High', severity: 'medium' },
    { name: 'LDL-C',     status: 'Borderline', severity: 'medium' },
  ],
  aiInsight: "Your liver-related markers are slightly elevated compared with the reference range. This does not mean a diagnosis, but it may be worth reviewing alcohol intake, sleep, medication history, and consulting a clinician if persistent.",
};