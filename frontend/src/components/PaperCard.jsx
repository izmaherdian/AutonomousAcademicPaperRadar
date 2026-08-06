import React from 'react';
import { Star, ExternalLink, BookOpen, CheckCircle, Sparkles, Tag, Calendar, User } from 'lucide-react';

export default function PaperCard({ paper, onToggleStar, onToggleRead }) {
  const getScoreBadge = (score) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        label: 'High Relevance',
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
        label: 'Medium Relevance',
      };
    }
    return {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      label: 'General Match',
    };
  };

  const badge = getScoreBadge(paper.relevance_score);

  return (
    <div className={`glass-card p-6 rounded-2xl relative transition-all border ${
      paper.is_read ? 'opacity-75 border-slate-800/60' : 'border-slate-800/90 hover:border-cyan-500/30'
    }`}>
      
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          {/* Score Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono">{paper.relevance_score}/100</span>
            <span className="hidden sm:inline font-normal text-[11px] opacity-80">({badge.label})</span>
          </div>

          {/* Read Status Badge */}
          {paper.is_read && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium">
              <CheckCircle className="w-3 h-3 text-slate-400" />
              <span>Read</span>
            </span>
          )}
        </div>

        {/* Date Published */}
        <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{paper.published_at ? new Date(paper.published_at).toLocaleDateString() : 'Recent'}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-base lg:text-lg font-bold text-white mb-2 leading-snug hover:text-cyan-400 transition-colors">
        <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {paper.title}
        </a>
      </h2>

      {/* Authors */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-4">
        <User className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
        <span className="truncate">{paper.authors}</span>
      </div>

      {/* AI Summary Box */}
      <div className="bg-[#0b0f19]/90 border border-slate-800/80 rounded-xl p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
            3-Sentence AI Summary (Gemini)
          </span>
        </div>
        <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-sans">
          {paper.summary_ai || paper.summary_raw}
        </p>
      </div>

      {/* Tags & Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        
        {/* Hashtags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {paper.tags && paper.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 text-slate-300 border border-slate-700/50 text-[11px] font-mono flex items-center space-x-1"
            >
              <Tag className="w-3 h-3 text-cyan-400" />
              <span>{tag.startsWith('#') ? tag : `#${tag}`}</span>
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          
          {/* Read Toggle Button */}
          <button
            onClick={() => onToggleRead(paper.id, !paper.is_read)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              paper.is_read
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800'
            }`}
            title={paper.is_read ? 'Mark as Unread' : 'Mark as Read'}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Star Toggle Button */}
          <button
            onClick={() => onToggleStar(paper.id, !paper.is_starred)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              paper.is_starred
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-amber-400 border-slate-800'
            }`}
            title={paper.is_starred ? 'Remove Star' : 'Star Paper'}
          >
            <Star className={`w-4 h-4 ${paper.is_starred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* arXiv PDF Link */}
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <span>PDF</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

        </div>
      </div>
    </div>
  );
}
