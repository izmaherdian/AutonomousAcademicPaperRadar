import React, { useState } from 'react';
import { Star, Eye, EyeOff, FileText, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function PaperCard({ paper, onToggleStar, onToggleRead }) {
  const [showRawAbstract, setShowRawAbstract] = useState(false);

  const getScoreBadgeClass = (score) => {
    if (score >= 80) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10';
    } else if (score >= 50) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10';
    }
    return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
  };

  return (
    <div className={`glass-card p-5 rounded-2xl transition-all duration-200 ${
      paper.is_read ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Title & Metadata */}
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            {/* Relevance Score Badge */}
            <div className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold shadow-sm ${getScoreBadgeClass(paper.relevance_score)}`}>
              Score: {paper.relevance_score}/100
            </div>
            
            {/* Published Date */}
            <span className="text-xs text-slate-400 font-mono">
              {paper.published_at ? new Date(paper.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
            </span>

            {/* arXiv ID */}
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              arXiv:{paper.id}
            </span>
          </div>

          <h2 className="text-base font-bold text-white leading-snug hover:text-cyan-300 transition-colors">
            {paper.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium italic">
            By {paper.authors}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Star Toggle */}
          <button
            onClick={() => onToggleStar(paper.id, !paper.is_starred)}
            className={`p-2 rounded-lg border transition-all ${
              paper.is_starred
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-amber-500/10'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title={paper.is_starred ? 'Unstar paper' : 'Star paper'}
          >
            <Star className={`w-4 h-4 ${paper.is_starred ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Read Toggle */}
          <button
            onClick={() => onToggleRead(paper.id, !paper.is_read)}
            className={`p-2 rounded-lg border transition-all ${
              paper.is_read
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
            title={paper.is_read ? 'Mark as unread' : 'Mark as read'}
          >
            {paper.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* PDF External Link */}
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            title="Open PDF Document"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* AI Summary Highlight Box */}
      {paper.summary_ai && (
        <div className="my-3.5 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-200 leading-relaxed relative">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 3-Sentence Summary
          </div>
          <p className="text-slate-300 font-normal">
            {paper.summary_ai}
          </p>
        </div>
      )}

      {/* Tags Pills */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {paper.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-cyan-400/90 border border-slate-700/80 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Expand/Collapse Raw Abstract */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          onClick={() => setShowRawAbstract(!showRawAbstract)}
          className="flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors gap-1 font-medium"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showRawAbstract ? 'Hide Full Abstract' : 'Show Full Abstract'}</span>
          {showRawAbstract ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showRawAbstract && (
          <p className="mt-2.5 text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {paper.summary_raw}
          </p>
        )}
      </div>
    </div>
  );
}
