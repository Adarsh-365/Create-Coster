import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, RotateCcw, Clock, FileCode2, CheckCircle2,
  Loader2, AlertCircle, Circle, Zap, Copy, Pencil,
  Volume2, Trash2, Layers, ChevronRight, Download,
  Wand2, RefreshCw, MessageSquare, Code2, Settings2
} from 'lucide-react';
import type { ManimScene, SceneStatus } from './Types';

interface SceneDetailPanelProps {
  scene: ManimScene | null;
  onClose: () => void;
}

type PanelTab = 'preview' | 'script' | 'code' | 'actions';

const STATUS_META: Record<SceneStatus, { color: string; icon: React.ReactNode; label: string }> = {
  rendered:  { color: 'text-green-400', icon: <CheckCircle2 size={14} className="text-green-400" />, label: 'Rendered' },
  rendering: { color: 'text-cyan-400',  icon: <Loader2     size={14} className="text-cyan-400 spinner" />, label: 'Rendering' },
  queued:    { color: 'text-amber-400', icon: <Zap         size={14} className="text-amber-400" />, label: 'Queued' },
  pending:   { color: 'text-slate-500', icon: <Circle      size={14} className="text-slate-600" />, label: 'Pending' },
  failed:    { color: 'text-red-400',   icon: <AlertCircle size={14} className="text-red-400" />, label: 'Failed' },
};

// ── Render Progress Ring ──────────────────────────────────────────────────────
function RenderRing({ progress, status }: { progress: number; status: SceneStatus }) {
  const R = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ - (progress / 100) * circ;

  const ringColor =
    status === 'rendered'  ? '#10b981' :
    status === 'rendering' ? '#22d3ee' :
    status === 'failed'    ? '#ef4444' :
    status === 'queued'    ? '#f59e0b' : '#475569';

  return (
    <svg width={100} height={100} className="rotate-[-90deg]">
      <circle cx={50} cy={50} r={R} fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth={6} />
      <motion.circle
        cx={50} cy={50} r={R}
        fill="none"
        stroke={ringColor}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }}
      />
    </svg>
  );
}

// ── Syntax Highlighted Code ───────────────────────────────────────────────────
function CodeView({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple keyword highlight
  const highlight = (line: string, i: number) => {
    const keywords = /\b(from|import|class|def|self|return|for|if|else|in|not|and|or|True|False|None)\b/g;
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
    const comments = /(#.*)$/;
    const numbers = /\b(\d+\.?\d*)\b/g;

    let html = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // comments first (full line takes priority)
    html = html.replace(comments, '<span class="cm">$1</span>');
    if (!html.includes('<span class="cm">')) {
      html = html
        .replace(strings, '<span class="str">$1$2$3</span>')
        .replace(numbers, '<span class="num">$1</span>')
        .replace(keywords, '<span class="kw">$1</span>');
    }

    return (
      <div key={i} className="flex gap-3 hover:bg-blue-500/3 rounded px-1 -mx-1">
        <span className="text-slate-700 select-none text-right w-7 shrink-0">{i + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  };

  const lines = code.split('\n');

  return (
    <div className="relative code-block text-xs leading-relaxed overflow-auto max-h-64 flex-1">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] hover:text-white hover:border-blue-500/40 transition-all z-10"
      >
        <Copy size={10} />
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="font-mono">{lines.map(highlight)}</pre>
    </div>
  );
}

// ── Waveform animation ────────────────────────────────────────────────────────
function Waveform() {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[1,2,3,4,5,6,7].map(i => (
        <span
          key={i}
          className="wave-bar block w-0.5 rounded-full bg-blue-400"
          style={{ height: `${Math.random() * 12 + 4}px`, animationDelay: `${i * 0.07}s` }}
        />
      ))}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function SceneDetailPanel({ scene, onClose }: SceneDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('preview');
  const [ttsActive, setTtsActive] = useState(false);
  const [modifyPrompt, setModifyPrompt] = useState('');

  if (!scene) return null;

  const meta = STATUS_META[scene.status];

  const TABS: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
    { id: 'preview', label: 'Preview',  icon: <Play size={13} /> },
    { id: 'script',  label: 'Script',   icon: <MessageSquare size={13} /> },
    { id: 'code',    label: 'Code',     icon: <Code2 size={13} /> },
    { id: 'actions', label: 'Actions',  icon: <Settings2 size={13} /> },
  ];

  return (
    <motion.aside
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-96 shrink-0 h-full flex flex-col glass border-l border-[var(--border)] overflow-hidden relative z-10"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/4 blur-3xl pointer-events-none rounded-full" />

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-black bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/20">
                SCENE {String(scene.number).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1.5">
                {meta.icon}
                <span className={`text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
              </div>
            </div>
            <h2 className="text-sm font-black text-white leading-snug">{scene.title}</h2>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{scene.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800/60 transition-all shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Metadata chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900/60 border border-[var(--border)] px-2 py-1 rounded-lg font-medium">
            <Clock size={9} />{scene.duration}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900/60 border border-[var(--border)] px-2 py-1 rounded-lg font-mono">
            <FileCode2 size={9} />{scene.filename}
          </span>
          {scene.renderProgress > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-900/60 border border-[var(--border)] px-2 py-1 rounded-lg" style={{ color: meta.color.replace('text-', '') }}>
              {scene.renderProgress}%
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0.5 px-4 pt-3 pb-0 shrink-0 border-b border-[var(--border)]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-t-lg transition-all border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-300 border-blue-500 bg-blue-500/5'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="p-4 flex flex-col gap-4 h-full"
          >
            {/* ── PREVIEW TAB ── */}
            {activeTab === 'preview' && (
              <>
                {/* Video thumbnail */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900/80 border border-[var(--border)] group">
                  {/* Gradient placeholder */}
                  <div className={`absolute inset-0 ${
                    scene.status === 'rendered'
                      ? 'bg-gradient-to-br from-blue-900/60 via-violet-900/40 to-slate-900/60'
                      : scene.status === 'rendering'
                      ? 'bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-slate-900/60'
                      : 'bg-gradient-to-br from-slate-900 to-slate-800'
                  }`} />

                  {/* Animated grid in preview */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />

                  {/* Scene label watermark */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="font-mono text-4xl font-black text-white/10">S{String(scene.number).padStart(2, '0')}</span>
                    <p className="text-xs text-slate-500 font-medium text-center px-4">{scene.title}</p>
                  </div>

                  {/* Play button overlay */}
                  {scene.status === 'rendered' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-14 h-14 rounded-full bg-blue-600/80 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:bg-blue-600 transition-colors"
                      >
                        <Play size={20} className="text-white ml-1" fill="white" />
                      </motion.button>
                    </div>
                  )}

                  {/* Rendering indicator */}
                  {scene.status === 'rendering' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Loader2 size={28} className="text-cyan-400 spinner" />
                      <p className="text-xs text-cyan-400 font-bold">Rendering... {scene.renderProgress}%</p>
                    </div>
                  )}

                  {/* Failed state */}
                  {scene.status === 'failed' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={24} className="text-red-400" />
                      <p className="text-xs text-red-400 font-bold text-center px-4">{scene.errorMessage || 'Render failed'}</p>
                    </div>
                  )}
                </div>

                {/* Render progress ring + info */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <RenderRing progress={scene.renderProgress} status={scene.status} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-sm font-black text-white">{scene.renderProgress}%</span>
                      <span className="text-[9px] text-slate-500 font-medium">render</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">Render Status</span>
                      <div className="flex items-center gap-1">
                        {meta.icon}
                        <span className={`text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Duration</span><span className="font-mono text-slate-300">{scene.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>File</span><span className="font-mono text-slate-300">{scene.filename}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-1">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold hover:bg-blue-600/20 transition-all">
                        <RotateCcw size={10} />
                        Re-render
                      </button>
                      {scene.status === 'rendered' && (
                        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600/10 border border-green-500/20 text-green-400 text-[10px] font-bold hover:bg-green-600/20 transition-all">
                          <Download size={10} />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── SCRIPT TAB ── */}
            {activeTab === 'script' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Voice Narration</span>
                  <button
                    onClick={() => setTtsActive(p => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      ttsActive
                        ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300'
                        : 'bg-slate-900/60 border border-[var(--border)] text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Volume2 size={11} className={ttsActive ? 'animate-pulse' : ''} />
                    {ttsActive ? <Waveform /> : 'Play TTS'}
                  </button>
                </div>

                <div className="flex-1 relative">
                  <textarea
                    defaultValue={scene.script}
                    rows={10}
                    className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl p-4 text-sm text-slate-300 leading-relaxed resize-none outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-600 italic"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800/60 border border-[var(--border)] text-slate-400 text-xs font-bold hover:text-white hover:border-slate-600 transition-all">
                    <Wand2 size={12} />
                    Regenerate Script
                  </button>
                  <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/60 border border-[var(--border)] text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                    <Copy size={13} />
                  </button>
                </div>

                {/* Word count */}
                <p className="text-[10px] text-slate-600 text-right">
                  {scene.script.split(' ').length} words · ~{Math.ceil(scene.script.split(' ').length / 140)} min read
                </p>
              </>
            )}

            {/* ── CODE TAB ── */}
            {activeTab === 'code' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Manim Python</span>
                    <span className="font-mono text-[9px] text-slate-600 bg-slate-900 border border-[var(--border)] px-1.5 py-0.5 rounded">
                      {scene.code.split('\n').length} lines
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/60 border border-[var(--border)] text-slate-500 text-[10px] font-bold hover:text-white transition-all">
                      <Pencil size={10} />
                      Edit
                    </button>
                  </div>
                </div>

                <CodeView code={scene.code} />

                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-600/20 transition-all">
                    <RotateCcw size={12} />
                    Re-render Scene
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800/60 border border-[var(--border)] text-slate-400 text-xs font-bold hover:text-white transition-all">
                    <Download size={12} />
                    Download .py
                  </button>
                </div>
              </>
            )}

            {/* ── ACTIONS TAB ── */}
            {activeTab === 'actions' && (
              <>
                {/* Modify Prompt */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modify Scene Prompt</label>
                  <textarea
                    value={modifyPrompt}
                    onChange={e => setModifyPrompt(e.target.value)}
                    placeholder={`Adjust: "${scene.title}"…`}
                    rows={4}
                    className="w-full bg-[var(--bg-card-alt)] border border-[var(--border)] rounded-xl p-3 text-sm text-slate-300 leading-relaxed resize-none outline-none focus:border-blue-500/40 transition-all placeholder-slate-600"
                  />
                  <button className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl">
                    <Wand2 size={14} />
                    Regenerate Scene
                  </button>
                </div>

                <div className="h-px bg-[var(--border)]" />

                {/* Quick Actions */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Actions</p>

                  <button className="sidebar-item justify-between group">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={14} />
                      Regenerate (same prompt)
                    </div>
                    <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-400" />
                  </button>

                  <button className="sidebar-item justify-between group">
                    <div className="flex items-center gap-2">
                      <Layers size={14} />
                      Duplicate Scene
                    </div>
                    <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-400" />
                  </button>

                  <button className="sidebar-item justify-between group">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={14} />
                      Re-render Scene
                    </div>
                    <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-400" />
                  </button>

                  <button className="sidebar-item justify-between group">
                    <div className="flex items-center gap-2">
                      <Download size={14} />
                      Export as MP4
                    </div>
                    <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-400" />
                  </button>

                  <div className="h-px bg-[var(--border)] my-1" />

                  <button className="sidebar-item justify-between group text-red-500 hover:bg-red-500/8 hover:border-red-500/15">
                    <div className="flex items-center gap-2">
                      <Trash2 size={14} />
                      Delete Scene
                    </div>
                    <ChevronRight size={12} className="opacity-50" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
