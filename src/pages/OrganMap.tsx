import { useState, useMemo, type ElementType } from "react";
import { latestReport, organSystemSummaries } from "../lib/mockData";
import {
  Activity,
  Brain,
  Droplets,
  HeartPulse,
  Shield,
  Zap,
  Info,
  Droplet
} from "lucide-react";
import { cn } from "../lib/utils";

const SYSTEMS = organSystemSummaries;

// Icon map for each organ system
const iconMap: Record<string, ElementType> = {
  liver: Activity,
  cardiovascular: HeartPulse,
  metabolism: Zap,
  kidney: Droplets,
  blood: Droplet,
  immune: Shield,
};

export default function OrganMap() {
  const [selectedSystemId, setSelectedSystemId] = useState("liver");

  const selectedSystem = useMemo(() => {
    return SYSTEMS.find(s => s.id === selectedSystemId) || SYSTEMS[0];
  }, [selectedSystemId]);

  const relatedBiomarkers = useMemo(() => {
    return latestReport.biomarkers.filter(b => b.organSystem === selectedSystemId);
  }, [selectedSystemId]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Organ Map</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl">
          Understand how different biomarkers affect your body systems. Select an organ system to see associated lab results and AI insights.
        </p>
      </div>

      {/* Main 3-column layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">

        {/* Left: System List */}
        <div className="lg:col-span-3 space-y-3">
          {SYSTEMS.map(sys => {
            const isSelected = selectedSystemId === sys.id;
            const Icon = iconMap[sys.id] ?? Activity;

            return (
              <button
                key={sys.id}
                onClick={() => setSelectedSystemId(sys.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                  isSelected
                    ? "bg-white border-brand-200 shadow-md ring-1 ring-brand-500/10"
                    : "bg-white/60 border-gray-100 hover:border-gray-200 hover:bg-white shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    isSelected
                      ? "bg-brand-50 text-brand-600"
                      : "bg-gray-50 text-gray-400 group-hover:text-gray-600"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "font-semibold",
                    isSelected ? "text-gray-900" : "text-gray-600"
                  )}>
                    {sys.name}
                  </span>
                </div>

                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border",
                  sys.color === 'orange' ? (isSelected ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-transparent border-gray-100 text-rose-500") :
                  sys.color === 'amber' ? (isSelected ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-transparent border-gray-100 text-amber-500") :
                  (isSelected ? "bg-teal-50 border-teal-100 text-teal-600" : "bg-transparent border-gray-100 text-teal-500")
                )}>
                  {sys.status.charAt(0).toUpperCase() + sys.status.slice(1)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center: Abstract 2.5D Concept Map */}
        <div className="lg:col-span-4 bg-gradient-to-b from-gray-50 to-white border border-gray-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">

           {/* Decorative background glow based on selected system */}
           <div className={cn(
             "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-all duration-700",
             selectedSystem.color === 'orange' ? "bg-rose-500" :
             selectedSystem.color === 'amber' ? "bg-amber-500" :
             "bg-teal-500"
           )} />

           <div className="relative z-10 w-full max-w-[240px]">
             <svg viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm">

                {/* Abstract Human Figure */}
                {/* Shoulders & Torso */}
                <path d="M25 45 C15 45, 10 50, 10 65 L15 160 C15 180, 25 190, 50 190 C75 190, 85 180, 85 160 L90 65 C90 50, 85 45, 75 45 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" strokeLinejoin="round" />
                {/* Head */}
                <circle cx="50" cy="20" r="14" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                {/* Neck */}
                <path d="M44 32 L44 45 M56 32 L56 45" stroke="#e2e8f0" strokeWidth="2" />

                {/* Hotspots */}
                {SYSTEMS.map(sys => {
                  const isSelected = selectedSystemId === sys.id;
                  const pt = sys.hotspot;

                  return (
                    <g key={sys.id} className="transition-all duration-500 ease-out" style={{ cursor: 'pointer' }} onClick={() => setSelectedSystemId(sys.id)}>
                      {/* Pulse ring for selected */}
                      {isSelected && (
                        <circle cx={pt.cx} cy={pt.cy} r={pt.r + 4} fill="none" className={cn(
                            "animate-ping opacity-75",
                            sys.color === 'orange' ? "stroke-rose-400" :
                            sys.color === 'amber' ? "stroke-amber-400" : "stroke-teal-400"
                          )}
                          strokeWidth="1"
                        />
                      )}

                      {/* Outer shadow glow */}
                      <circle cx={pt.cx} cy={pt.cy} r={pt.r + 2} className={cn(
                          "transition-colors duration-300 blur-[2px]",
                          isSelected ? (
                            sys.color === 'orange' ? "fill-rose-300" :
                            sys.color === 'amber' ? "fill-amber-300" : "fill-teal-300"
                          ) : "fill-transparent"
                        )}
                      />

                      {/* Core point */}
                      <circle cx={pt.cx} cy={pt.cy} r={isSelected ? pt.r : pt.r * 0.7} className={cn(
                          "transition-all duration-300",
                          isSelected ? (
                            sys.color === 'orange' ? "fill-rose-500" :
                            sys.color === 'amber' ? "fill-amber-500" : "fill-teal-500"
                          ) : "fill-gray-300"
                        )}
                      />
                    </g>
                  )
                })}
             </svg>
           </div>

           <div className="mt-8 text-center relative z-10">
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{selectedSystem.name} Model</h3>
           </div>
        </div>

        {/* Right: Selected Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* AI Explanation Card */}
          <div className="bg-gradient-to-br from-brand-50/50 to-white border border-brand-100 rounded-3xl p-6 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Brain className="w-24 h-24 text-brand-600" />
             </div>

             <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="bg-brand-100 p-2 rounded-xl">
                  <Brain className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Organ Insights</h3>
             </div>

             <p className="text-gray-700 text-sm leading-relaxed relative z-10 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white">
               "{selectedSystem.aiText}"
             </p>
          </div>

          {/* Related Biomarkers Table/List */}
          <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm flex flex-col flex-1">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <Info className="w-4 h-4 text-gray-400" /> Related Biomarkers
             </h3>

             <div className="space-y-3">
               {relatedBiomarkers.length > 0 ? (
                 relatedBiomarkers.map(bio => {
                   const isAbnormal = bio.status !== 'normal';
                   return (
                     <div key={bio.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 leading-tight">{bio.shortName}</h4>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                              isAbnormal ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"
                            )}>{bio.status}</span>
                          </div>
                          <p className="text-[11px] text-gray-500">{bio.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-bold text-lg leading-tight",
                            isAbnormal ? "text-amber-600" : "text-gray-900"
                          )}>
                            {bio.value} <span className="text-xs font-medium text-gray-400">{bio.unit}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">Ref: {bio.referenceRange}</p>
                        </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="p-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                   No specific biomarkers detected for this system in the current report.
                 </div>
               )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}