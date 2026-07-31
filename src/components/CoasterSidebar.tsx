import { useState } from 'react';
import {
  Plus, Film, BookMarked, LayoutTemplate, Settings,
  User, ChevronRight, Zap, Clock, CheckCircle2,
  AlertCircle, Loader2, Circle, Star, FolderOpen,
  TrendingUp, ChevronDown
} from 'lucide-react';
import type { Project, GenerationPhase } from './Types';
import { motion, AnimatePresence } from 'framer-motion';

interface CoasterSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
}

const phaseColor: Record<GenerationPhase, string> = {
  idle:      'text-slate-500',
  planning:  'text-blue-400',
  breakdown: 'text-blue-400',
  codegen:   'text-cyan-400',
  rendering: 'text-cyan-400',
  done:      'text-green-400',
  error:     'text-red-400',
};

const phaseIcon = (phase: GenerationPhase, size = 10) => {
  if (phase === 'done') return <CheckCircle2 size={size} className="text-green-400" />;
  if (phase === 'error') return <AlertCircle size={size} className="text-red-400" />;
  if (phase === 'rendering' || phase === 'codegen' || phase === 'planning' || phase === 'breakdown') {
    return <Loader2 size={size} className="text-cyan-400 spinner" />;
  }
  return <Circle size={size} className="text-slate-600" />;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const TEMPLATES = [
  { icon: '🔢', label: 'Algorithm Explainer' },
  { icon: '📊', label: 'Data Structures' },
  { icon: '🧮', label: 'Math Proof' },
  { icon: '🌐', label: 'Network Protocol' },
  { icon: '🤖', label: 'ML Concept' },
];

export default function CoasterSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onOpenSettings,
}: CoasterSidebarProps) {
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [templatesExpanded, setTemplatesExpanded] = useState(false);

  return (
    <aside className="w-60 shrink-0 h-full flex flex-col glass border-r border-[var(--border)] overflow-hidden relative z-10">
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

      {/* ── Logo ── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5 border-b border-[var(--border)] shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
          <span className="text-base leading-none">🎢</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-black text-sm text-white tracking-tight">ManimCoaster</span>
          <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">AI Video Studio</span>
        </div>
      </div>

      {/* ── New Project Button ── */}
      <div className="px-3 pt-4 pb-2 shrink-0">
        <button
          onClick={onNewProject}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm rounded-xl"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">

        {/* ── Nav Items ── */}
        <div className="mt-2 flex flex-col gap-0.5">
          <button className="sidebar-item active">
            <Film size={15} />
            My Projects
            <span className="ml-auto text-[10px] font-bold bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded-full">
              {projects.length}
            </span>
          </button>
          <button className="sidebar-item">
            <BookMarked size={15} />
            Saved Animations
          </button>
          <button className="sidebar-item">
            <Star size={15} />
            Favorites
          </button>
          <button className="sidebar-item">
            <TrendingUp size={15} />
            Analytics
          </button>
        </div>

        <div className="h-px bg-[var(--border)] my-2" />

        {/* ── Project History ── */}
        <button
          onClick={() => setHistoryExpanded(p => !p)}
          className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors w-full"
        >
          <FolderOpen size={11} />
          Project History
          <ChevronDown size={11} className={`ml-auto transition-transform ${historyExpanded ? 'rotate-0' : '-rotate-90'}`} />
        </button>

        <AnimatePresence initial={false}>
          {historyExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden flex flex-col gap-0.5"
            >
              {projects.map((proj, i) => {
                const isActive = proj.id === activeProjectId;
                return (
                  <motion.button
                    key={proj.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => onSelectProject(proj.id)}
                    className={`w-full text-left px-2.5 py-2.5 rounded-xl border transition-all group ${
                      isActive
                        ? 'bg-blue-600/10 border-blue-500/25 text-white'
                        : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 hover:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">{phaseIcon(proj.generationPhase)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold leading-snug truncate">{proj.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-medium ${phaseColor[proj.generationPhase]}`}>
                            {proj.generationPhase === 'done' ? 'Complete' :
                             proj.generationPhase === 'error' ? 'Failed' :
                             proj.generationPhase === 'rendering' ? 'Rendering...' :
                             proj.generationPhase === 'idle' ? 'Draft' : 'Generating...'}
                          </span>
                          <span className="text-slate-700 text-[10px]">·</span>
                          <span className="text-[10px] text-slate-600">{timeAgo(proj.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                            <Film size={8} />{proj.totalScenes} scenes
                          </span>
                          <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                            <Clock size={8} />{proj.totalDuration}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={12} className={`shrink-0 mt-1 transition-opacity ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`} />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-px bg-[var(--border)] my-2" />

        {/* ── Templates ── */}
        <button
          onClick={() => setTemplatesExpanded(p => !p)}
          className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors w-full"
        >
          <LayoutTemplate size={11} />
          Templates
          <ChevronDown size={11} className={`ml-auto transition-transform ${templatesExpanded ? 'rotate-0' : '-rotate-90'}`} />
        </button>

        <AnimatePresence initial={false}>
          {templatesExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden flex flex-col gap-0.5"
            >
              {TEMPLATES.map((t, i) => (
                <motion.button
                  key={t.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="sidebar-item text-left"
                >
                  <span className="text-sm">{t.icon}</span>
                  <span className="text-xs">{t.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 pt-2 border-t border-[var(--border)] flex flex-col gap-1 shrink-0">
        <button
          onClick={onOpenSettings}
          className="sidebar-item"
        >
          <Settings size={15} />
          Settings
          <span className="ml-auto text-[10px] text-slate-600">⌘,</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 mt-1 rounded-xl bg-slate-900/50 border border-[var(--border)] hover:border-blue-500/20 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
            <User size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">Developer</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap size={9} className="text-amber-400" />
              <span className="text-[10px] text-amber-400 font-semibold">Pro Plan</span>
            </div>
          </div>
          <ChevronRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
