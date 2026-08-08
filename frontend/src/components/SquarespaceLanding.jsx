import React from 'react';
import { ArrowUpRight, Radar, Cpu, Brain, Zap, Shield, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SquarespaceLanding({ onLaunchApp }) {
  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">

      {/* ─── 1. Minimalist Transparent Navbar ───────────────────────────── */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-900/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">

          {/* Left: Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <Radar className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="font-serif-header text-xl font-bold tracking-tight text-slate-900">
              RADAR<span className="text-slate-400 font-sans font-light">.ai</span>
            </span>
          </div>

          {/* Middle: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#hero" className="hover:text-slate-900 transition-colors">Overview</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
            <a href="#paper" className="hover:text-slate-900 transition-colors">S2 Research</a>
          </nav>

          {/* Right: Solid Black Rounded CTA Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLaunchApp}
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Radar
            </button>
          </div>
        </div>
      </header>


      {/* ─── 2. Hero Section (Left-Aligned, Generous Whitespace) ─────────── */}
      <section id="hero" className="pt-20 pb-24 md:pt-28 md:pb-36 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Left-Aligned Editorial Headline & CTA */}
          <div className="lg:col-span-7 space-y-8">

            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/10 text-xs font-semibold tracking-wide text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>S2 Thesis Research · Swarm UAV Formation Control</span>
            </div>

            {/* Main Serif Headline */}
            <h1 className="font-serif-header text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-950 leading-[1.08]">
              Autonomous Intelligence for Academic Research.
            </h1>

            {/* Sleek Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-light leading-relaxed max-w-2xl">
              An agentic radar that continuously scans arXiv, analyzes UAV swarm & artificial potential field literature with Gemini AI, scores relevance 1–100, and syncs directly with physical ESP32 hardware.
            </p>

            {/* CTA Group: Ultra-minimal Primary Button */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchApp}
                className="flex items-center space-x-3 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Live Radar</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <a
                href="https://rdcu.be/fyDRz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-7 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-900/15 font-semibold text-sm transition-all"
              >
                <span>Read S2 Paper</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Sub-text stats */}
            <div className="pt-8 border-t border-slate-900/10 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="font-serif-header text-2xl font-bold text-slate-900">100%</div>
                <div className="text-xs text-slate-500 mt-0.5">Automated Scan</div>
              </div>
              <div>
                <div className="font-serif-header text-2xl font-bold text-slate-900">1–100</div>
                <div className="text-xs text-slate-500 mt-0.5">Granular Score</div>
              </div>
              <div>
                <div className="font-serif-header text-2xl font-bold text-slate-900">&lt;2s</div>
                <div className="text-xs text-slate-500 mt-0.5">ESP32 Sync</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden card-subtle p-2 bg-white shadow-2xs group">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/5] flex flex-col justify-between p-8 text-white">

                {/* Background Art Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>GEMINI FLASH 3.6</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">● REALTIME</span>
                </div>

                {/* Center Visual Mockup */}
                <div className="relative z-10 my-auto space-y-4">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">High Relevance Alert</span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">SCORE 87/100</span>
                    </div>
                    <h4 className="font-serif-header text-lg font-bold leading-tight">
                      Decentralized Formation Control using Improved APF & Event-Based Reconfiguration
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      Mengusulkan kontrol formasi terdesentralisasi untuk swarm quadcopter dengan algoritma APF yang ditingkatkan...
                    </p>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>MQTT BROKER: 1883</span>
                  <span>ESP32 DESK ASSISTANT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── 3. Editorial Manifesto Quote ──────────────────────────────── */}
      <section className="py-20 border-y border-slate-900/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            RESEARCH MANIFESTO
          </p>
          <blockquote className="font-serif-header text-2xl md:text-4xl font-normal leading-snug text-slate-900 italic">
            "Designed for researchers who need high-precision academic monitoring without the noise of generic search engines."
          </blockquote>
          <p className="text-xs text-slate-500 font-mono tracking-wide">
            ISMAHERDIAN &bull; MASTER OF INSTRUMENTATION & CONTROL &bull; ITB 2026
          </p>
        </div>
      </section>


      {/* ─── 4. Feature Grid (3-Column Layout, 1px Border Cards) ────────── */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-slate-900/10 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">CAPABILITIES</span>
            <h2 className="font-serif-header text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              Built for Precision Research.
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed font-light">
            A harmonized stack integrating Go background microservices, Python Gemini AI, and hardware MQTT communication.
          </p>
        </div>

        {/* 3-Column Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1: Automated Scraping */}
          <div className="group card-subtle rounded-2xl overflow-hidden p-6 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              {/* Category Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  01 / SCRAPING
                </span>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Radar className="w-4 h-4" />
                </div>
              </div>

              {/* Card Image Wrapper */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-900/5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-slate-200 flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-indigo-600 font-bold">arXiv Atom API</div>
                    <div className="font-serif-header text-xl font-bold text-slate-900">Targeted Title & Abstract Query</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-serif-header text-2xl font-bold text-slate-950">
                  Automated arXiv Scraper
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Continuous Go-cron background scraper querying arXiv with strict title & abstract phrase operators, avoiding irrelevant papers completely.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-900/5 flex items-center text-xs font-semibold text-slate-900">
              <span>Explore Scraper Logic</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: AI Analysis & Scoring */}
          <div className="group card-subtle rounded-2xl overflow-hidden p-6 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              {/* Category Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  02 / INTELLIGENCE
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Brain className="w-4 h-4" />
                </div>
              </div>

              {/* Card Image Wrapper */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-900/5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-emerald-700 font-bold">Gemini 3.6 Flash</div>
                    <div className="font-serif-header text-xl font-bold text-slate-900">Granular 1–100 Scoring Rubric</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-serif-header text-2xl font-bold text-slate-950">
                  Deep AI Scoring & Summary
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Evaluates each paper against S2 thesis topics (swarm UAVs, APF, decentralized control) and generates structured Indonesian summaries with **bold** key terms.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-900/5 flex items-center text-xs font-semibold text-slate-900">
              <span>View Scoring Rubric</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: ESP32 Hardware Assistant */}
          <div className="group card-subtle rounded-2xl overflow-hidden p-6 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              {/* Category Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  03 / HARDWARE
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>

              {/* Card Image Wrapper */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-900/5">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-amber-700 font-bold">OLED & MQTT Broker</div>
                    <div className="font-serif-header text-xl font-bold text-slate-900">ESP32 Desk Hardware Sync</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-serif-header text-2xl font-bold text-slate-950">
                  Physical ESP32 Assistant
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Real-time MQTT integration with physical OLED display & physical buttons: Press **[F]** to trigger arXiv scrape, **[S]** to star papers instantly.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-900/5 flex items-center text-xs font-semibold text-slate-900">
              <span>Simulate ESP32 Assistant</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>


      {/* ─── 5. Architecture Highlights Section ─────────────────────────── */}
      <section id="architecture" className="py-24 bg-white border-t border-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">SYSTEM ARCHITECTURE</span>
              <h2 className="font-serif-header text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
                Microservice Stack in Docker.
              </h2>
              <p className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                Architected with Go for lightning-fast REST & WebSocket handling, SQLite WAL for zero-latency persistence, and Python FastAPI for Gemini ML execution.
              </p>
              
              <ul className="space-y-3 pt-2">
                {[
                  'Go 1.21 Backend REST API + WebSocket Hub',
                  'Python FastAPI + Google Gemini 3.6 Flash ML Engine',
                  'Eclipse Mosquitto MQTT Broker on Port 1883',
                  'NGINX Reverse Proxy with SSL / Cloudflare Tunnel Support',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="card-subtle rounded-2xl p-6 sm:p-8 bg-[#0b0f19] text-white font-mono text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400">docker-compose.yml</span>
                  <span className="text-emerald-400">● 6 CONTAINERS HEALTHY</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`services:
  nginx:       image: nginx:alpine (Port 80)
  backend:     image: golang:1.21 (Port 8080)
  ml-service:  image: python:3.10 (Port 5000)
  broker:      image: eclipse-mosquitto:2.0 (Port 1883)
  tunnel:      image: cloudflare/cloudflared:latest`}
                </pre>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─── 6. Call to Action Banner ───────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="card-subtle rounded-3xl p-10 sm:p-16 bg-slate-900 text-white text-center space-y-8 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="font-serif-header text-4xl sm:text-5xl font-bold tracking-tight">
              Ready to Monitor Research?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
              Launch the live dashboard to view real-time arXiv literature feeds, Gemini relevance scoring, and ESP32 desk assistant triggers.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={onLaunchApp}
                className="flex items-center space-x-3 px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all shadow-md hover:scale-[1.02]"
              >
                <span>Open Radar Dashboard</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ─── 7. Squarespace Minimalist Footer ───────────────────────────── */}
      <footer className="w-full border-t border-slate-900/10 py-12 bg-white text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-serif-header text-base font-bold text-slate-900">RADAR.ai</span>
            <span>&copy; 2026 Ismaherdian &bull; ITB S2 Thesis</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-600">
            <a href="https://rdcu.be/fyDRz" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">Springer Paper</a>
            <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">arXiv API</a>
            <a href="https://github.com/izmaherdian/AutonomousAcademicPaperRadar" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub Repository</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
