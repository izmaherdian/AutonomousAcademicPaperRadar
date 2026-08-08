import React from 'react';
import { Star, ExternalLink, BookOpen, CheckCircle, Tag, Calendar, User, Clock, Sparkles } from 'lucide-react';

// Helper parser to render **bold** text as styled <strong> tags
function renderFormattedSummary(text) {
  if (!text) return null;

  // Split text into paragraphs first (by \n\n or single \n)
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        // Parse **bold** markdown tags inside each paragraph
        const parts = para.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={pIdx} className="leading-relaxed">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                const innerText = part.slice(2, -2);
                return (
                  <strong
                    key={i}
                    className="font-semibold text-slate-900 bg-amber-100/60 px-1 py-0.5 rounded mx-0.5 border border-amber-200/50"
                  >
                    {innerText}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function PaperCard({ paper, onToggleStar, onToggleRead }) {
  const getScoreBadge = (score) => {
    if (score >= 75) return { cls: 'badge-high', label: 'Sangat Relevan' };
    if (score >= 50) return { cls: 'badge-medium', label: 'Cukup Relevan' };
    return { cls: 'badge-low', label: 'Relevansi Rendah' };
  };

  const badge = getScoreBadge(paper.relevance_score);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Terbaru';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  return (
    <div
      id={`paper-card-${paper.id}`}
      className={`glass-card p-5 rounded-2xl relative transition-all border ${
        paper.is_read
          ? 'opacity-65 border-slate-200/50 bg-slate-50/50'
          : 'border-slate-200/80 hover:shadow-md'
      }`}
    >
      {/* Top Row: Score Badge + Read Status + Fetch Time */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Granular Score Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${badge.cls}`}>
            <span className="font-mono text-sm">{paper.relevance_score}</span>
            <span className="text-[11px] font-normal opacity-85">/100 · {badge.label}</span>
          </div>

          {/* Dibaca badge */}
          {paper.is_read && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium">
              <CheckCircle className="w-3 h-3 text-slate-400" />
              <span>Dibaca</span>
            </span>
          )}
        </div>

        {/* Date & fetch time */}
        <div className="flex items-center gap-3">
          {paper.fetch_day && paper.fetch_time && (
            <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
              <Clock className="w-3 h-3 text-slate-400/80" />
              <span>{paper.fetch_day}, {paper.fetch_time} WIB</span>
            </div>
          )}
          <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
            <Calendar className="w-3 h-3 text-slate-400/80" />
            <span>{formatDate(paper.published_at)}</span>
          </div>
        </div>
      </div>

      {/* Paper Title */}
      <h2 className="text-base lg:text-lg font-bold text-slate-800 mb-2 leading-snug tracking-tight">
        <a
          href={paper.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-600 transition-colors"
        >
          {paper.title}
        </a>
      </h2>

      {/* Authors */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4">
        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="truncate">{paper.authors}</span>
      </div>

      {/* Summary Box (Kalem, Serene, Bold Formatted) */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4.5 mb-4 shadow-2xs">
        <div className="flex items-center space-x-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Ringkasan Analitis
          </p>
        </div>
        {renderFormattedSummary(paper.summary_ai || paper.summary_raw)}
      </div>

      {/* Tags & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">

        {/* Topic Hashtags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {paper.tags && paper.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 text-[11px] font-mono flex items-center space-x-1 shadow-2xs"
            >
              <Tag className="w-2.5 h-2.5 text-indigo-400" />
              <span>{tag.startsWith('#') ? tag : `#${tag}`}</span>
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">

          {/* Toggle Read */}
          <button
            id={`read-btn-${paper.id}`}
            onClick={() => onToggleRead(paper.id, !paper.is_read)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              paper.is_read
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'bg-white text-slate-500 hover:text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title={paper.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Toggle Star */}
          <button
            id={`star-btn-${paper.id}`}
            onClick={() => onToggleStar(paper.id, !paper.is_starred)}
            className={`p-2 rounded-lg border text-xs transition-all ${
              paper.is_starred
                ? 'bg-amber-50 text-amber-500 border-amber-200'
                : 'bg-white text-slate-500 hover:text-amber-500 border-slate-200 hover:border-amber-200'
            }`}
            title={paper.is_starred ? 'Hapus Bintang' : 'Beri Bintang'}
          >
            <Star className={`w-4 h-4 ${paper.is_starred ? 'fill-amber-400' : ''}`} />
          </button>

          {/* PDF Link */}
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-2xs"
          >
            <span>PDF</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
