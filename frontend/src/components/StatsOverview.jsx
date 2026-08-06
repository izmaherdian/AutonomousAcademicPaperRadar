import React from 'react';
import { BookOpen, Star, EyeOff, Award } from 'lucide-react';

export default function StatsOverview({ stats }) {
  const total = stats.total_papers || 0;
  const avgScore = stats.avg_score ? stats.avg_score.toFixed(1) : '0.0';
  const unread = stats.unread_count || 0;
  const starred = stats.starred_count || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Papers */}
      <div className="glass-card p-4 rounded-xl flex items-center space-x-3.5">
        <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Total Papers</p>
          <p className="text-xl font-bold text-white tracking-tight">{total}</p>
        </div>
      </div>

      {/* Average Relevance Score */}
      <div className="glass-card p-4 rounded-xl flex items-center space-x-3.5">
        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Avg Score</p>
          <p className="text-xl font-bold text-white tracking-tight">{avgScore} <span className="text-xs font-normal text-slate-400">/ 100</span></p>
        </div>
      </div>

      {/* Unread Papers */}
      <div className="glass-card p-4 rounded-xl flex items-center space-x-3.5">
        <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <EyeOff className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Unread Papers</p>
          <p className="text-xl font-bold text-white tracking-tight">{unread}</p>
        </div>
      </div>

      {/* Starred Papers */}
      <div className="glass-card p-4 rounded-xl flex items-center space-x-3.5">
        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Star className="w-5 h-5 fill-purple-400/20" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Starred Papers</p>
          <p className="text-xl font-bold text-white tracking-tight">{starred}</p>
        </div>
      </div>
    </div>
  );
}
