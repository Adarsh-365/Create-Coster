import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations?: any[];
  onSelectChat?: (chatId: string) => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Search Container */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl glass-bright rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-[var(--border)]"
        >
          {/* Top Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-[var(--border)] h-14 bg-slate-950/40">
            <Search className="text-blue-400" size={18} />
            <input
              type="text"
              autoFocus
              placeholder="Search projects, scenes, or Manim code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-slate-100 text-sm focus:outline-none placeholder-slate-500 w-full"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results Area */}
          <div className="p-4 flex flex-col items-center justify-center text-center min-h-[160px]">
            <Film size={28} className="text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 font-medium">Search Manim Projects & Scenes</p>
            <p className="text-[10px] text-slate-600 mt-1">Type keywords to locate generated Python code and animation scenes</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
