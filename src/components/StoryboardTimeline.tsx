import { useRef } from 'react';
import {
  CheckCircle2, Loader2, AlertCircle, Circle,
  Pencil, RefreshCw, Copy, Trash2, Clock, FileCode2
} from 'lucide-react';
import type { ManimScene, SceneStatus } from './Types';
import { motion } from 'framer-motion';

interface StoryboardTimelineProps {
  scenes: ManimScene[];
  activeIdx: number;
  onSelectScene: (idx: number) => void;
  onReRenderScene?: (idx: number) => void;
}

const statusBadge = (status: SceneStatus, progress: number) => {
  switch (status) {
    case 'rendered':
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          <CheckCircle2 size={10} /> Completed
        </span>
      );
    case 'rendering':
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
          <Loader2 size={10} className="animate-spin" /> Rendering {progress}%
        </span>
      );
    case 'queued':
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
          Queued
        </span>
      );
    case 'failed':
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
          <AlertCircle size={10} /> Failed
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
          Pending
        </span>
      );
  }
};

export default function StoryboardTimeline({
  scenes,
  activeIdx,
  onSelectScene,
  onReRenderScene,
}: StoryboardTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-t border-zinc-800/80 bg-zinc-950 p-3 shrink-0 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Storyboard Timeline
          </span>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
            {scenes.length} scenes
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 size={11} /> {scenes.filter(s => s.status === 'rendered').length} rendered
          </span>
          {scenes.filter(s => s.status === 'rendering').length > 0 && (
            <span className="flex items-center gap-1 text-blue-400">
              <Loader2 size={11} className="animate-spin" /> {scenes.filter(s => s.status === 'rendering').length} rendering
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Storyboard Row */}
      <div
        ref={scrollRef}
        className="storyboard-row flex items-center gap-3 pb-1"
      >
        {scenes.map((scene, i) => {
          const isActive = i === activeIdx;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(i)}
              className={`
                relative shrink-0 w-52 rounded-lg border cursor-pointer
                transition-all duration-150 overflow-hidden group bg-zinc-900/90
                ${isActive
                  ? 'border-blue-500/80 shadow-xs'
                  : 'border-zinc-800/80 hover:border-zinc-700'
                }
              `}
            >
              {/* Card top Header: Scene Number + Understated Status */}
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold ${isActive ? 'text-blue-400' : 'text-zinc-400'}`}>
                    {String(scene.number).padStart(2, '0')}
                  </span>
                  {statusBadge(scene.status, scene.renderProgress)}
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className={`text-xs font-semibold leading-snug truncate ${isActive ? 'text-zinc-100' : 'text-zinc-200'}`}>
                    {scene.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {scene.description}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {scene.duration}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-600">
                    <FileCode2 size={10} /> {scene.filename}
                  </span>
                </div>
              </div>

              {/* Understated Thin Progress Bar */}
              <div className="w-full h-1 bg-zinc-800 relative overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    scene.status === 'rendered' ? 'bg-emerald-500' :
                    scene.status === 'rendering' ? 'bg-blue-500' :
                    scene.status === 'failed' ? 'bg-rose-500' : 'bg-zinc-700'
                  }`}
                  style={{ width: `${scene.renderProgress}%` }}
                />
              </div>

              {/* Hidden Hover Action Overlay (Edit, Re-render, Duplicate, Delete) */}
              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 border border-zinc-700 rounded-lg">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectScene(i); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium border border-zinc-700 transition-colors"
                  title="Edit Scene"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReRenderScene?.(i); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors"
                  title="Re-render Scene"
                >
                  <RefreshCw size={12} /> Re-render
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
