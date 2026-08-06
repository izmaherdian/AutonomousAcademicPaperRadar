import React, { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';

export default function KeywordModal({ isOpen, onClose, currentKeywords, onSaveKeywords }) {
  const [keywords, setKeywords] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setKeywords(currentKeywords || '');
  }, [currentKeywords, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keywords.trim()) return;
    setIsSaving(true);
    try {
      await onSaveKeywords(keywords.trim());
      onClose();
    } catch (err) {
      console.error('Failed to save keywords:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Manage arXiv Keywords</h3>
            <p className="text-xs text-slate-400">Configure search terms used for arXiv paper scraping</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Keywords (Comma Separated)
            </label>
            <textarea
              rows="3"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. swarm robotics, decentralized control, drone vtol"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            ></textarea>
            <p className="text-[11px] text-slate-500 mt-1">
              Example: <code className="text-cyan-400">swarm robotics, decentralized control, drone vtol</code>
            </p>
          </div>

          <div className="flex justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save & Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
