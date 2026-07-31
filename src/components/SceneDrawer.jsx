import React, { useState, useEffect } from 'react';
import { 
  X, Play, RotateCcw, Trash2, FileCode, Mic, Clock, 
  Check, Copy, Target
} from 'lucide-react';

export default function SceneDrawer({ scene, onClose, onUpdateScene }) {
  if (!scene) return null;

  const sceneTitle = scene.scene_title || scene.title || `Scene ${scene.scene_number || scene.number || 1}`;
  const sceneNum = scene.scene_number || scene.number || 1;
  const sceneDuration = scene.estimated_duration || scene.duration || '60 seconds';
  const sceneObjective = scene.objective || scene.summary || '';
  const initialScript = scene.script || scene.narration || '';

  const defaultPython = scene.pythonCode || `from manim import *\n\nclass Scene${sceneNum}Animation(Scene):\n    def construct(self):\n        title = Text("${sceneTitle}", font_size=36)\n        self.play(Write(title))\n        self.wait(1)`;

  const [narration, setNarration] = useState(initialScript);
  const [pythonCode, setPythonCode] = useState(defaultPython);
  const [copied, setCopied] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    setNarration(scene.script || scene.narration || '');
    setPythonCode(scene.pythonCode || defaultPython);
  }, [scene]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col backdrop-blur-xl transition-all">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-blue font-mono text-[10px]">Scene {sceneNum}</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{sceneDuration}</span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-1 truncate max-w-[240px] sm:max-w-none">{sceneTitle}</h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Objective Banner */}
        {sceneObjective && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-blue-500 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Scene Objective</span>
            </div>
            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">{sceneObjective}</p>
          </div>
        )}

        {/* 1. Scene Preview Window */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-blue-500" />
              <span>Scene Preview</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">1080p Vector</span>
          </div>

          <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex flex-col items-center justify-center group shadow-inner">
            {isPreviewing ? (
              <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-3 relative">
                <div className="w-full max-w-xs h-20 sm:h-24 border border-blue-500/40 rounded-lg flex items-center justify-around p-2 bg-blue-950/10">
                  {[2, 7, 11, 15].map((num, i) => (
                    <div
                      key={i}
                      className={`w-7 sm:w-9 h-8 sm:h-10 rounded border flex items-center justify-center font-mono text-xs ${
                        i < 2 
                          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.3)]' 
                          : 'border-blue-500/50 text-blue-300'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] sm:text-[11px] font-mono text-yellow-400 flex items-center gap-1">
                  <span>Target Sum: 2 + 7 = 9</span>
                </div>
                <button 
                  onClick={() => setIsPreviewing(false)}
                  className="absolute top-2 right-2 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700"
                >
                  Stop
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Play className="w-4 sm:w-5 h-4 sm:h-5 fill-current ml-0.5" />
                </div>
                <p className="text-xs font-medium text-white">Vector Render Preview</p>
                <button 
                  onClick={() => setIsPreviewing(true)}
                  className="mt-2.5 btn-secondary text-xs py-1 px-3"
                >
                  Play Animation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Narration Script */}
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
            <Mic className="w-3.5 h-3.5 text-blue-500" />
            <span>AI Voiceover Narration Script</span>
          </label>
          <textarea
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            rows={4}
            className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-lg p-3 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-sans leading-relaxed resize-none"
            placeholder="Enter spoken narration for this scene..."
          />
        </div>

        {/* 3. Python Code Editor Snippet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-500" />
              <span>Manim Python Code (`.py`)</span>
            </label>
            <button
              onClick={handleCopyCode}
              className="text-[11px] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 flex items-center gap-1 font-mono"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            value={pythonCode}
            onChange={(e) => setPythonCode(e.target.value)}
            rows={6}
            className="w-full bg-slate-900 dark:bg-[#0b0b0e] border border-slate-700 dark:border-zinc-800 rounded-lg p-3 text-xs text-slate-200 dark:text-zinc-300 font-mono focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
          />
        </div>

        {/* 4. Duration Info */}
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span>Duration:</span>
          </span>
          <span className="text-slate-900 dark:text-white font-semibold">{sceneDuration}</span>
        </div>
      </div>

      {/* Drawer Actions */}
      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 flex items-center justify-between gap-2">
        <button
          onClick={() => setIsPreviewing(true)}
          className="btn-secondary text-xs py-2 px-3"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateScene(scene.id || sceneNum, { pythonCode, narration, script: narration })}
            className="btn-secondary text-xs py-2 px-3 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Save Code</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
