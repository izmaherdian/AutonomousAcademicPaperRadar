import React from 'react';
import { Star, ExternalLink, BookOpen, CheckCircle, Tag, Calendar, User, Clock } from 'lucide-react';

export default function PaperCard({ paper, onToggleStar, onToggleRead }) {
  const getScoreBadge = (score) => {
    if (score >= 75) return { cls: 'badge-high', label: 'Sangat Relevan' };
    if (score >= 50) return { cls: 'badge-medium', label: 'Cukup Relevan' };
    return { cls: 'badge-low', label: 'Relevan Rendah' };
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
      className={`glass-card p-5 rounded-xl relative transition-all border ${
        paper.is_read
          ? 'opacity-60 border-slate-200/60'
          : 'border-slate-200/80 hover:shadow-md'
      }`}
    >
      {/* Top Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Score Badge */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
            <span className="font-mono text-sm">{paper.relevance_score}</span>
            <span className="text-[10px] font-normal opacity-80">/100 · {badge.label}</span>
          </div>

          {/* Read badge */}
          {paper.is_read && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium">
              <CheckCircle className="w-3 h-3" />
              <span>Dibaca</span>
            </span>
          )}
        </div>

        {/* Date & fetch time */}
        <div className="flex items-center gap-3">
          {paper.fetch_day && paper.fetch_time && (
            <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
              <Clock className="w-3 h-3 text-slate-300" />
              <span>{paper.fetch_day}, {paper.fetch_time} WIB</span>
            </div>
          )}
          <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
            <Calendar className="w-3 h-3 text-slate-300" />
            <span>{formatDate(paper.published_at)}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-sm lg:text-base font-bold text-slate-800 mb-1.5 leading-snug">
        <a
          href={paper.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          {paper.title}
        </a>
      </h2>

      {/* Authors */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-3">
        <User className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
        <span className="truncate">{paper.authors}</span>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Ringkasan
        </p>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {paper.summary_ai || paper.summary_raw}
        </p>
      </div>

      {/* Tags & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">

        {/* Hashtags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {paper.tags && paper.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-mono flex items-center space-x-1"
            >
              <Tag className="w-2.5 h-2.5 text-blue-400" />
              <span>{tag.startsWith('#') ? tag : `#${tag}`}</span>
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">

          {/* Read Toggle */}
          <button
            id={`read-btn-${paper.id}`}
            onClick={() => onToggleRead(paper.id, !paper.is_read)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              paper.is_read
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
            title={paper.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Star Toggle */}
          <button
            id={`star-btn-${paper.id}`}
            onClick={() => onToggleStar(paper.id, !paper.is_starred)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              paper.is_starred
                ? 'bg-amber-50 text-amber-500 border-amber-200'
                : 'bg-white text-slate-400 hover:text-amber-400 border-slate-200 hover:border-amber-200'
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <span>PDF</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
