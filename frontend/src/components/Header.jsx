import React from 'react';
import { Radar, RefreshCw, Cpu, Wifi, WifiOff } from 'lucide-react';

export default function Header({ isConnected, isFetching, onTriggerFetch, onToggleESP32Widget, showESP32Widget }) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Radar className={`w-6 h-6 ${isFetching ? 'animate-spin text-cyan-300' : ''}`} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Academic Paper Radar
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              v1.0.0
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Autonomous arXiv Scraper & AI Summarizer (Gemini API)
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* WebSocket Connection Status */}
        <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
          isConnected
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isConnected ? 'Live Connected' : 'Disconnected'}</span>
        </div>

        {/* ESP32 Virtual Widget Toggle */}
        <button
          onClick={onToggleESP32Widget}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            showESP32Widget
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">ESP32 Widget</span>
        </button>

        {/* Manual Fetch Trigger Button */}
        <button
          onClick={onTriggerFetch}
          disabled={isFetching}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg font-medium text-xs transition-all ${
            isFetching
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? 'Fetching arXiv...' : 'Trigger Fetch'}</span>
        </button>
      </div>
    </header>
  );
}
