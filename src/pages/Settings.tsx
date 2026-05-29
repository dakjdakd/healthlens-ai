import { useState, useEffect, type ReactNode } from "react";
import {
  User, Target, BarChart2, Bell, Download,
  Trash2, Save, Database, Moon, Sun,
  ChevronDown, Check, X, AlertTriangle
} from "lucide-react";
import { cn } from "../lib/utils";
import { userProfile } from "../lib/mockData";

// ─── Persisted settings interface ───────────────────────────────────────────
interface AppSettings {
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  height: number;   // cm
  weight: number;   // kg
  unitPref: 'mmol' | 'mg';
  remindersEnabled: boolean;
  darkMode: boolean;
  healthGoals: string[];
}

const defaultSettings: AppSettings = {
  name: userProfile.name,
  age: userProfile.age,
  sex: userProfile.sex as 'Male' | 'Female' | 'Other',
  height: userProfile.height,
  weight: userProfile.weight,
  unitPref: 'mg',
  remindersEnabled: true,
  darkMode: false,
  healthGoals: ['general'],
};

const HEALTH_GOALS = [
  { key: 'general',     label: 'General Health' },
  { key: 'fitness',     label: 'Fitness' },
  { key: 'weight',      label: 'Weight Management' },
  { key: 'metabolic',   label: 'Metabolic Health' },
  { key: 'liver',       label: 'Liver Health' },
  { key: 'cardio',      label: 'Cardiovascular' },
];

const SEX_OPTIONS: AppSettings['sex'][] = ['Male', 'Female', 'Other'];

const STORAGE_KEY = 'healthlens_settings';

// ─── Load / Save helpers ───────────────────────────────────────────────────────
function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultSettings;
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// ─── Unit conversion helpers ─────────────────────────────────────────────────
const UNIT_LABELS: Record<AppSettings['unitPref'], string> = {
  mg: 'mg/dL',
  mmol: 'mmol/L',
};

// ─── Toast helper ─────────────────────────────────────────────────────────────
type ToastState = { visible: boolean; message: string; type: 'success' | 'error' };

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast.visible) return null;
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2",
      toast.type === 'success' ? "bg-teal-600 text-white" : "bg-rose-600 text-white"
    )}>
      {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {toast.message}
      <button onClick={onDismiss} className="ml-1 opacity-70 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Toggle Chip ─────────────────────────────────────────────────────────────
function ToggleChip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  key?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize border",
        active
          ? "bg-brand-50 text-brand-700 border-brand-200 ring-1 ring-brand-500/10 shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
      )}
    >
      {icon && <span className="mr-1.5 opacity-60">{icon}</span>}
      {label}
      {active && <Check className="w-3.5 h-3.5 inline ml-1.5 -mt-0.5 opacity-70" />}
    </button>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const toggleGoal = (key: string) => {
    setSettings(s => {
      const has = s.healthGoals.includes(key);
      // At least one goal must remain
      if (has && s.healthGoals.length === 1) return s;
      return {
        ...s,
        healthGoals: has
          ? s.healthGoals.filter(g => g !== key)
          : [...s.healthGoals, key],
      };
    });
  };

  const handleSave = () => {
    saveSettings(settings);
    showToast('Settings saved successfully.');
  };

  const handleExportData = () => {
    // Collect all stored reports (localStorage) and user profile
    const data = {
      exportDate: new Date().toISOString(),
      settings,
      message: 'This is a demo export. In production, this would contain your full report history.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthlens-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported as JSON.');
  };

  const handleDeleteAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaultSettings);
    setConfirmDeleteOpen(false);
    showToast('All local data has been deleted.', 'success');
  };

  const bmi = settings.height > 0
    ? (settings.weight / ((settings.height / 100) ** 2)).toFixed(1)
    : '—';

  return (
    <>
      <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12 w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your profile, preferences, and data options.</p>
        </div>

        <div className="space-y-8">

          {/* ─── Basic Profile ─── */}
          <section className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" /> Basic Profile
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Age</label>
                <input
                  type="number"
                  value={settings.age}
                  onChange={e => setSettings(s => ({ ...s, age: parseInt(e.target.value) || 0 }))}
                  min={1} max={120}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sex</label>
                <select
                  value={settings.sex}
                  onChange={e => setSettings(s => ({ ...s, sex: e.target.value as AppSettings['sex'] }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none text-gray-900"
                >
                  {SEX_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">BMI</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 flex items-center gap-1">
                  <span className="font-medium text-gray-700">{bmi}</span>
                  <span className="text-xs text-gray-400 ml-1">(calculated)</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Height (cm)</label>
                <input
                  type="number"
                  value={settings.height}
                  onChange={e => setSettings(s => ({ ...s, height: parseInt(e.target.value) || 0 }))}
                  min={50} max={300}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Weight (kg)</label>
                <input
                  type="number"
                  value={settings.weight}
                  onChange={e => setSettings(s => ({ ...s, weight: parseInt(e.target.value) || 0 }))}
                  min={10} max={500}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-gray-900"
                />
              </div>
            </div>
          </section>

          {/* ─── Health Goals ─── */}
          <section className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-500" /> Health Goals
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">Select goals to help personalize AI feedback and explanations.</p>
            <div className="flex flex-wrap gap-3">
              {HEALTH_GOALS.map(g => (
                <ToggleChip
                  key={g.key}
                  label={g.label}
                  active={settings.healthGoals.includes(g.key)}
                  onClick={() => toggleGoal(g.key)}
                  icon={<Target className="w-3.5 h-3.5 inline" />}
                />
              ))}
            </div>
          </section>

          {/* ─── App Preferences ─── */}
          <section className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-500" /> App Preferences
            </h2>

            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Moon className="w-4 h-4 text-gray-400" /> Dark Mode
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Toggle dark/light appearance</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
                  className={cn(
                    "relative inline-flex items-center w-12 h-7 rounded-full transition-colors",
                    settings.darkMode ? "bg-brand-500" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center",
                      settings.darkMode && "translate-x-5"
                    )}
                  >
                    {settings.darkMode
                      ? <Moon className="w-3.5 h-3.5 text-brand-600" />
                      : <Sun className="w-3.5 h-3.5 text-amber-500" />
                    }
                  </span>
                </button>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Measurement Units */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Measurement Units</h4>
                  <p className="text-xs text-gray-500 mt-1">For glucose and lipid markers</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSettings(s => ({ ...s, unitPref: 'mg' }))}
                    className={cn(
                      "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                      settings.unitPref === 'mg' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    mg/dL
                  </button>
                  <button
                    onClick={() => setSettings(s => ({ ...s, unitPref: 'mmol' }))}
                    className={cn(
                      "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                      settings.unitPref === 'mmol' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    mmol/L
                  </button>
                </div>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Re-check Reminders */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" /> Re-check Reminders
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Get notified when it's time for a follow-up test</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.remindersEnabled}
                    onChange={e => setSettings(s => ({ ...s, remindersEnabled: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
            </div>
          </section>

          {/* ─── Data & Privacy ─── */}
          <section className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-500" /> Data & Privacy
            </h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left group"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Export all data</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Download your settings and report history as JSON</p>
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button
                onClick={() => setConfirmDeleteOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-all text-left group"
              >
                <div>
                  <h4 className="font-semibold text-rose-700 text-sm">Delete all data</h4>
                  <p className="text-xs text-rose-600/70 mt-0.5">Permanently remove all stored data from this browser</p>
                </div>
                <Trash2 className="w-5 h-5 text-rose-400 group-hover:text-rose-600" />
              </button>
            </div>
          </section>

          {/* ─── Save Button ─── */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-gray-900 text-white font-semibold text-sm py-3 px-8 rounded-2xl shadow-sm hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>

        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete All Data?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete your settings, all saved reports, and any locally stored biomarker data from this browser. This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="flex-1 font-semibold text-sm bg-gray-100 text-gray-700 py-3 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 font-semibold text-sm bg-rose-600 text-white py-3 rounded-2xl hover:bg-rose-700 transition-colors"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      <Toast
        toast={toast}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </>
  );
}