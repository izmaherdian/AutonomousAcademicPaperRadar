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
import { Radar, AlertCircle } from 'lucide-react';

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
        if (paper.relevance_score >= 70) {
          setLatestHighRelevancePaper({
            id: paper.id,
            title: paper.title,
            score: paper.relevance_score
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
    await updateKeywords(newKeywords);
    setKeywords(newKeywords);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <Header
        isConnected={isConnected}
        isFetching={isFetching}
        onTriggerFetch={handleTriggerFetch}
        onToggleESP32Widget={() => setShowESP32Widget(!showESP32Widget)}
        showESP32Widget={showESP32Widget}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* ESP32 Desk Assistant Widget Simulation */}
        {showESP32Widget && (
          <VirtualESP32Widget
            onClose={() => setShowESP32Widget(false)}
            latestHighRelevancePaper={latestHighRelevancePaper}
            onTriggerFetch={handleTriggerFetch}
            onToggleStar={handleToggleStar}
          />
        )}

        {/* Stats Overview Panel */}
        <StatsOverview stats={stats} />

        {/* Search & Filter Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          starredOnly={starredOnly}
          setStarredOnly={setStarredOnly}
          minScore={minScore}
          setMinScore={setMinScore}
          onOpenKeywordsModal={() => setShowKeywordsModal(true)}
        />

        {/* Paper Feed */}
        {isLoading ? (
          <div className="py-20 text-center glass-card rounded-2xl">
            <Radar className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Loading paper radar feed...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-2xl p-8">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Papers Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
              No arXiv research papers matched your search criteria or minimum score filter ({minScore}).
            </p>
            <button
              onClick={handleTriggerFetch}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 inline-flex items-center space-x-2"
            >
              <Radar className="w-4 h-4" />
              <span>Fetch Papers from arXiv</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onToggleStar={handleToggleStar}
                onToggleRead={handleToggleRead}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Autonomous Academic Paper Radar &copy; 2026. Built with Go, React, Python FastAPI & Google Gemini API.
      </footer>

      {/* Keywords Management Modal */}
      <KeywordModal
        isOpen={showKeywordsModal}
        onClose={() => setShowKeywordsModal(false)}
        currentKeywords={keywords}
        onSaveKeywords={handleSaveKeywords}
      />
    </div>
  );
}
