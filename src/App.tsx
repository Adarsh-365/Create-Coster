import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import StoryboardTimeline from './components/StoryboardTimeline';
import UtilityPanel from './components/UtilityPanel';
import SettingsModal from './components/SettingsModal';
import SearchModal from './components/SearchModal';
import type { Project, ManimScene, ProjectSettings, SettingsState } from './components/Types';
import { MOCK_PROJECTS, simulateProjectGeneration } from './components/MockData';

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'dark',
  fontSize: 'base',
  language: 'English',
  autoSave: true,
  notifications: true,
  streaming: true,
  memoryEnabled: true,
  historyEnabled: true,
  renderEngine: 'Manim Community v0.18.0',
  apiKeys: {
    openai: '',
    anthropic: '',
    gemini: '',
    deepseek: '',
  }
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>('proj-1');
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;
  const activeScene = activeProject?.scenes[activeSceneIdx] || null;

  // Auto-play timer loop across scenes
  useEffect(() => {
    let timer: number;
    if (isPlaying && activeProject && activeProject.scenes.length > 0) {
      const currentScene = activeProject.scenes[activeSceneIdx];
      const durationMs = Math.max(2500, (currentScene?.durationSeconds || 10) * 100);

      timer = window.setTimeout(() => {
        if (activeSceneIdx < activeProject.scenes.length - 1) {
          setActiveSceneIdx(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setActiveSceneIdx(0);
        }
      }, durationMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeSceneIdx, activeProject]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open settings: Ctrl + ,
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(prev => !prev);
      }
      // Open Search: Ctrl + K
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      // New Project: Ctrl + N
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNewProject();
      }
      // Space to toggle play/pause ride
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProjectId]);

  const handleSelectProject = (projId: string) => {
    setActiveProjectId(projId);
    setActiveSceneIdx(0);
    setIsPlaying(false);
  };

  const handleNewProject = () => {
    const newProjId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: newProjId,
      title: 'Untitled Manim Project',
      prompt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalDuration: '00:00',
      totalScenes: 0,
      generationPhase: 'idle',
      settings: {
        resolution: '1080p',
        fps: 60,
        qualityFlag: '-qh',
        aspectRatio: '16:9',
        backgroundColor: '#09090b',
        voiceModel: 'en-US-Neural2-F',
      },
      scenes: []
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProjId);
    setActiveSceneIdx(0);
    setIsPlaying(false);
  };

  const handlePromptSubmit = async (promptText: string) => {
    if (!activeProject) return;

    setIsGenerating(true);
    setIsPlaying(false);

    const updatedTitle = promptText.length > 36 ? promptText.substring(0, 36) + '...' : promptText;
    setProjects(prev => prev.map(p => p.id === activeProject.id ? {
      ...p,
      title: updatedTitle,
      prompt: promptText,
      updatedAt: new Date().toISOString(),
      generationPhase: 'planning'
    } : p));

    try {
      await simulateProjectGeneration(
        promptText,
        (phase) => {
          setProjects(prev => prev.map(p => p.id === activeProject.id ? {
            ...p,
            generationPhase: phase as Project['generationPhase']
          } : p));
        },
        (generatedScenes: ManimScene[]) => {
          const totalSecs = generatedScenes.reduce((acc, s) => acc + s.durationSeconds, 0);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          const formattedDuration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

          setProjects(prev => prev.map(p => p.id === activeProject.id ? {
            ...p,
            scenes: generatedScenes,
            totalScenes: generatedScenes.length,
            totalDuration: formattedDuration,
            generationPhase: 'done'
          } : p));
          setActiveSceneIdx(0);
        }
      );
    } catch (err) {
      setProjects(prev => prev.map(p => p.id === activeProject.id ? {
        ...p,
        generationPhase: 'error'
      } : p));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectScene = (idx: number) => {
    setActiveSceneIdx(idx);
  };

  const handlePrevScene = () => {
    setIsPlaying(false);
    if (activeSceneIdx > 0) {
      setActiveSceneIdx(prev => prev - 1);
    }
  };

  const handleNextScene = () => {
    setIsPlaying(false);
    if (activeProject && activeSceneIdx < activeProject.scenes.length - 1) {
      setActiveSceneIdx(prev => prev + 1);
    }
  };

  const handleUpdateCode = (newCode: string) => {
    if (!activeProject || !activeScene) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          scenes: p.scenes.map((s, idx) => idx === activeSceneIdx ? { ...s, code: newCode } : s)
        };
      }
      return p;
    }));
  };

  const handleUpdateScript = (newScript: string) => {
    if (!activeProject || !activeScene) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          scenes: p.scenes.map((s, idx) => idx === activeSceneIdx ? { ...s, script: newScript } : s)
        };
      }
      return p;
    }));
  };

  const handleUpdateSettings = (newSettings: Partial<ProjectSettings>) => {
    if (!activeProject) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          settings: { ...p.settings, ...newSettings }
        };
      }
      return p;
    }));
  };

  const handleReRenderScene = (idx: number) => {
    if (!activeProject) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          scenes: p.scenes.map((s, i) => i === idx ? {
            ...s,
            status: 'rendering',
            renderProgress: 45
          } : s)
        };
      }
      return p;
    }));

    setTimeout(() => {
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            scenes: p.scenes.map((s, i) => i === idx ? {
              ...s,
              status: 'rendered',
              renderProgress: 100
            } : s)
          };
        }
        return p;
      }));
    }, 2000);
  };

  return (
    <div className="w-full h-full flex overflow-hidden bg-zinc-950 text-zinc-100 font-sans select-none">

      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Central Main Workspace Column */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">

        {/* Video Canvas Preview Center */}
        {activeProject && (
          <VideoPlayer
            project={activeProject}
            activeScene={activeScene}
            activeSceneIdx={activeSceneIdx}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(prev => !prev)}
            onPrevScene={handlePrevScene}
            onNextScene={handleNextScene}
            onPromptSubmit={handlePromptSubmit}
            isGenerating={isGenerating}
          />
        )}

        {/* Bottom Storyboard Timeline */}
        {activeProject && activeProject.scenes.length > 0 && (
          <StoryboardTimeline
            scenes={activeProject.scenes}
            activeIdx={activeSceneIdx}
            onSelectScene={handleSelectScene}
            onReRenderScene={handleReRenderScene}
          />
        )}
      </main>

      {/* 3. Right Utility Panel */}
      {activeProject && (
        <UtilityPanel
          scene={activeScene}
          settings={activeProject.settings}
          onUpdateCode={handleUpdateCode}
          onUpdateScript={handleUpdateScript}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={globalSettings as any}
        onSaveSettings={(s) => setGlobalSettings(s as any)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
