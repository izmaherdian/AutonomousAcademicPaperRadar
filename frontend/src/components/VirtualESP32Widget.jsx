import React, { useState } from 'react';
import { Cpu, RefreshCw, Star, X, Radio, Terminal } from 'lucide-react';
import { triggerArxivFetch, toggleStarPaper } from '../services/api';

export default function VirtualESP32Widget({
  onClose,
  latestPaper,
  allPapers = [],
  onRefreshPapers
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [statusMsg, setStatusMsg] = useState('ESP32 READY');

  const currentPaper = latestPaper || (allPapers.length > 0 ? allPapers[0] : null);

  const handleButton1Fetch = async () => {
    setIsFetching(true);
    setStatusMsg('FETCH_NOW SENT VIA MQTT...');
    try {
      await triggerArxivFetch();
      setTimeout(() => {
        setStatusMsg('SCRAPING & GEMINI AI DONE');
        setIsFetching(false);
        if (onRefreshPapers) onRefreshPapers();
      }, 3000);
    } catch (err) {
      setStatusMsg('ERROR SENDING FETCH');
      setIsFetching(false);
    }
  };

  const handleButton2Star = async () => {
    if (!currentPaper) {
      setStatusMsg('NO PAPER TO STAR');
      return;
    }
    setStatusMsg(`STARRING [${currentPaper.id}]...`);
    try {
      await toggleStarPaper(currentPaper.id, true);
      setStatusMsg(`PAPER STARRED! ★`);
      if (onRefreshPapers) onRefreshPapers();
    } catch (err) {
      setStatusMsg('STAR FAILED');
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl mb-8 border border-indigo-500/30 shadow-2xl relative animate-fade-in bg-[#0b0e17]/90">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
              <span>Virtual ESP32 Desk Assistant</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Hardware OLED SSD1306 & MQTT PubSub Interactive Simulation
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        
        {/* Retro Green OLED 128x64 Screen Display */}
        <div className="md:col-span-2 bg-[#040d06] border-2 border-emerald-900/60 rounded-xl p-4 font-mono shadow-inner min-h-[120px] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

          {/* OLED Top Bar */}
          <div className="flex items-center justify-between border-b border-emerald-900/80 pb-1.5 text-[11px] text-emerald-400">
            <div className="flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider">MQTT: 20.200.213.60:1883</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
              {statusMsg}
            </span>
          </div>

          {/* OLED Main Display Content */}
          <div className="py-2">
            {currentPaper ? (
              <div>
                <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-1">
                  <span className="truncate max-w-[240px]">PAPER ALERT [{currentPaper.id}]</span>
                  <span className="bg-emerald-900/80 px-1.5 py-0.5 rounded text-[10px]">
                    SCORE: {currentPaper.relevance_score}/100
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-tight line-clamp-2 font-mono">
                  {currentPaper.title}
                </p>
              </div>
            ) : (
              <p className="text-xs text-emerald-500/80 italic">
                Waiting for arXiv High-Relevance Paper Alerts (Score &gt;= 80)...
              </p>
            )}
          </div>

          {/* OLED Bottom Bar */}
          <div className="flex items-center justify-between text-[10px] text-emerald-600 border-t border-emerald-900/80 pt-1">
            <span>[F] BTN1: FETCH NOW</span>
            <span>[S] BTN2: STAR PAPER</span>
          </div>
        </div>

        {/* ESP32 Physical Control Push Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleButton1Fetch}
            disabled={isFetching}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>BUTTON 1 (FETCH NOW)</span>
          </button>

          <button
            onClick={handleButton2Star}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
          >
            <Star className="w-4 h-4 fill-white" />
            <span>BUTTON 2 (STAR PAPER)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
