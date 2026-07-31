import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertTriangle, FileCode, Layers, Sparkles } from 'lucide-react';

export default function SceneCoaster({ 
  scenes = [], 
  topic = '', 
  estimatedDuration = '', 
  selectedSceneId, 
  onSelectScene, 
  onGenerateVideo, 
  isLoading 
}) {
  if (!scenes || scenes.length === 0) {
    return null;
  }

  const getStatusBadge = (status, progress) => {
    switch (status) {
      case 'ready':
        return (
          <span className="badge badge-blue text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            <span>Ready</span>
          </span>
        );
      case 'completed':
        return (
          <span className="badge badge-emerald text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Completed</span>
          </span>
        );
      case 'rendering':
        return (
          <span className="badge badge-amber text-[10px]">
            <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
            <span>Rendering {progress || '0'}%</span>
          </span>
        );
      case 'failed':
        return (
          <span className="badge badge-neutral text-[10px] text-rose-500 border-rose-500/30 bg-rose-500/10">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-blue text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            <span>Ready</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-900/90 shadow-lg transition-all animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Scene Breakdown</h3>
            <span className="badge badge-blue text-[10px] font-mono">{scenes.length} Scenes</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            {topic ? <strong className="text-slate-800 dark:text-zinc-200">{topic}</strong> : `AI generated ${scenes.length} scenes for your video.`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500 font-mono self-start sm:self-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pipeline Synced</span>
        </div>
      </div>

      {/* Track & Touch Scroll Container */}
      <div className="relative py-6 sm:py-8 my-2 overflow-x-auto touch-pan-x scrollbar-thin">
        {/* Track Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 coaster-track-line z-0 opacity-40 rounded-full" />

        {/* Scene Coaches Grid */}
        <div className="relative z-10 flex items-center justify-between min-w-[700px] sm:min-w-[760px] px-2 gap-3 sm:gap-4">
          {scenes.map((scene, index) => {
            const sceneNum = scene.scene_number || scene.number || (index + 1);
            const sceneTitle = scene.scene_title || scene.title || `Scene ${sceneNum}`;
            const sceneDuration = scene.estimated_duration || scene.duration || '60 seconds';
            const sceneObjective = scene.objective || scene.summary || scene.script || '';
            const isSelected = selectedSceneId === (scene.id || sceneNum);
            const isCurrent = scene.status === 'rendering' || isSelected;

            return (
              <div
                key={scene.id || sceneNum}
                onClick={() => onSelectScene({ ...scene, id: scene.id || sceneNum, number: sceneNum, title: sceneTitle, duration: sceneDuration, narration: scene.script || scene.narration, summary: sceneObjective })}
                className={`group relative flex-1 min-w-[125px] sm:min-w-[130px] cursor-pointer rounded-xl p-3 sm:p-3.5 transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-50 dark:bg-zinc-900 border-blue-500 ring-2 ring-blue-500/40 shadow-md -translate-y-1'
                    : isCurrent
                    ? 'bg-slate-50 dark:bg-zinc-900/90 border-blue-400/60 shadow-sm animate-pulse-glow'
                    : 'bg-white dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:-translate-y-0.5'
                }`}
              >
                {/* Node Connector Dot */}
                <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-500 border-white shadow-[0_0_10px_#3b82f6]'
                    : scene.status === 'completed'
                    ? 'bg-emerald-500 border-slate-200 dark:border-zinc-900'
                    : 'bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
                }`}>
                  {scene.status === 'completed' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                {/* Coach Contents */}
                <div className="flex flex-col gap-1.5 sm:gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-zinc-500 font-medium">
                      Scene {sceneNum}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded truncate max-w-[65px]">
                      {sceneDuration}
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                    {sceneTitle}
                  </h4>

                  <div className="mt-0.5 flex items-center justify-between">
                    {getStatusBadge(scene.status || 'ready', scene.progress)}
                  </div>
                </div>

                {/* Hover Quick Tooltip */}
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-lg bg-slate-900 dark:bg-zinc-900 border border-slate-700 text-[11px] text-slate-200 dark:text-zinc-300 shadow-xl pointer-events-none z-30">
                  <div className="font-semibold text-white mb-1">{sceneTitle}</div>
                  <div className="text-slate-300 dark:text-zinc-400 line-clamp-2 text-[10px] leading-relaxed">{sceneObjective}</div>
                  <div className="mt-1.5 pt-1 border-t border-slate-800 text-[9px] font-mono text-blue-400">
                    Click to inspect parameters
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button Below Scene Coaster */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 font-mono">
          <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Total Duration: <strong className="text-slate-900 dark:text-white font-sans">{estimatedDuration || '9 minutes'}</strong></span>
        </div>

        <button
          onClick={onGenerateVideo}
          disabled={isLoading}
          className="w-full sm:w-auto btn-primary py-2.5 px-6 justify-center font-medium text-sm rounded-lg shadow-lg hover:shadow-blue-500/30 group"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          )}
          <span>BUILD THIS SCENES</span>
        </button>
      </div>
    </div>
  );
}
