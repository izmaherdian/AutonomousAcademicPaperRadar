import React from 'react';
import { FileText, TrendingUp, BookOpen, Star } from 'lucide-react';

export default function StatsOverview({ stats = {} }) {
  const avgScore = stats.avg_score != null ? Math.round(stats.avg_score) : 0;

  const cards = [
    {
      title: 'Total Papers',
      value: stats.total_papers ?? 0,
      icon: FileText,
      accent: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'Avg Relevansi',
      value: `${avgScore}/100`,
      icon: TrendingUp,
      accent: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Belum Dibaca',
      value: stats.unread_count ?? 0,
      icon: BookOpen,
      accent: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-50 border-violet-100',
      iconColor: 'text-violet-600',
      textColor: 'text-violet-600',
    },
    {
      title: 'Starred',
      value: stats.starred_count ?? 0,
      icon: Star,
      accent: 'from-amber-400 to-orange-500',
      iconBg: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card p-4 rounded-xl relative overflow-hidden group border border-slate-200/80 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase mb-1">
                  {card.title}
                </p>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            {/* Accent bottom bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.accent} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
        );
      })}
    </div>
  );
}
