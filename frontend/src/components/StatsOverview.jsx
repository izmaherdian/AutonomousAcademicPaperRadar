import React from 'react';
import { FileText, Sparkles, BookOpen, Star } from 'lucide-react';

export default function StatsOverview({ stats = {} }) {
  const cards = [
    {
      title: 'Total Papers',
      value: stats.total_papers || 0,
      icon: FileText,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Avg Relevance Score',
      value: `${Math.round(stats.avg_score || 0)}/100`,
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Unread Papers',
      value: stats.unread_count || 0,
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-500',
      textColor: 'text-indigo-400',
      bgGlow: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Starred Papers',
      value: stats.starred_count || 0,
      icon: Star,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card p-5 rounded-2xl relative overflow-hidden group border border-slate-800/80 hover:border-slate-700/80 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  {card.title}
                </p>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1.5 font-sans tracking-tight">
                  {card.value}
                </h3>
              </div>

              <div className={`p-3 rounded-2xl border ${card.bgGlow} transition-transform group-hover:scale-110 duration-300`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>

            {/* Subtle Accent Bottom Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.color} opacity-30 group-hover:opacity-100 transition-opacity`} />
          </div>
        );
      })}
    </div>
  );
}
