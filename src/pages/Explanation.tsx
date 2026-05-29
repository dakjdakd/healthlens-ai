import { useState, useRef, useEffect } from "react";
import { latestReport } from "../lib/mockData";
import { askAI, type AIQueryResponse } from "../lib/mockApi";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Brain,
  Coffee,
  Info,
  Clock,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  Stethoscope,
  TrendingUp,
  Leaf
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Quick Question Suggestions ──────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: <HeartPulse className="w-4 h-4" />, text: "Explain my LDL cholesterol results" },
  { icon: <Coffee className="w-4 h-4" />, text: "What causes high uric acid?" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "How do my results compare to last time?" },
  { icon: <Leaf className="w-4 h-4" />, text: "Give me diet recommendations" },
  { icon: <Stethoscope className="w-4 h-4" />, text: "When should I see a doctor?" },
];

// ─── Message Types ────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ message, key: _bkey }: { message: Message; key?: string }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
        isUser ? "bg-brand-500 text-white order-2" : "bg-teal-50 text-teal-600 border border-teal-100 order-1"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={cn(
        "max-w-[80%] flex flex-col gap-1",
        isUser ? "items-end order-1" : "items-start order-2"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-brand-600 text-white rounded-tr-md"
            : "bg-white border border-gray-100 text-gray-700 rounded-tl-md"
        )}>
          {message.text}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in">
      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-teal-600" />
      </div>
      <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function Explanation() {
  const abnormalBiomarkers = latestReport.biomarkers.filter(b => b.status !== 'normal');
  const [selectedBioId, setSelectedBioId] = useState(abnormalBiomarkers[0]?.id);
  const selectedBio = abnormalBiomarkers.find(b => b.id === selectedBioId) || abnormalBiomarkers[0];

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: `Hello! I'm your HealthLens AI assistant. I can help you understand your biomarkers, explain medical terms in plain language, and suggest lifestyle improvements. What would you like to know about your ${latestReport.title}?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle sending a message
  const handleSend = async (text?: string) => {
    const query = (text ?? inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: AIQueryResponse = await askAI(query);
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        text: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'ai',
        text: "I'm sorry, I couldn't process that question right now. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (!chatOpen) setChatOpen(true);
    handleSend(text);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">

      {/* ─── Header Summary ─── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Explanation</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Plain-language interpretation of your abnormal biomarkers with AI-powered insights and diet suggestions.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-gray-200/60 shadow-sm px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="text-brand-600 font-bold">{latestReport.healthScore}</span> Health Score
          </div>
          <div className="bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-orange-700">
            <AlertTriangle className="w-4 h-4" />
            <span>{abnormalBiomarkers.length} Abnormal</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 flex-1 mb-8">

        {/* ─── Left: Abnormal Biomarker List ─── */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <h3 className="font-semibold text-gray-900 px-1 mb-2">Metrics needing attention</h3>

          {/* Biomarker list */}
          <div className="bg-white border border-gray-200/60 rounded-3xl p-4 shadow-sm flex flex-col gap-2">
            {abnormalBiomarkers.map(bio => {
              const isSelected = selectedBioId === bio.id;
              return (
                <button
                  key={bio.id}
                  onClick={() => setSelectedBioId(bio.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3",
                    isSelected
                      ? "bg-brand-50/60 border-brand-200 shadow-sm ring-1 ring-brand-500/10"
                      : "bg-gray-50/40 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 w-2 h-2 rounded-full shrink-0",
                    bio.severity === 'high' ? "bg-rose-500" :
                    bio.severity === 'medium' ? "bg-amber-500" : "bg-orange-400"
                  )} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn("font-semibold text-sm", isSelected ? "text-gray-900" : "text-gray-700")}>
                        {bio.shortName}
                      </span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        bio.status === 'high' ? "bg-rose-50 text-rose-700 border-rose-100" :
                        "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {bio.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {bio.value} {bio.unit} · Ref: {bio.referenceRange}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed line-clamp-2">
                      {bio.plainExplanation}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI Chat Toggle */}
          <button
            onClick={() => setChatOpen(o => !o)}
            className="w-full bg-gradient-to-r from-brand-500 to-teal-500 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold text-sm">Ask AI Anything</div>
                <div className="text-xs opacity-80">About your biomarkers, diet, or health</div>
              </div>
            </div>
            <ChevronDown className={cn("w-5 h-5 transition-transform", chatOpen && "rotate-180")} />
          </button>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="bg-white border border-gray-200/60 rounded-3xl shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto max-h-[320px] p-4 flex flex-col gap-4" ref={chatRef}>
                {messages.map(msg => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {!isLoading && messages.length <= 1 && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s.text)}
                      className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-100 hover:border-gray-200 transition-all"
                    >
                      {s.icon}
                      {s.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your results..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-gray-900 placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Detailed Biomarker Explanation ─── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {selectedBio && (
            <div className="bg-white border border-brand-100/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-3 pointer-events-none">
                 <Sparkles className="w-32 h-32 text-brand-600" />
               </div>

               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    selectedBio.severity === 'high' ? "bg-rose-50 text-rose-600" :
                    selectedBio.severity === 'medium' ? "bg-amber-50 text-amber-600" :
                    "bg-orange-50 text-orange-600"
                  )}>
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedBio.shortName} Insight</h2>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border",
                        selectedBio.severity === 'high' ? "bg-rose-50 text-rose-700 border-rose-100" :
                        selectedBio.severity === 'medium' ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-orange-50 text-orange-700 border-orange-100"
                      )}>
                        {selectedBio.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{selectedBio.name}</p>
                  </div>
               </div>

               <div className="space-y-6 relative z-10">

                 {/* What changed */}
                 <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <TrendingUp className="w-3.5 h-3.5" /> Current Value
                   </h4>
                   <div className="flex items-baseline gap-3">
                     <span className="text-3xl font-bold text-gray-900">{selectedBio.value}</span>
                     <span className="text-sm font-medium text-gray-500">{selectedBio.unit}</span>
                     <span className="text-gray-300 mx-2">|</span>
                     <div className="text-sm text-gray-600">
                       Reference: <span className="font-medium text-gray-900">{selectedBio.referenceRange} {selectedBio.unit}</span>
                     </div>
                   </div>
                   <p className="text-xs text-gray-400 mt-2">
                     {selectedBio.organSystem.charAt(0).toUpperCase() + selectedBio.organSystem.slice(1)} panel · Severity: {selectedBio.severity}
                   </p>
                 </div>

                 {/* Plain language explanation */}
                 <div>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Info className="w-3.5 h-3.5" /> What it means
                   </h4>
                   <p className="text-sm text-gray-700 leading-relaxed bg-brand-50/50 p-4 rounded-2xl border border-brand-100/50">
                     "Your {selectedBio.shortName} is {selectedBio.status === 'high' ? 'above' : selectedBio.status === 'low' ? 'below' : 'near'} the reference range. {selectedBio.plainExplanation} This result alone is not a diagnosis."
                   </p>
                 </div>

                 {/* Possible reasons */}
                 <div>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Coffee className="w-3.5 h-3.5" /> Possible non-diagnostic factors
                   </h4>
                   <p className="text-sm text-gray-600 leading-relaxed pl-1">
                     {selectedBio.possibleReasons}
                   </p>
                 </div>

                 {/* Diet & Lifestyle */}
                 <div>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Leaf className="w-3.5 h-3.5" /> Diet & Lifestyle
                   </h4>
                   <p className="text-sm text-gray-600 leading-relaxed pl-1">
                     {selectedBio.dietTips}
                   </p>
                 </div>

                 {/* When to ask a clinician */}
                 <div className="bg-rose-50/50 border border-rose-100/50 p-4 rounded-2xl">
                   <h4 className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                     <Stethoscope className="w-3.5 h-3.5" /> When to ask a clinician
                   </h4>
                   <p className="text-sm text-rose-800/80 leading-relaxed">
                     If it persists or you have symptoms (pain, fatigue, or visible changes), please consult a clinician. We do not provide diagnoses.
                   </p>
                 </div>

               </div>
            </div>
          )}

          {/* General Suggestions & Next Steps */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Diet Suggestions */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" /> General Diet Suggestions
              </h3>
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                {[
                  "Hydration (2L+/day)",
                  "Reduce alcohol",
                  "Balanced protein",
                  "More fiber",
                  "Omega-3 fatty acids",
                  "Limit processed foods",
                  "Avoid extreme dieting",
                  "Regular meal timing",
                ].map(tag => (
                  <span key={tag} className="bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg border border-teal-100 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" /> Recommended Next Steps
              </h3>
              <ul className="space-y-3">
                {[
                  "Recheck abnormal markers in 1–3 months",
                  "Bring this report to your next clinician visit",
                  "Track related markers over time in Timeline",
                  "Discuss persistent elevations with your doctor",
                  "Consider lifestyle changes for improving markers",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}