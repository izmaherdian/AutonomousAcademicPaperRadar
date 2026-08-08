import React from 'react';
import { Search, Star, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({
  search,
  setSearch,
  starredOnly,
  setStarredOnly,
  minScore,
  setMinScore,
}) {
  return (
    <div className="glass-panel p-4 rounded-2xl mb-6 border border-slate-200/80">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="paper-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari paper berdasarkan judul, abstrak, atau penulis..."
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-9.5 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 transition-all font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Min Score Slider */}
          <div className="flex items-center space-x-2.5 bg-white border border-slate-200/90 px-3.5 py-2 rounded-xl">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="text-xs text-slate-600 whitespace-nowrap">
              Min Score:{' '}
              <strong className="text-indigo-600 font-mono font-bold">{minScore}</strong>
            </span>
            <input
              id="min-score-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Starred Only Toggle */}
          <button
            id="starred-only-btn"
            onClick={() => setStarredOnly(!starredOnly)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              starredOnly
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            <span>Starred Only</span>
          </button>
        </div>
      </div>
    </div>
  );
}
