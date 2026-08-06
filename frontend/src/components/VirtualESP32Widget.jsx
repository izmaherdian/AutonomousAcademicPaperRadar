import React, { useState } from 'react';
import { Cpu, RefreshCw, Star, X, Radio } from 'lucide-react';

export default function VirtualESP32Widget({
  onClose,
  latestHighRelevancePaper,
  onTriggerFetch,
  onToggleStar
}) {
  const [ledActive, setLedActive] = useState(false);
  const [buttonFeedback, setButtonFeedback] = useState('');

  const handleFetchClick = () => {
    setLedActive(true);
    setButtonFeedback('BUTTON 1: FETCH_NOW Triggered!');
    onTriggerFetch();
    setTimeout(() => {
      setLedActive(false);
      setButtonFeedback('');
    }, 1500);
  };

  const handleStarClick = () => {
    if (latestHighRelevancePaper?.id) {
      setLedActive(true);
      setButtonFeedback(`BUTTON 2: STAR Paper ${latestHighRelevancePaper.id}`);
      onToggleStar(latestHighRelevancePaper.id, true);
      setTimeout(() => {
        setLedActive(false);
        setButtonFeedback('');
      }, 1500);
    } else {
      setButtonFeedback('No current paper to star');
      setTimeout(() => setButtonFeedback(''), 1500);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-slate-950/90 shadow-2xl relative mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              ESP32 Desk Assistant Widget
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                MQTT :1883
              </span>
            </h3>
            <p className="text-xs text-slate-400">Virtual Hardware Simulation (SSD1306 OLED + Push Buttons)</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5 items-center">
        {/* Physical Enclosure Graphic */}
        <div className="md:col-span-2 bg-slate-900 border-2 border-slate-700 p-4 rounded-xl shadow-inner relative">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              ESP32 Node-MCU (SSD1306 OLED)
            </span>
            {/* LED Status Indicator */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-400 font-mono">LED:</span>
              <span className={`h-3 w-3 rounded-full transition-all duration-300 ${
                ledActive
                  ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]'
                  : 'bg-slate-700'
              }`}></span>
            </div>
          </div>

          {/* SSD1306 Monochrome OLED Screen Frame (128x64 resolution aesthetic) */}
          <div className="bg-black border-4 border-slate-800 p-3.5 rounded-lg font-mono text-xs text-cyan-300 shadow-inner h-32 flex flex-col justify-between overflow-hidden relative">
            {/* OLED Scanline Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

            <div className="flex justify-between items-center border-b border-cyan-500/40 pb-1 text-[11px] text-cyan-400">
              <span className="font-bold">RADAR ALERT</span>
              <span>{latestHighRelevancePaper ? `SCORE: ${latestHighRelevancePaper.score}` : 'IDLE'}</span>
            </div>

            <div className="my-auto py-1">
              {latestHighRelevancePaper ? (
                <div>
                  <p className="font-semibold text-cyan-200 line-clamp-2 leading-tight">
                    {latestHighRelevancePaper.title}
                  </p>
                  <p className="text-[10px] text-cyan-400/80 mt-1">
                    ID: {latestHighRelevancePaper.id}
                  </p>
                </div>
              ) : (
                <div className="text-center py-2 text-cyan-400/60">
                  <p className="text-[11px]">=== RADAR WAITING ===</p>
                  <p className="text-[10px] mt-1">Press Button 1 to Fetch</p>
                </div>
              )}
            </div>

            <div className="text-[9px] text-cyan-500/70 border-t border-cyan-500/30 pt-1 flex justify-between">
              <span>WIFI: CONNECTED</span>
              <span>MQTT: ONLINE</span>
            </div>
          </div>
        </div>

        {/* Tactile Hardware Push Buttons */}
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Hardware Triggers:
          </p>

          <button
            onClick={handleFetchClick}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>BTN 1: FETCH NOW</span>
          </button>

          <button
            onClick={handleStarClick}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Star className="w-4 h-4 fill-white/20" />
            <span>BTN 2: STAR CURRENT</span>
          </button>

          {buttonFeedback && (
            <p className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 p-2 rounded border border-cyan-500/30 text-center animate-fade-in">
              {buttonFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
