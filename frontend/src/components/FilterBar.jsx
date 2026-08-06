import React from 'react';
import { Search, Star, SlidersHorizontal, Tag } from 'lucide-react';

export default function FilterBar({
  search,
  setSearch,
  starredOnly,
  setStarredOnly,
  minScore,
  setMinScore,
  onOpenKeywordsModal
}) {
  return (
    <div className="glass-card p-4 rounded-xl mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, abstract, or author..."
          className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Min Score Slider */}
        <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 whitespace-nowrap">Min Score:</span>
          <span className="font-mono font-bold text-cyan-300 w-6">{minScore}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-24 accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Starred Only Toggle */}
        <button
          onClick={() => setStarredOnly(!starredOnly)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            starredOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>Starred Only</span>
        </button>

        {/* Manage Keywords Modal Trigger */}
        <button
          onClick={onOpenKeywordsModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
        >
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <span>Keywords</span>
        </button>
      </div>
    </div>
  );
}
