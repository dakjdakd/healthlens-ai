import { useState } from "react";
import { latestReport, Biomarker } from "../lib/mockData";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceArea, 
  CartesianGrid 
} from "recharts";
import { cn } from "../lib/utils";
import { Activity, Brain, ArrowUpRight, ArrowRight, Minus } from "lucide-react";

export default function Timeline() {
  const [selectedBio, setSelectedBio] = useState<Biomarker>(latestReport.biomarkers[0]);
  const [timeRange, setTimeRange] = useState("6M");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Liver", "Kidney", "Metabolic", "Blood", "Cardiovascular", "Inflammation"];
  const timeRanges = ["3M", "6M", "1Y", "All"];

  // Filter left list based on category
  const categoryMap: Record<string, string[]> = {
    'All': [],
    'Metabolic': ['metabolism'],
    'Inflammation': ['immune'],
    'Liver': ['liver'],
    'Kidney': ['kidney'],
    'Blood': ['blood'],
    'Cardiovascular': ['cardiovascular'],
  };

  const filteredList = latestReport.biomarkers.filter(bio => {
    const targets = categoryMap[activeCategory] ?? [];
    if (targets.length === 0) return true;
    return targets.includes(bio.organSystem);
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Biomarker Timeline</h1>
        <p className="text-sm text-gray-500 mt-2">Track how your key health markers change over time.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                activeCategory === cat 
                  ? "bg-gray-900 text-white border-transparent shadow-sm" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 border border-gray-200/60">
          {timeRanges.map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                timeRange === tr 
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: List */}
        <div className="lg:col-span-4 bg-white border border-gray-200/60 rounded-3xl p-4 shadow-sm flex flex-col h-[600px] overflow-hidden">
          <div className="text-sm font-semibold text-gray-900 px-2 py-2 mb-2 flex items-center justify-between">
            <span>Indicators</span>
            <span className="text-gray-400 font-normal">{filteredList.length} items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar">
            {filteredList.map(bio => {
              const isSelected = selectedBio.id === bio.id;
              const isAbnormal = bio.status !== 'normal';
              
              // Mock trend logic
              const latestVal = bio.trendData[bio.trendData.length - 1].value;
              const prevVal = bio.trendData[bio.trendData.length - 2].value;
              let trendState = "Stable";
              let TrendIcon = Minus;
              if (Math.abs(latestVal - prevVal) > (latestVal * 0.05)) {
                 if ((bio.status === 'high' && latestVal < prevVal) || (bio.status === 'low' && latestVal > prevVal) || (!isAbnormal && Math.abs(latestVal - prevVal) > 0)) {
                   trendState = "Improving";
                   TrendIcon = ArrowUpRight;
                 } else {
                   trendState = "Worsening";
                   TrendIcon = ArrowRight; // just to show some distinction
                 }
              }

              return (
                <button
                  key={bio.id}
                  onClick={() => setSelectedBio(bio)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                    isSelected 
                      ? "bg-brand-50/50 border-brand-200 shadow-sm ring-1 ring-brand-500/10" 
                      : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3 w-[50%]">
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">{bio.shortName}</h4>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{bio.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bio.trendData}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={isAbnormal ? "#f43f5e" : "#2dd4bf"} 
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider mt-1",
                      trendState === 'Improving' ? "text-teal-600" : trendState === 'Worsening' ? "text-rose-500" : "text-gray-400"
                    )}>
                      {trendState}
                    </div>
                  </div>

                  <div className="w-[30%] text-right">
                    <div className={cn(
                      "font-bold text-base tracking-tight",
                      isAbnormal ? "text-rose-600" : "text-gray-900"
                    )}>
                      {bio.value}
                    </div>
                    <div className="text-[10px] text-gray-400">{bio.unit}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chart & Summary */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col h-[400px]">
            {/* Chart Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                    selectedBio.status === 'high' ? "bg-rose-50 text-rose-600" :
                    selectedBio.status === 'low' ? "bg-amber-50 text-amber-600" :
                    "bg-teal-50 text-teal-600"
                  )}>
                    {selectedBio.shortName}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedBio.name}</h2>
                    <p className="text-xs text-gray-500 font-medium">Reference Range: {selectedBio.referenceRange} {selectedBio.unit}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border",
                  selectedBio.status === 'high' ? "bg-rose-50 text-rose-600 border-rose-100" :
                  selectedBio.status === 'low' ? "bg-amber-50 text-amber-600 border-amber-100" :
                  "bg-teal-50 text-teal-700 border-teal-100"
                )}>
                  {selectedBio.status}
                </span>
                <p className="text-[10px] text-gray-400 mt-2 text-right">Latest: {new Date(latestReport.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Big Chart */}
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedBio.trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('en-US', { month: 'short' });
                    }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} 
                    domain={['dataMin - domainOffset', 'dataMax + domainOffset']} 
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip unit={selectedBio.unit} name={selectedBio.shortName} />} />
                  
                  {/* Reference Range Background */}
                  {selectedBio.referenceRange.includes('-') && (
                    <ReferenceArea
                      y1={parseFloat(selectedBio.referenceRange.split('-')[0])}
                      y2={parseFloat(selectedBio.referenceRange.split('-')[1])}
                      {...({ fill: "#f3f6f8", fillOpacity: 1, strokeOpacity: 0 } as any)}
                    />
                  )}

                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={selectedBio.status === 'normal' ? "#0d9488" : "#f43f5e"} 
                    strokeWidth={3} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={(props: any) => {
                      const { cx, cy, value, payload } = props;
                      // Determine if point is outside normal range
                      let isOut = false;
                      if (selectedBio.referenceRange.includes('-')) {
                        const parts = selectedBio.referenceRange.split('-');
                        const min = parseFloat(parts[0]);
                        const max = parseFloat(parts[1]);
                        isOut = value < min || value > max;
                      }
                      return (
                        <circle 
                          key={`dot-${payload.date}`} 
                          cx={cx} 
                          cy={cy} 
                          r={4} 
                          fill={isOut ? "#fb7185" : "#2dd4bf"} 
                          stroke="#ffffff" 
                          strokeWidth={2} 
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Trend Summary */}
          <div className="bg-gradient-to-br from-brand-50/80 to-white border border-brand-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Brain className="w-32 h-32 text-brand-600" />
             </div>
             
             <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="bg-brand-100 p-2 rounded-xl">
                  <Activity className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Trend Summary</h3>
             </div>
             
             <p className="text-gray-700 text-sm leading-relaxed relative z-10 mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white">
               "Your LDL-C has gradually improved over the last three reports, returning closer to the reference average. However, Uric Acid remains consistently above the reference range. Consider discussing this persistent elevation with a clinician, particularly regarding diet or potential medication adjustments."
             </p>

             <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                <PatternCard title="Liver markers" desc="slightly elevated" type="attention" />
                <PatternCard title="Lipid profile" desc="improving" type="good" />
                <PatternCard title="Glucose" desc="stable" type="neutral" />
                <PatternCard title="Uric acid" desc="needs attention" type="attention" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function PatternCard({ title, desc, type }: { title: string, desc: string, type: 'attention' | 'good' | 'neutral' }) {
  return (
    <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm text-center">
      <h4 className="text-xs font-semibold text-gray-900 mb-1">{title}</h4>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block",
        type === 'attention' ? "bg-amber-50 text-amber-700" :
        type === 'good' ? "bg-teal-50 text-teal-700" :
        "bg-gray-100 text-gray-600"
      )}>
        {desc}
      </span>
    </div>
  );
}

function CustomTooltip({ active, payload, label, unit, name }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const val = payload[0].value;
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return (
      <div className="bg-gray-900/95 backdrop-blur shadow-xl border border-gray-800 p-4 rounded-2xl">
        <p className="text-xs text-gray-400 font-medium mb-2">{formattedDate}</p>
        <div className="flex items-end gap-2">
          <div className="text-2xl font-bold text-white tracking-tight">{val}</div>
          <div className="text-xs text-gray-400 mb-1">{unit}</div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-semibold">{name} measurement</p>
      </div>
    );
  }
  return null;
}

