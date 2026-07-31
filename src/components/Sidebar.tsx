import { useState } from 'react';
import {
  Plus, Film, FolderOpen, Settings, PanelLeftClose, PanelLeftOpen,
  Search, CheckCircle2, Loader2, AlertCircle, Circle, Video,
  BookMarked, Sparkles, ChevronRight
} from 'lucide-react';
import type { Project, GenerationPhase } from './Types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
}

const statusDot = (phase: GenerationPhase) => {
  if (phase === 'done') return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />;
  if (phase === 'error') return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />;
  if (phase === 'rendering' || phase === 'codegen' || phase === 'planning' || phase === 'breakdown') {
    return <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />;
  }
  return <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />;
};

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onOpenSettings,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`h-full bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-all duration-200 shrink-0 select-none z-20 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header: Logo & Collapse toggle */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-xs">
              M
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              Manim Studio
            </span>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className={`p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* New Project CTA Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={onNewProject}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white transition-colors shadow-xs ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="New Project"
        >
          <Plus size={15} />
          {!isCollapsed && <span>New Project</span>}
        </button>
      </div>

      {/* Navigation Links */}
      {!isCollapsed && (
        <div className="px-3 py-1 flex flex-col gap-0.5 text-xs font-medium text-zinc-400 shrink-0">
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-100 border border-zinc-800/60">
            <Film size={14} className="text-zinc-300" />
            Projects
            <span className="ml-auto text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              {projects.length}
            </span>
          </button>
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors">
            <BookMarked size={14} />
            Templates
          </button>
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors">
            <Sparkles size={14} />
            AI Presets
          </button>
        </div>
      )}

      {!isCollapsed && <div className="h-px bg-zinc-800/80 mx-3 my-2" />}

      {/* Search Input */}
      {!isCollapsed && (
        <div className="px-3 pb-2 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>
      )}

      {/* Project History List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-0.5">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <FolderOpen size={11} />
            Project History
          </div>
        )}

        {filteredProjects.map((proj) => {
          const isActive = proj.id === activeProjectId;

          if (isCollapsed) {
            return (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-colors relative group ${
                  isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
                title={proj.title}
              >
                <Video size={16} />
                <span className="absolute top-1 right-1">
                  {statusDot(proj.generationPhase)}
                </span>
              </button>
            );
          }

          return (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all flex items-start gap-2.5 group ${
                isActive
                  ? 'bg-zinc-900 border-zinc-700/80 text-zinc-100 shadow-xs'
                  : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <div className="mt-1">{statusDot(proj.generationPhase)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
                  {proj.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono">
                  <span>{proj.totalScenes} scenes</span>
                  <span>·</span>
                  <span>{formatTimeAgo(proj.updatedAt)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Profile & Settings */}
      <div className="p-2.5 border-t border-zinc-800/80 shrink-0 flex flex-col gap-1">
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Settings"
        >
          <Settings size={15} />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-md bg-zinc-900/60 border border-zinc-800/60">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200 shrink-0">
              DEV
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate leading-tight">Pro Account</p>
              <p className="text-[10px] text-zinc-500 truncate">v0.18 Community</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
