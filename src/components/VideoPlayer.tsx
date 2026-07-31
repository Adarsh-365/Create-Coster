import { useState, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Film,
  CheckCircle2, Loader2, Wand2
} from 'lucide-react';
import type { ManimScene, Project } from './Types';

interface VideoPlayerProps {
  project: Project;
  activeScene: ManimScene | null;
  activeSceneIdx: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevScene: () => void;
  onNextScene: () => void;
  onPromptSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export default function VideoPlayer({
  project,
  activeScene,
  activeSceneIdx,
  isPlaying,
  onPlayPause,
  onPrevScene,
  onNextScene,
  onPromptSubmit,
  isGenerating,
}: VideoPlayerProps) {
  const [promptText, setPromptText] = useState(project.prompt || '');
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '1.5x' | '2.0x'>('1.0x');

  const containerRef = useRef<HTMLDivElement>(null);

  const totalDurationSeconds = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const currentElapsedSeconds = project.scenes.slice(0, activeSceneIdx).reduce((acc, s) => acc + s.durationSeconds, 0);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (promptText.trim() && !isGenerating) {
        onPromptSubmit(promptText.trim());
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-hidden relative">

      {/* Top Bar: Prompt Bar & Breadcrumbs */}
      <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-950 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium truncate">
            <span className="text-zinc-200 font-semibold truncate">{project.title}</span>
            <span>/</span>
            <span className="text-zinc-400">Scene {activeScene ? String(activeScene.number).padStart(2, '0') : '01'}</span>
            <span className="text-zinc-600">·</span>
            <span className="font-mono text-[11px] text-zinc-500">{project.settings.resolution} @ {project.settings.fps}fps</span>
          </div>

          <div className="flex items-center gap-2">
            {project.generationPhase === 'rendering' && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
                <Loader2 size={11} className="animate-spin" />
                Rendering in progress...
              </span>
            )}
            {project.generationPhase === 'done' && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <CheckCircle2 size={11} />
                Render Complete
              </span>
            )}
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            onKeyDown={handlePromptKeyDown}
            placeholder="Describe visual concept or update Manim scene prompt..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-3 pr-24 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-medium"
            disabled={isGenerating}
          />
          <button
            onClick={() => promptText.trim() && !isGenerating && onPromptSubmit(promptText.trim())}
            disabled={!promptText.trim() || isGenerating}
            className="absolute right-1.5 flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            Generate
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas Center (60% width target aspect) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 bg-zinc-950/60 relative overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full max-w-4xl aspect-video rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between group"
        >
          {/* Render Frame Canvas Placeholder */}
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center">
            {/* Grid graphic inside preview */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

            {activeScene ? (
              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                <span className="font-mono text-5xl font-extrabold text-zinc-800/80 mb-2 select-none">
                  SCENE {String(activeScene.number).padStart(2, '0')}
                </span>
                <p className="text-sm font-semibold text-zinc-200 max-w-md">{activeScene.title}</p>
                <p className="text-xs text-zinc-500 max-w-md mt-1 italic font-mono">"{activeScene.description}"</p>

                {/* Animated progress indicator if playing or rendering */}
                {isPlaying && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded bg-zinc-800/80 border border-zinc-700 text-xs text-blue-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    PLAYING FRAME {(activeSceneIdx + 1) * 60} / {activeScene.durationSeconds * 60}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <Film size={32} className="text-zinc-700 mb-2" />
                <p className="text-xs font-semibold text-zinc-500">No active scene selected</p>
              </div>
            )}

            {/* Video overlay watermark */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 select-none">
              MANIM COMMUNITY v0.18.0 · {project.settings.resolution}
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 select-none">
              {activeScene ? activeScene.filename : 'scene.py'}
            </div>
          </div>

          {/* Central Overlay Play Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onPlayPause}
              className="w-14 h-14 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-100 flex items-center justify-center shadow-lg pointer-events-auto hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          </div>

          {/* Bottom Player Controls Bar */}
          <div className="relative z-20 mt-auto px-4 py-2.5 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between gap-3 text-xs text-zinc-300">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onPrevScene}
                disabled={activeSceneIdx === 0}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 transition-colors"
                title="Previous Scene"
              >
                <SkipBack size={14} />
              </button>

              <button
                onClick={onPlayPause}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <button
                onClick={onNextScene}
                disabled={activeSceneIdx === project.scenes.length - 1}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 transition-colors"
                title="Next Scene"
              >
                <SkipForward size={14} />
              </button>

              {/* Timecode display */}
              <div className="ml-2 font-mono text-xs text-zinc-400 flex items-center gap-1">
                <span className="text-zinc-200">{formatSeconds(currentElapsedSeconds)}</span>
                <span>/</span>
                <span>{formatSeconds(totalDurationSeconds)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Playback speed picker */}
              <button
                onClick={() => {
                  const speeds: Array<'1.0x' | '1.5x' | '2.0x'> = ['1.0x', '1.5x', '2.0x'];
                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIdx]);
                }}
                className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                {playbackSpeed}
              </button>

              {/* Mute toggle */}
              <button
                onClick={() => setIsMuted(prev => !prev)}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              {/* Resolution tag */}
              <span className="px-2 py-0.5 rounded border border-zinc-700 text-[10px] font-mono text-zinc-400">
                1080p60
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
