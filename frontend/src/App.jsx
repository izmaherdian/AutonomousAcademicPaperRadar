import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import PaperCard from './components/PaperCard';
import VirtualESP32Widget from './components/VirtualESP32Widget';
import {
  fetchPapers,
  toggleStarPaper,
  toggleReadPaper,
  triggerArxivFetch,
  fetchStats,
} from './services/api';
import { wsClient } from './services/websocket';
import { Radar, ChevronLeft, ChevronRight, Inbox, RefreshCw } from 'lucide-react';

export default function App() {
  const [papers, setPapers]                         = useState([]);
  const [stats, setStats]                           = useState({});
  const [search, setSearch]                         = useState('');
  const [starredOnly, setStarredOnly]               = useState(false);
  const [minScore, setMinScore]                     = useState(0);
  const [page, setPage]                             = useState(1);
  const [total, setTotal]                           = useState(0);
  const [isLoading, setIsLoading]                   = useState(true);
  const [isFetching, setIsFetching]                 = useState(false);
  const [isConnected, setIsConnected]               = useState(false);
  const [showESP32Widget, setShowESP32Widget]       = useState(false);
  const [latestHighRelevancePaper, setLatestHighRelevancePaper] = useState(null);

  // ── Load papers from DB ─────────────────────────────────────────────────
  const loadPapers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPapers({ page, limit: 20, search, starredOnly, minScore });
      setPapers(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching papers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, starredOnly, minScore]);

  // ── Load stats ──────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const res = await fetchStats();
      setStats(res);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => { loadPapers(); }, [loadPapers]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // ── WebSocket Listeners ─────────────────────────────────────────────────
  useEffect(() => {
    wsClient.connect();

    const unsubs = [
      wsClient.on('STATUS_CHANGE', ({ connected }) => setIsConnected(connected)),

      wsClient.on('NEW_PAPER', (paper) => {
        loadPapers();
        loadStats();
        // Alert for high-relevance papers (threshold: 70 to match backend)
        if (paper.relevance_score >= 70) {
          setLatestHighRelevancePaper({
            id: paper.id,
            title: paper.title,
            relevance_score: paper.relevance_score
          });
        }
      }),

      wsClient.on('PAPER_STARRED', ({ id, is_starred }) => {
        setPapers((prev) => prev.map((p) => p.id === id ? { ...p, is_starred } : p));
        loadStats();
      }),

      wsClient.on('PAPER_READ', ({ id, is_read }) => {
        setPapers((prev) => prev.map((p) => p.id === id ? { ...p, is_read } : p));
        loadStats();
      }),

      wsClient.on('FETCH_STARTED', () => setIsFetching(true)),

      wsClient.on('FETCH_COMPLETED', () => {
        setIsFetching(false);
        loadPapers();
        loadStats();
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [loadPapers, loadStats]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleTriggerFetch = async () => {
    setIsFetching(true);
    try {
      await triggerArxivFetch('');
    } catch (err) {
      console.error('Failed to trigger fetch:', err);
      setIsFetching(false);
    }
  };

  const handleToggleStar = async (id, isStarred) => {
    try {
      await toggleStarPaper(id, isStarred);
      setPapers((prev) => prev.map((p) => p.id === id ? { ...p, is_starred: isStarred } : p));
      loadStats();
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleToggleRead = async (id, isRead) => {
    try {
      await toggleReadPaper(id, isRead);
      setPapers((prev) => prev.map((p) => p.id === id ? { ...p, is_read: isRead } : p));
      loadStats();
    } catch (err) {
      console.error('Failed to toggle read:', err);
    }
  };

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">

      {/* Header */}
      <Header
        isConnected={isConnected}
        isFetching={isFetching}
        onTriggerFetch={handleTriggerFetch}
        onToggleESP32Widget={() => setShowESP32Widget(!showESP32Widget)}
        showESP32Widget={showESP32Widget}
      />

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">

        {/* ESP32 Widget */}
        {showESP32Widget && (
          <VirtualESP32Widget
            onClose={() => setShowESP32Widget(false)}
            latestPaper={latestHighRelevancePaper}
            allPapers={papers}
            onRefreshPapers={loadPapers}
          />
        )}

        {/* Stats */}
        <StatsOverview stats={stats} />

        {/* Filter Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          starredOnly={starredOnly}
          setStarredOnly={setStarredOnly}
          minScore={minScore}
          setMinScore={setMinScore}
        />

        {/* Paper List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-500 tracking-wide uppercase flex items-center space-x-2">
              <span>Discovered Papers</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-mono border border-blue-100">
                {total}
              </span>
            </h2>

            {isFetching && (
              <div className="flex items-center space-x-2 text-blue-500 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scraping arXiv & processing...</span>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card p-5 rounded-xl animate-pulse space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-16 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : papers.length > 0 ? (
            papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onToggleStar={handleToggleStar}
                onToggleRead={handleToggleRead}
              />
            ))
          ) : (
            /* Empty state */
            <div className="glass-panel p-12 rounded-xl text-center flex flex-col items-center justify-center border border-slate-200/80">
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <Inbox className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Belum Ada Paper</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-4">
                Klik tombol <strong>Fetch Papers</strong> untuk mengambil paper terbaru dari arXiv sesuai topik penelitian Anda.
              </p>
              <button
                onClick={handleTriggerFetch}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition-all"
              >
                Fetch Papers Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-400">
              Halaman <strong className="text-slate-600 font-mono">{page}</strong> dari{' '}
              <strong className="text-slate-600 font-mono">{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-400">
        Academic Paper Radar &copy; 2026 &bull; Go Backend &bull; Python ML Service &bull; ESP32 MQTT &bull; NGINX Docker
      </footer>
    </div>
  );
}
