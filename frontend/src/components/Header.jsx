import React from 'react';
import { Radar, RefreshCw, Cpu, Layout } from 'lucide-react';

export default function Header({
  isConnected,
  isFetching,
  onTriggerFetch,
  onToggleESP32Widget,
  showESP32Widget,
  activeView,
  onSwitchView
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo & Title — Click to switch view */}
        <div
          onClick={() => onSwitchView(activeView === 'landing' ? 'dashboard' : 'landing')}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Switch between Dashboard and Landing Showcase"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-600 shadow-2xs group-hover:scale-105 transition-transform">
            <Radar className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-800 flex items-center space-x-2">
              <span className="font-serif-header text-lg">Academic Radar</span>
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent font-sans text-xs font-bold uppercase tracking-wider">
                {activeView === 'landing' ? 'Showcase' : 'Dashboard'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block leading-none mt-0.5">
              Autonomous arXiv Monitor · Swarm UAV Research
            </p>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center space-x-2.5">

          {/* Switch View Button */}
          <button
            onClick={() => onSwitchView(activeView === 'landing' ? 'dashboard' : 'landing')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
            title="Toggle Showcase Landing Page"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">{activeView === 'landing' ? 'Go to Dashboard' : 'View Landing Page'}</span>
          </button>

          {/* Live WS Status */}
          <div className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isConnected ? 'Live' : 'Reconnecting...'}</span>
          </div>

          {/* ESP32 Toggle */}
          <button
            onClick={onToggleESP32Widget}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showESP32Widget
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle Virtual ESP32 Hardware Widget"
          >
            <Cpu className={`w-3.5 h-3.5 ${showESP32Widget ? 'text-white' : 'text-indigo-500'}`} />
            <span className="hidden sm:inline">ESP32</span>
          </button>

          {/* Trigger Fetch Button */}
          <button
            onClick={onTriggerFetch}
            disabled={isFetching}
            id="trigger-fetch-btn"
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-2xs active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Fetching...' : 'Fetch Papers'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
