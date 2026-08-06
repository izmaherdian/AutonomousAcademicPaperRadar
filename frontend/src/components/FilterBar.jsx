import React from 'react';
import { Search, Star, Sliders, Tag } from 'lucide-react';

export default function FilterBar({
  search,
  setSearch,
  starredOnly,
  setStarredOnly,
  minScore,
  setMinScore,
  keywords,
  onOpenKeywordsModal
}) {
  return (
    <div className="glass-panel p-4 lg:p-5 rounded-2xl mb-8 border border-slate-800/80">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers by title, abstract, or author..."
            className="w-full bg-[#0b0f19]/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Min Score Slider */}
          <div className="flex items-center space-x-2.5 bg-[#0b0f19]/80 border border-slate-700/60 px-3.5 py-2 rounded-xl">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
              Min Score: <strong className="text-cyan-400 font-mono">{minScore}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Starred Only Toggle */}
          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              starredOnly
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-[#0b0f19]/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-amber-400' : ''}`} />
            <span>Starred Only</span>
          </button>

          {/* Active Keywords Pill */}
          <button
            onClick={onOpenKeywordsModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-medium transition-all max-w-[200px] truncate"
            title={`Active arXiv keywords: ${keywords}`}
          >
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{keywords || 'Set Keywords'}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
