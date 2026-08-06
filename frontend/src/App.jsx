import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import PaperCard from './components/PaperCard';
import KeywordModal from './components/KeywordModal';
import VirtualESP32Widget from './components/VirtualESP32Widget';
import {
  fetchPapers,
  toggleStarPaper,
  toggleReadPaper,
  triggerArxivFetch,
  fetchStats,
  fetchKeywords,
  updateKeywords
} from './services/api';
import { wsClient } from './services/websocket';
import { Radar, AlertCircle, Sparkles, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function App() {
  const [papers, setPapers] = useState([]);
  const [stats, setStats] = useState({});
  const [keywords, setKeywords] = useState('');
  const [search, setSearch] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showKeywordsModal, setShowKeywordsModal] = useState(false);
  const [showESP32Widget, setShowESP32Widget] = useState(false);
  const [latestHighRelevancePaper, setLatestHighRelevancePaper] = useState(null);

  const loadPapers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPapers({
        page,
        limit: 20,
        search,
        starredOnly,
        minScore
      });
      setPapers(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching papers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, starredOnly, minScore]);

  const loadStats = async () => {
    try {
      const res = await fetchStats();
      setStats(res);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const loadKeywords = async () => {
    try {
      const res = await fetchKeywords();
      setKeywords(res.keywords || '');
    } catch (err) {
      console.error('Error fetching keywords:', err);
    }
  };

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  useEffect(() => {
    loadStats();
    loadKeywords();
  }, []);

  // WebSocket Listeners
  useEffect(() => {
    wsClient.connect();

    const unsubs = [
      wsClient.on('STATUS_CHANGE', ({ connected }) => {
        setIsConnected(connected);
      }),
      wsClient.on('NEW_PAPER', (paper) => {
        setPapers((prev) => [paper, ...prev]);
        loadStats();
        if (paper.relevance_score >= 80) {
          setLatestHighRelevancePaper({
            id: paper.id,
            title: paper.title,
            relevance_score: paper.relevance_score
          });
        }
      }),
      wsClient.on('PAPER_STARRED', ({ id, is_starred }) => {
        setPapers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_starred } : p))
        );
        loadStats();
      }),
      wsClient.on('PAPER_READ', ({ id, is_read }) => {
        setPapers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_read } : p))
        );
        loadStats();
      }),
      wsClient.on('FETCH_STARTED', () => {
        setIsFetching(true);
      }),
      wsClient.on('FETCH_COMPLETED', () => {
        setIsFetching(false);
        loadPapers();
        loadStats();
      })
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [loadPapers]);

  const handleTriggerFetch = async () => {
    setIsFetching(true);
    try {
      await triggerArxivFetch(keywords);
    } catch (err) {
      console.error('Failed to trigger fetch:', err);
      setIsFetching(false);
    }
  };

  const handleToggleStar = async (id, isStarred) => {
    try {
      await toggleStarPaper(id, isStarred);
      setPapers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_starred: isStarred } : p))
      );
      loadStats();
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleToggleRead = async (id, isRead) => {
    try {
      await toggleReadPaper(id, isRead);
      setPapers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_read: isRead } : p))
      );
      loadStats();
    } catch (err) {
      console.error('Failed to toggle read:', err);
    }
  };

  const handleSaveKeywords = async (newKeywords) => {
    try {
      await updateKeywords(newKeywords);
      setKeywords(newKeywords);
      await triggerArxivFetch(newKeywords);
      setIsFetching(true);
    } catch (err) {
      console.error('Failed to update keywords:', err);
    }
  };

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Header Bar */}
      <Header
        isConnected={isConnected}
        isFetching={isFetching}
        onTriggerFetch={handleTriggerFetch}
        onOpenKeywordsModal={() => setShowKeywordsModal(true)}
        onToggleESP32Widget={() => setShowESP32Widget(!showESP32Widget)}
        showESP32Widget={showESP32Widget}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        
        {/* ESP32 Desk Assistant Widget */}
        {showESP32Widget && (
          <VirtualESP32Widget
            onClose={() => setShowESP32Widget(false)}
            latestPaper={latestHighRelevancePaper}
            allPapers={papers}
            onRefreshPapers={loadPapers}
          />
        )}

        {/* 4 Cards Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Filter & Search Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          starredOnly={starredOnly}
          setStarredOnly={setStarredOnly}
          minScore={minScore}
          setMinScore={setMinScore}
          keywords={keywords}
          onOpenKeywordsModal={() => setShowKeywordsModal(true)}
        />

        {/* Paper List Content Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase flex items-center space-x-2">
              <span>Discovered Papers</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono">
                {total}
              </span>
            </h2>

            {isFetching && (
              <div className="flex items-center space-x-2 text-cyan-400 text-xs animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Scraping arXiv & Gemini AI Processing...</span>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card p-6 rounded-2xl animate-pulse space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-16 bg-slate-800 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : papers.length > 0 ? (
            /* Paper Cards List */
            papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onToggleStar={handleToggleStar}
                onToggleRead={handleToggleRead}
              />
            ))
          ) : (
            /* Empty State */
            <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center border border-slate-800/80">
              <div className="p-4 rounded-2xl bg-slate-800/60 text-slate-400 mb-3 border border-slate-700/50">
                <Inbox className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Papers Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Try adjusting your search terms, minimum relevance score slider, or click Trigger Fetch to scrape arXiv papers.
              </p>
              <button
                onClick={handleTriggerFetch}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
              >
                Trigger arXiv Fetch
              </button>
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800/60">
            <span className="text-xs text-slate-400">
              Page <strong className="text-white font-mono">{page}</strong> of <strong className="text-white font-mono">{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Keywords Modal */}
      <KeywordModal
        isOpen={showKeywordsModal}
        onClose={() => setShowKeywordsModal(false)}
        currentKeywords={keywords}
        onSaveKeywords={handleSaveKeywords}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        Autonomous Academic Paper Radar &copy; 2026 &bull; Go Backend &bull; Python Gemini AI &bull; ESP32 MQTT &bull; NGINX Docker
      </footer>
    </div>
  );
}
