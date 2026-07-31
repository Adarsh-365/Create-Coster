import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Play, Pause,
  Film, Download, Cpu, Clock
} from 'lucide-react';
import type { ManimScene } from './Types';

interface SceneControllerProps {
  scenes: ManimScene[];
  activeIdx: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onRenderAll: () => void;
  onExport: () => void;
  onScrub: (idx: number) => void;
}

export default function SceneController({
  scenes,
  activeIdx,
  isPlaying,
  onPrev,
  onNext,
  onPlayPause,
  onRenderAll,
  onExport,
  onScrub,
}: SceneControllerProps) {
  const totalSecs = scenes.reduce((s, sc) => s + sc.durationSeconds, 0);
  const elapsedSecs = scenes.slice(0, activeIdx).reduce((s, sc) => s + sc.durationSeconds, 0);
  const progressPct = totalSecs > 0 ? (elapsedSecs / totalSecs) * 100 : 0;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const pendingCount = scenes.filter(s => s.status === 'pending' || s.status === 'queued').length;

  return (
    <div className="px-5 py-3 border-t border-[var(--border)] shrink-0 glass">
      {/* Timeline scrubber */}
      <div className="mb-3 relative">
        {/* Scene markers on scrubber */}
        <div className="relative w-full h-1 mb-1">
          {scenes.map((sc, i) => {
            const pct = totalSecs > 0
              ? (scenes.slice(0, i).reduce((s, x) => s + x.durationSeconds, 0) / totalSecs) * 100
              : (i / scenes.length) * 100;
            return (
              <div
                key={sc.id}
                className="absolute top-0 w-0.5 h-3 -mt-1 rounded-full cursor-pointer transition-opacity hover:opacity-100 opacity-50"
                style={{
                  left: `${pct}%`,
                  background: sc.status === 'rendered' ? '#10b981' :
                               sc.status === 'rendering' ? '#22d3ee' :
                               sc.status === 'failed' ? '#ef4444' :
                               sc.status === 'queued' ? '#f59e0b' : '#475569',
                }}
                onClick={() => onScrub(i)}
                title={`Scene ${sc.number}: ${sc.title}`}
              />
            );
          })}
        </div>

        {/* Scrubber track */}
        <div className="relative w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
          {/* Filled portion */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 8px rgba(59,130,246,0.5)',
            }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Draggable input overlay */}
        <input
          type="range"
          min={0}
          max={scenes.length - 1}
          value={activeIdx}
          onChange={e => onScrub(Number(e.target.value))}
          className="timeline-scrubber absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '100%' }}
        />

        {/* Time labels */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[10px] text-slate-500">{fmt(elapsedSecs)}</span>
          <span className="font-mono text-[10px] text-slate-500">{fmt(totalSecs)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: playback */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={activeIdx === 0}
            className="p-2 rounded-xl bg-slate-900/60 border border-[var(--border)] text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Scene"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Play/Pause — main CTA */}
          <motion.button
            onClick={onPlayPause}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'btn-primary shadow-blue-500/25'
            }`}
          >
            {isPlaying ? (
              <><Pause size={15} fill="currentColor" /> Stop Ride</>
            ) : (
              <><Play size={15} className="ml-0.5" fill="currentColor" /> Ride Coaster</>
            )}
          </motion.button>

          <button
            onClick={onNext}
            disabled={activeIdx === scenes.length - 1}
            className="p-2 rounded-xl bg-slate-900/60 border border-[var(--border)] text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Scene"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Center: info */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Film size={11} />
            {activeIdx + 1} / {scenes.length}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {scenes[activeIdx]?.duration}
          </span>
        </div>

        {/* Right: Render All + Export */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={onRenderAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all"
            >
              <Cpu size={12} />
              Render All ({pendingCount})
            </button>
          )}

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl btn-primary text-xs font-bold"
            title="Export Final Video"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
