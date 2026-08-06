import React from 'react';
import { Radar, RefreshCw, Cpu, Tag, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Header({
  isConnected,
  isFetching,
  onTriggerFetch,
  onOpenKeywordsModal,
  onToggleESP32Widget,
  showESP32Widget
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#070a11]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0b0f19] rounded-[15px] flex items-center justify-center">
              <Radar className="w-6 h-6 text-cyan-400 animate-spin-slow" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-sans">
                Academic Paper <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Radar</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous arXiv Scraper & Gemini AI Summarization Assistant
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-3">
          
          {/* Live WS Connection Status Badge */}
          <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'Live Connected' : 'Reconnecting...'}</span>
          </div>

          {/* Manage Keywords Button */}
          <button
            onClick={onOpenKeywordsModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all shadow-sm"
            title="Configure arXiv search keywords"
          >
            <Tag className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Keywords</span>
          </button>

          {/* ESP32 Virtual Widget Toggle Button */}
          <button
            onClick={onToggleESP32Widget}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              showESP32Widget
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/60'
            }`}
            title="Toggle Virtual ESP32 Hardware Widget"
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">ESP32 Widget</span>
          </button>

          {/* Trigger Fetch Button */}
          <button
            onClick={onTriggerFetch}
            disabled={isFetching}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Fetching...' : 'Trigger Fetch'}</span>
          </button>

        </div>
      </div>
    </header>
  );
}
