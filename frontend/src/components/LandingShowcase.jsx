import React from 'react';
import { ArrowUpRight, Radar, Cpu, Brain, Sparkles, CheckCircle2, ChevronRight, Play, Compass, ArrowRight } from 'lucide-react';

export default function LandingShowcase({ onLaunchApp }) {
  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">

      {/* ─── 1. Minimalist Navigation ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-900/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">

          {/* Left: Typography Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white">
              <Radar className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="font-serif-header text-2xl font-bold tracking-tight text-slate-950">
              ACADEMIC RADAR <span className="font-sans font-light text-xs tracking-widest text-slate-500 uppercase">/ IZMAHERDIAN</span>
            </span>
          </div>

          {/* Middle: Clean Links */}
          <nav className="hidden md:flex items-center space-x-9 text-xs font-semibold tracking-wider text-slate-600 uppercase font-mono">
            <a href="#hero" className="hover:text-slate-950 transition-colors">Overview</a>
            <a href="#templates" className="hover:text-slate-950 transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-slate-950 transition-colors">Stack</a>
            <a href="#paper" className="hover:text-slate-950 transition-colors">S2 Research</a>
          </nav>

          {/* Right: Solid Black Pill CTA Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onLaunchApp}
              className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </header>


      {/* ─── 2. Full-Bleed Aesthetic Hero Section ───────────────────────── */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-36 border-b border-slate-900/10">
        
        {/* Background Image Container with Soft Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/squarespace_hero.jpg"
            alt="Aesthetic Background"
            className="w-full h-full object-cover opacity-35 filter brightness-105 contrast-95 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fcfbf9]/40 via-[#fcfbf9]/80 to-[#fcfbf9]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Top Tagline */}
          <div className="mb-6 flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-mono tracking-widest uppercase font-semibold">
              ACADEMIC RADAR 3.6
            </span>
            <span className="text-xs font-mono text-slate-600 tracking-wide">
              Izmaherdian S2 Research &bull; Swarm UAV Formation Control
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            
            {/* Left: Massive Serif Headline */}
            <div className="lg:col-span-8 space-y-8">
              <h1 className="font-serif-header text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-slate-950 leading-[0.98]">
                A research radar that makes paper discovery <span className="italic font-light">effortless.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-700 font-light leading-relaxed max-w-2xl">
                An autonomous literature monitoring system. Continuously scan arXiv, score papers 1–100 with Gemini AI, and sync directly with physical ESP32 desk hardware.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="flex items-center space-x-3 px-8 py-4 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:scale-[1.02]"
                >
                  <span>Launch Live Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="https://rdcu.be/fyDRz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 border border-slate-950/20 font-bold text-xs tracking-wider uppercase transition-all"
                >
                  <span>Read Springer Paper</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Right: Floating Aesthetic Hero Card */}
            <div className="lg:col-span-4">
              <div className="card-subtle rounded-2xl overflow-hidden p-3 bg-white/90 backdrop-blur-md shadow-lg border border-slate-950/10">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 group">
                  <img
                    src="/images/squarespace_hero.jpg"
                    alt="Hero Visual"
                    className="w-full h-full object-cover img-zoom opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white text-xs font-mono">
                      <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-bold">LIVE MONITOR</span>
                      <span className="text-emerald-400 font-bold">● MQTT 1883</span>
                    </div>
                    <div className="text-white space-y-1">
                      <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Latest High Relevance Alert</div>
                      <h4 className="font-serif-header text-lg font-bold leading-tight">
                        Decentralized Swarm UAV Formation Control
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─── 3. Interactive Ticker Bar ──────────────────────────────────── */}
      <section className="py-6 bg-slate-950 text-white font-mono text-xs tracking-widest uppercase overflow-hidden border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between space-x-8 text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold">AUTONOMOUS MONITORING</span>
          </div>
          <span className="hidden md:inline">&bull;</span>
          <span className="hidden md:inline">GEMINI AI SCORING 1–100</span>
          <span className="hidden md:inline">&bull;</span>
          <span className="hidden md:inline">ESP32 MQTT OLED HARDWARE</span>
          <span className="hidden md:inline">&bull;</span>
          <span className="hidden md:inline">ARXIV ATOM FEED</span>
        </div>
      </section>


      {/* ─── 4. Main Feature Grid (3 Columns with Aesthetic Photo Covers) ── */}
      <section id="templates" className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
        
        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 pb-8 border-b border-slate-950/10 gap-6">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              FEATURED CAPABILITIES
            </span>
            <h2 className="font-serif-header text-5xl sm:text-6xl font-normal tracking-tight text-slate-950">
              Everything you need to master your field.
            </h2>
          </div>
          <p className="text-base text-slate-600 font-light max-w-md leading-relaxed">
            Crafted for academic researchers who demand high-precision literature analysis with physical desk presence.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">

          {/* Card 1: UAV Swarm Research */}
          <div className="group card-subtle rounded-3xl overflow-hidden bg-white border border-slate-950/10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Photo Cover */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src="/images/uav_swarm.jpg"
                  alt="Swarm UAV Research"
                  className="w-full h-full object-cover img-zoom"
                />
                <div className="absolute top-4 left-4 bg-slate-950/90 text-white px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold">
                  01 / RESEARCH FOCUS
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-0 space-y-3">
                <h3 className="font-serif-header text-3xl font-normal text-slate-950">
                  Swarm UAV Formation
                </h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">
                  Targeted scraping for quadcopter formation control, artificial potential fields (APF), and event-based reconfiguration.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-950/5 flex items-center justify-between text-xs font-mono font-bold text-slate-950 uppercase">
              <span>EXPLORE SCRAPER</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Gemini AI Scoring */}
          <div className="group card-subtle rounded-3xl overflow-hidden bg-white border border-slate-950/10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Photo Cover */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 p-6 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between z-10">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold">
                    02 / INTELLIGENCE
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="z-10 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">GEMINI 3.6 FLASH</div>
                  <div className="font-serif-header text-2xl font-bold">Indonesian Summaries with **Bold** Key Terms</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/60 to-slate-950 opacity-90"></div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-0 space-y-3">
                <h3 className="font-serif-header text-3xl font-normal text-slate-950">
                  Granular AI Scoring
                </h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">
                  Evaluates every paper on a 1–100 relevance scale, generating structured summaries with highlighted technical keywords.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-950/5 flex items-center justify-between text-xs font-mono font-bold text-slate-950 uppercase">
              <span>VIEW SCORING RUBRIC</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Physical ESP32 Hardware */}
          <div className="group card-subtle rounded-3xl overflow-hidden bg-white border border-slate-950/10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Photo Cover */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src="/images/esp32_hardware.jpg"
                  alt="ESP32 Desk Hardware"
                  className="w-full h-full object-cover img-zoom"
                />
                <div className="absolute top-4 left-4 bg-slate-950/90 text-white px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold">
                  03 / DESK HARDWARE
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-0 space-y-3">
                <h3 className="font-serif-header text-3xl font-normal text-slate-950">
                  Physical ESP32 Assistant
                </h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">
                  Real-time MQTT desk widget: Press **[F]** to trigger arXiv paper fetch, **[S]** to star papers directly from your desk.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-950/5 flex items-center justify-between text-xs font-mono font-bold text-slate-950 uppercase">
              <span>SIMULATE HARDWARE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>


      {/* ─── 5. Editorial Manifesto Section (Polished Bottom) ───────────── */}
      <section className="py-28 bg-white border-y border-slate-950/10">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase font-bold">
            THE RESEARCH MANIFESTO
          </span>
          <blockquote className="font-serif-header text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] text-slate-950 italic">
            "A dedicated academic radar transforms how literature is discovered and synthesized."
          </blockquote>
          <div className="space-y-1">
            <p className="text-sm text-slate-900 font-serif-header font-bold tracking-wide text-lg">
              IZMAHERDIAN
            </p>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
              Master of Instrumentation & Control &bull; ITB 2026
            </p>
          </div>
        </div>
      </section>


      {/* ─── 6. Call to Action Banner (Polished Bottom) ─────────────────── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-12 sm:p-20 text-center space-y-8 border border-slate-900 shadow-2xl">
          
          {/* Background image overlay */}
          <img
            src="/images/squarespace_hero.jpg"
            alt="CTA background"
            className="absolute inset-0 w-full h-full object-cover opacity-15 filter brightness-125"
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="font-serif-header text-4xl sm:text-6xl font-normal leading-tight tracking-tight">
              Ready to explore your research radar?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
              Launch the live dashboard to view real-time arXiv literature feeds, Gemini relevance scoring, and ESP32 desk assistant triggers.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={onLaunchApp}
                className="flex items-center space-x-3 px-9 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-[1.02]"
              >
                <span>Launch Radar Dashboard</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ─── 7. Clean Minimalist Footer (Polished Bottom) ───────────────── */}
      <footer className="w-full border-t border-slate-950/10 py-12 bg-white text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <span className="font-serif-header text-xl font-bold text-slate-950">ACADEMIC RADAR</span>
            <span>&copy; 2026 Izmaherdian &bull; ITB S2 Thesis</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-700 font-bold">
            <a href="https://rdcu.be/fyDRz" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 transition-colors">Springer Paper</a>
            <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 transition-colors">arXiv API</a>
            <a href="https://github.com/izmaherdian/AutonomousAcademicPaperRadar" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 transition-colors">GitHub Repository</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
