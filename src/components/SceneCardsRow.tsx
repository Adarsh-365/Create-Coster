import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, FileCode2, CheckCircle2, Loader2,
  AlertCircle, Circle, Eye, Pencil,
  RefreshCw, Copy, Zap
} from 'lucide-react';
import type { ManimScene, SceneStatus } from './Types';

interface SceneCardsRowProps {
  scenes: ManimScene[];
  activeIdx: number;
  onSelectScene: (idx: number) => void;
}

const STATUS_CONFIG: Record<SceneStatus, {
  badge: string;
  icon: React.ReactNode;
  barColor: string;
  cardBorder: string;
  labelColor: string;
}> = {
  rendered: {
    badge: 'badge-rendered',
    icon: <CheckCircle2 size={11} className="text-green-400" />,
    barColor: 'bg-green-500',
    cardBorder: 'border-green-500/15',
    labelColor: 'text-green-400',
  },
  rendering: {
    badge: 'badge-rendering',
    icon: <Loader2 size={11} className="text-cyan-400 spinner" />,
    barColor: 'bg-cyan-400',
    cardBorder: 'border-cyan-500/25',
    labelColor: 'text-cyan-400',
  },
  queued: {
    badge: 'badge-queued',
    icon: <Zap size={11} className="text-amber-400" />,
    barColor: 'bg-amber-400',
    cardBorder: 'border-amber-500/15',
    labelColor: 'text-amber-400',
  },
  pending: {
    badge: 'badge-pending',
    icon: <Circle size={11} className="text-slate-600" />,
    barColor: 'bg-slate-700',
    cardBorder: 'border-slate-700/30',
    labelColor: 'text-slate-500',
  },
  failed: {
    badge: 'badge-failed',
    icon: <AlertCircle size={11} className="text-red-400" />,
    barColor: 'bg-red-500',
    cardBorder: 'border-red-500/30',
    labelColor: 'text-red-400',
  },
};

function RenderProgressBar({ progress, status }: { progress: number; status: SceneStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden relative">
      <motion.div
        className={`h-full rounded-full ${cfg.barColor} relative overflow-hidden`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {status === 'rendering' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" />
        )}
      </motion.div>
    </div>
  );
}

function SceneCard({
  scene,
  isActive,
  index,
  onClick,
}: {
  scene: ManimScene;
  isActive: boolean;
  index: number;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[scene.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      onClick={onClick}
      className={`
        relative shrink-0 w-48 rounded-2xl border cursor-pointer
        transition-all duration-200 overflow-hidden group
        ${isActive
          ? `bg-blue-600/10 border-blue-500/40 card-active-glow shadow-xl shadow-blue-500/10`
          : `bg-[var(--bg-card)] ${cfg.cardBorder} hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/5`
        }
      `}
    >
      {/* Active indicator strip */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
      )}

      <div className="p-3.5 flex flex-col gap-2.5">
        {/* Header: scene number + status badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`font-mono text-[10px] font-black ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
              SCENE
            </span>
            <span className={`font-mono text-sm font-black ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>
              {String(scene.number).padStart(2, '0')}
            </span>
          </div>
          <span className={`${cfg.badge} text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1`}>
            {cfg.icon}
            {scene.status}
          </span>
        </div>

        {/* Title */}
        <div>
          <p className={`text-xs font-bold leading-tight line-clamp-2 ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white transition-colors'}`}>
            {scene.title}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {scene.description}
          </p>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Clock size={9} className="text-slate-600" />
            {scene.duration}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <FileCode2 size={9} className="text-slate-600" />
            {scene.filename}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1">
          <RenderProgressBar progress={scene.renderProgress} status={scene.status} />
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-bold ${cfg.labelColor}`}>
              {scene.status === 'rendered' ? 'Complete' :
               scene.status === 'rendering' ? `${scene.renderProgress}%` :
               scene.status === 'failed' ? 'Failed' :
               scene.status === 'queued' ? 'Queued' : 'Pending'}
            </span>
            {scene.errorMessage && (
              <span className="text-[9px] text-red-400 font-medium truncate max-w-[80px]" title={scene.errorMessage}>
                ⚠ Error
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border)]" />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); onClick(); }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all"
          >
            <Eye size={10} />
            Preview
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/60 border border-[var(--border)] text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all"
            title="Edit code"
          >
            <Pencil size={10} />
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/60 border border-[var(--border)] text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all"
            title="Regenerate"
          >
            <RefreshCw size={10} />
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/60 border border-[var(--border)] text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all"
            title="Duplicate"
          >
            <Copy size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SceneCardsRow({ scenes, activeIdx, onSelectScene }: SceneCardsRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active card into view
  const scrollToActive = (idx: number) => {
    const container = rowRef.current;
    if (!container) return;
    const card = container.children[idx] as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="shrink-0 px-4 py-3 border-t border-[var(--border)]">
      {/* Row header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scene Cards</span>
          <span className="text-[10px] font-bold text-blue-400 bg-blue-600/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
            {scenes.length} scenes
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-600 font-medium">
          {scenes.filter(s => s.status === 'rendered').length > 0 && (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle2 size={9} />
              {scenes.filter(s => s.status === 'rendered').length} done
            </span>
          )}
          {scenes.filter(s => s.status === 'rendering').length > 0 && (
            <span className="flex items-center gap-1 text-cyan-500">
              <Loader2 size={9} className="spinner" />
              {scenes.filter(s => s.status === 'rendering').length} rendering
            </span>
          )}
          {scenes.filter(s => s.status === 'failed').length > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertCircle size={9} />
              {scenes.filter(s => s.status === 'failed').length} failed
            </span>
          )}
        </div>
      </div>

      {/* Cards horizontal scroll */}
      <div
        ref={rowRef}
        className="scrollable-row flex gap-3 pb-2"
      >
        {scenes.map((scene, i) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            isActive={i === activeIdx}
            index={i}
            onClick={() => { onSelectScene(i); scrollToActive(i); }}
          />
        ))}
      </div>
    </div>
  );
}
