import { Link } from "react-router-dom";
import { type ReactNode } from "react";
import {
  Sparkles, ArrowRight, ScanLine, Brain, Activity, ShieldCheck,
  UploadCloud, Lock, ChevronRight, Star, CheckCircle2, Heart,
  TrendingUp, BarChart3, Droplet, Zap, Shield, FileText
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Star Rating ───────────────────────────────────────────────────────────────
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

// ─── Feature Item ─────────────────────────────────────────────────────────────
function FeatureItem({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="w-11 h-11 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── How It Works Step ────────────────────────────────────────────────────────
function HowStep({ number, title, desc, icon }: { number: string; title: string; desc: string; icon: ReactNode }) {
  return (
    <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="absolute -top-3 left-6 text-5xl font-black text-brand-100 select-none leading-none">{number}</div>
      <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center relative z-10 mt-2">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, avatar }: { quote: string; name: string; role: string; avatar: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex gap-1">
        <Stars count={5} />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed flex-1 italic">"{quote}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
        <div>
          <div className="text-sm font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-400">{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-white border border-gray-100 rounded-2xl">
      <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none select-none">
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-90" />
      </summary>
      <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
        {a}
      </div>
    </details>
  );
}

// ─── Biomarker Mini Card ─────────────────────────────────────────────────────
function BiomarkerMini({ name, value, status, color }: { name: string; value: string; status: string; color: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between px-3 py-2 rounded-xl border",
      color === 'high' ? "bg-rose-50 border-rose-100" :
      color === 'borderline' ? "bg-amber-50 border-amber-100" :
      "bg-teal-50 border-teal-100"
    )}>
      <span className="text-xs font-semibold text-gray-700">{name}</span>
      <span className={cn(
        "text-xs font-bold px-2 py-0.5 rounded-full",
        color === 'high' ? "text-rose-600 bg-rose-100" :
        color === 'borderline' ? "text-amber-600 bg-amber-100" :
        "text-teal-600 bg-teal-100"
      )}>
        {status}
      </span>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Background Decorations */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-brand-50/40 to-transparent pointer-events-none" />
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-brand-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-60 -left-20 w-[400px] h-[400px] bg-teal-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Navigation ─── */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-brand-600 hover:opacity-80 transition-opacity">
          <Sparkles className="w-6 h-6" />
          <span className="font-semibold text-xl tracking-tight text-gray-900">HealthLens AI</span>
        </Link>
        <div className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-500">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-gray-900 transition-colors">Testimonials</a>
          <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/dashboard" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            View Demo
          </Link>
          <Link to="/upload" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm">
            Upload Report
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Headline */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-xs font-semibold text-brand-700 mb-6">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Lab Report Analysis
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
              Understand your lab report in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-400">plain language.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              Upload a lab report image. HealthLens AI extracts biomarkers, highlights abnormal values, maps them to body systems, and explains them simply — no medical degree needed.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/upload" className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 group">
                <UploadCloud className="w-5 h-5" />
                Upload Lab Report
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 group">
                Explore Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-6 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7508d50?w=40&h=40&fit=crop',
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop',
                ].map((src, i) => (
                  <img key={i} src={src} alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div className="text-xs text-gray-500">
                <div className="font-semibold text-gray-900">2,400+ users</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Stars count={5} />
                  <span>trust HealthLens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Demo Preview */}
          <div className="relative w-full flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100/50 to-white/50 rounded-[3rem] blur-2xl transform rotate-3 scale-105" />
            <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl overflow-hidden">

              {/* Preview Header */}
              <div className="bg-gradient-to-r from-brand-50 to-teal-50 border-b border-brand-100/50 px-5 py-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs">84</div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 leading-tight">Health Score</div>
                    <div className="text-[10px] text-gray-500 leading-tight">Good condition</div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-1 rounded-full border border-teal-100">
                  <TrendingUp className="w-3 h-3" />
                  +3 vs Last Month
                </div>
              </div>

              {/* Abnormal Alert Card */}
              <div className="p-4 bg-orange-50/60 border-b border-orange-100/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      ALT
                      <span className="bg-orange-100 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">High</span>
                    </div>
                    <div className="text-[10px] text-gray-500">Alanine Aminotransferase</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">68</div>
                    <div className="text-[9px] text-gray-400">U/L · Ref: 7–56</div>
                  </div>
                </div>
                <div className="bg-white/70 p-2.5 rounded-xl border border-white">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-900 mb-1">
                    <Brain className="w-3 h-3 text-brand-500" />
                    AI Insight
                  </div>
                  <div className="text-[10px] text-gray-600 leading-tight">
                    Mild elevation may be from dietary factors or temporary stress. Recommend review in 3 months.
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 divide-x divide-gray-50">
                {[
                  { label: 'Abnormal', value: '4', color: 'bg-rose-50 text-rose-600' },
                  { label: 'Improved', value: '5', color: 'bg-teal-50 text-teal-600' },
                  { label: 'Normal', value: '5', color: 'bg-gray-50 text-gray-600' },
                ].map((stat) => (
                  <div key={stat.label} className={cn("flex flex-col items-center py-3", stat.color)}>
                    <div className="text-base font-bold leading-tight">{stat.value}</div>
                    <div className="text-[9px] font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Organ Tags */}
              <div className="px-4 py-3 flex flex-wrap gap-1.5 border-t border-gray-50">
                {['Liver ↑', 'Kidney ↑', 'Cardio ↓', 'Blood ✓'].map((tag, i) => (
                  <span key={i} className={cn(
                    "text-[9px] font-semibold px-2 py-1 rounded-full",
                    tag.includes('↑') ? "bg-rose-50 text-rose-600" :
                    tag.includes('↓') ? "bg-amber-50 text-amber-600" :
                    "bg-teal-50 text-teal-600"
                  )}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-xs font-semibold text-brand-700 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Built for real people
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Everything you need to understand your health.
            </h2>
            <p className="text-lg text-gray-500">
              We turn clinical tabular data into actionable health knowledge — explained clearly, no jargon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureItem
              icon={<ScanLine className="w-5 h-5 text-brand-500" />}
              title="Smart OCR Extraction"
              desc="Upload photos of your lab reports. We automatically extract biomarker names, values, and reference ranges using AI — no manual entry needed."
            />
            <FeatureItem
              icon={<Activity className="w-5 h-5 text-rose-500" />}
              title="Biomarker Trend Tracking"
              desc="Watch your health metrics evolve over time. Trend charts, comparisons with past reports, and visual indicators show you what's improving or worsening."
            />
            <FeatureItem
              icon={<Brain className="w-5 h-5 text-indigo-500" />}
              title="Plain-Language AI Explanations"
              desc="No more googling medical terms. Get simple, human-readable explanations for every marker — what it means, why it matters, and what you can do."
            />
            <FeatureItem
              icon={<Droplet className="w-5 h-5 text-red-400" />}
              title="Organ System Mapping"
              desc="Biomarkers mapped to body systems — liver, kidney, heart, blood — so you can see at a glance which areas need attention."
            />
            <FeatureItem
              icon={<BarChart3 className="w-5 h-5 text-teal-500" />}
              title="Health Score Dashboard"
              desc="A single, easy-to-understand health score based on all your biomarkers. Track your overall wellness journey at a glance."
            />
            <FeatureItem
              icon={<Shield className="w-5 h-5 text-gray-400" />}
              title="Privacy by Design"
              desc="Your health data is personal. We are designed with a local-first philosophy — your data stays with you unless you choose to share it."
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
              From confusing paper to clear dashboard in 3 steps.
            </h2>
            <p className="text-lg text-gray-500">
              No account needed. No medical expertise required. Just upload, review, and understand.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <HowStep
              number="1"
              title="Take a Photo"
              desc="Snap a clear photo of your latest lab report — the printed kind from your clinic. Upload it directly."
              icon={<UploadCloud className="w-7 h-7 text-brand-500" />}
            />
            <HowStep
              number="2"
              title="Review Extracted Data"
              desc="We extract all biomarker values and highlight which ones need attention. You can verify and edit if needed."
              icon={<ScanLine className="w-7 h-7 text-brand-500" />}
            />
            <HowStep
              number="3"
              title="Track & Understand"
              desc="Watch your health metrics evolve across reports. Read plain-language explanations and get personalized diet tips."
              icon={<Brain className="w-7 h-7 text-brand-500" />}
            />
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link to="/upload" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg shadow-brand-500/20">
              <UploadCloud className="w-5 h-5" />
              Try It Now — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Biomarker Deep Dive Preview ─── */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-xs font-semibold text-rose-700 mb-6">
                <Heart className="w-3.5 h-3.5" />
                Attention Needed
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
                Know exactly which markers need your attention.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8">
                HealthLens AI automatically categorizes each biomarker as normal, borderline, or abnormal — with clear severity indicators. Each abnormal marker comes with a plain-English explanation, possible causes, and diet/lifestyle tips tailored to you.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <BiomarkerMini name="Uric Acid" value="462 μmol/L" status="High · High Risk" color="high" />
                <BiomarkerMini name="ALT" value="68 U/L" status="High · Medium" color="high" />
                <BiomarkerMini name="LDL-C" value="3.58 mmol/L" status="Borderline" color="borderline" />
                <BiomarkerMini name="CRP" value="4.8 mg/L" status="High · Medium" color="high" />
              </div>
              <div className="mt-6">
                <Link to="/insights" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-2 transition-colors">
                  View detailed explanations <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Biomarker Detail Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 font-bold text-lg">UA</div>
                <div>
                  <div className="font-bold text-gray-900">Uric Acid</div>
                  <div className="text-xs text-gray-500">Kidney · 462 μmol/L</div>
                </div>
                <div className="ml-auto bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  High Risk
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-100/50">
                  <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">What it means</div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Uric acid is a waste product from breaking down purines. Elevated levels can cause gout or kidney stones. Your level of 462 μmol/L is above the healthy range (208–428).
                  </p>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">What you can do</div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Stay hydrated (2+ litres/day). Reduce red meat, shellfish, and alcohol. Consider tart cherry extract. Discuss persistent elevation with your doctor.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Reference Range</div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-900">208 – 428</div>
                    <div className="text-xs text-gray-500">μmol/L</div>
                    <div className="ml-auto">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-full">Above range</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Trusted by people managing their health.
            </h2>
            <p className="text-lg text-gray-500">
              Real stories from people who finally understood their lab results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="I had my annual blood test last month and the results came back with so many abbreviations I didn't understand. HealthLens explained every single one in plain English. I finally know what ALT means and why it matters."
              name="Sarah K."
              role="Marketing Manager, 34"
              avatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop"
            />
            <TestimonialCard
              quote="The timeline feature is brilliant. I can actually see whether my cholesterol is improving over time. My doctor was impressed that I came with actual context about my trends. Made our appointment so much more productive."
              name="Michael T."
              role="Software Engineer, 41"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7508d50?w=80&h=80&fit=crop"
            />
            <TestimonialCard
              quote="As someone with a family history of diabetes, tracking my glucose levels here has been a game-changer. I can see the trends before they become a problem. The diet tips are actually practical too."
              name="Emma L."
              role="Teacher, 29"
              avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* ─── Privacy Banner ─── */}
      <section id="privacy" className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-xs font-semibold tracking-wider uppercase text-gray-300 mb-6">
               <ShieldCheck className="w-4 h-4 text-brand-400" /> Privacy First
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Your health data is yours.</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              This application is built with a local-first philosophy. User-controlled records mean you own your history, always.
            </p>
            <ul className="space-y-3">
              {[
                "Demo uses mock data — no real medical information sent anywhere",
                "No permanent storage of documents on external servers",
                "Not a medical diagnosis tool — for educational reference only",
                "Full data deletion available through Settings at any time",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-brand-400" />
              <h3 className="text-xl font-bold text-white">Medical Disclaimer</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              HealthLens AI provides educational health explanations and triage suggestions only. It cannot and does not substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition. Never disregard professional medical advice or delay seeking it because of something you read here.
            </p>
            <Link to="/privacy" className="text-xs text-brand-400 font-semibold hover:text-brand-300 transition-colors flex items-center gap-2">
              Read full privacy policy <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            <FaqItem
              q="Is HealthLens AI a substitute for visiting my doctor?"
              a="No. HealthLens AI is an educational tool for understanding lab results. It provides plain-language explanations and general lifestyle suggestions. It does not provide medical diagnoses, treatment plans, or prescription advice. Always consult your healthcare provider for medical decisions."
            />
            <FaqItem
              q="Is my health data stored on your servers?"
              a="In the current prototype version, no data is stored on our servers. All processing uses mock data, and any uploads stay in your browser session. Future versions are being designed with local-first architecture to keep your data on your device wherever possible."
            />
            <FaqItem
              q="How does the OCR and biomarker extraction work?"
              a="HealthLens AI uses multimodal AI models to analyze images of lab reports, extracting biomarker names, values, units, and reference ranges. The extracted data is then mapped to body organ systems and explained in plain language. In this demo, the OCR process is simulated with mock data."
            />
            <FaqItem
              q="Which lab report formats are supported?"
              a="The system is designed to accept images (JPG, PNG) and PDFs of standard clinical lab reports. The more clearly the report is photographed — good lighting, flat paper, readable text — the better the extraction results will be."
            />
            <FaqItem
              q="Can I track my biomarkers over multiple reports?"
              a="Yes! The Timeline page allows you to track individual biomarkers across all your uploaded reports. This helps you and your doctor understand trends and the impact of lifestyle changes over time."
            />
            <FaqItem
              q="Is this service free?"
              a="This prototype is currently free to use. It may transition to a freemium model in the future with additional premium features such as advanced trend analysis, personalized health coaching, and integration with clinical systems."
            />
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-brand-50/60 to-teal-50/40 border border-brand-100 rounded-[2rem] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Brain className="w-40 h-40 text-brand-600" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
                Ready to understand your health?
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
                Upload your first lab report and get an AI-powered explanation in seconds. No account required, no data shared.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Link to="/upload" className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-10 py-4 rounded-full font-semibold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
                  <UploadCloud className="w-5 h-5" />
                  Upload Your Lab Report
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-10 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Browse Demo First
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-gray-900">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <span className="font-semibold tracking-tight">HealthLens AI</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Privacy
              </Link>
              <Link to="/settings" className="hover:text-gray-900 transition-colors">Settings</Link>
              <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
              For educational and triage reference only. Not a diagnosis or treatment tool. Do not disregard professional medical advice or delay seeking it because of something you have read on this system.
            </p>
            <div className="text-xs text-gray-400 mt-3">
              © {new Date().getFullYear()} HealthLens AI Prototype · All rights reserved
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}