import React, { useState } from 'react';
import { Cpu, RefreshCw, Star, X, Radio } from 'lucide-react';
import { triggerArxivFetch, toggleStarPaper } from '../services/api';

export default function VirtualESP32Widget({
  onClose,
  latestPaper,
  allPapers = [],
  onRefreshPapers
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [statusMsg, setStatusMsg] = useState('READY');

  const currentPaper = latestPaper || (allPapers.length > 0 ? allPapers[0] : null);

  // Button F — Fetch new papers from arXiv
  const handleButtonF = async () => {
    setIsFetching(true);
    setStatusMsg('F: FETCH TRIGGERED...');
    try {
      await triggerArxivFetch();
      setTimeout(() => {
        setStatusMsg('FETCH DONE');
        setIsFetching(false);
        if (onRefreshPapers) onRefreshPapers();
      }, 3000);
    } catch (err) {
      setStatusMsg('F: ERROR');
      setIsFetching(false);
    }
  };

  // Button S — Star the current displayed paper
  const handleButtonS = async () => {
    if (!currentPaper) {
      setStatusMsg('S: NO PAPER');
      return;
    }
    setStatusMsg(`S: STARRING...`);
    try {
      await toggleStarPaper(currentPaper.id, true);
      setStatusMsg('S: STARRED ★');
      if (onRefreshPapers) onRefreshPapers();
    } catch (err) {
      setStatusMsg('S: FAILED');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm relative animate-fade-in">

      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span>Virtual ESP32 Desk Assistant</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              OLED SSD1306 + MQTT Simulation · Swarm UAV Radar
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

        {/* Retro OLED Green Screen — 128x64 simulation */}
        <div className="md:col-span-2 oled-screen rounded-xl p-4 font-mono shadow-inner min-h-[130px] flex flex-col justify-between relative overflow-hidden">
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>

          {/* OLED Top Bar */}
          <div className="flex items-center justify-between border-b border-green-900/60 pb-1.5 text-[10px] text-green-400">
            <div className="flex items-center space-x-1.5">
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="font-bold tracking-wider">MQTT BROKER:1883</span>
            </div>
            <span className="text-[9px] font-bold bg-green-950/80 px-1.5 py-0.5 rounded border border-green-900 text-green-300">
              {statusMsg}
            </span>
          </div>

          {/* OLED Main — Paper info */}
          <div className="py-2 flex-1">
            {currentPaper ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-green-300 font-bold">
                  <span>PAPER ALERT</span>
                  <span className="bg-green-900/60 px-1.5 py-0.5 rounded text-[9px]">
                    SCORE: {currentPaper.relevance_score}/100
                  </span>
                </div>
                <div className="text-[10px] text-green-400/80 font-mono leading-tight">
                  ID: {currentPaper.id}
                </div>
                <p className="text-[10px] text-green-400/90 leading-tight line-clamp-2 font-mono mt-1">
                  TITLE: {currentPaper.title}
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-green-600/70 italic">
                Menunggu paper dengan Score &gt;= 70...
              </p>
            )}
          </div>

          {/* OLED Bottom Help Bar */}
          <div className="flex items-center justify-between text-[9px] text-green-700 border-t border-green-900/60 pt-1">
            <span>[F] FETCH NOW</span>
            <span>[S] STAR PAPER</span>
          </div>
        </div>

        {/* Physical Push Button Simulators */}
        <div className="flex flex-col space-y-3">

          {/* Button F */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              id="esp32-btn-f"
              onClick={handleButtonF}
              disabled={isFetching}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="font-mono tracking-widest">F</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Fetch Papers</span>
          </div>

          {/* Button S */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              id="esp32-btn-s"
              onClick={handleButtonS}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-white font-bold text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Star className="w-4 h-4 fill-white" />
              <span className="font-mono tracking-widest">S</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Star Paper</span>
          </div>

        </div>
      </div>
    </div>
  );
}
