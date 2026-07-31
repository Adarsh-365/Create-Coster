// ─────────────────────────────────────────────────────────────────────────────
// MANIM STUDIO — Professional SaaS Types
// ─────────────────────────────────────────────────────────────────────────────

export type SceneStatus = 'rendered' | 'rendering' | 'pending' | 'failed' | 'queued';

export type GenerationPhase =
  | 'idle'
  | 'planning'
  | 'breakdown'
  | 'codegen'
  | 'rendering'
  | 'done'
  | 'error';

export interface ManimScene {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;        // "45s"
  durationSeconds: number; // 45
  status: SceneStatus;
  filename: string;        // "scene_01.py"
  renderProgress: number;  // 0-100
  script: string;          // voiceover narration
  code: string;            // Manim Python code
  consoleLogs?: string[];  // Build stdout/stderr
  errorMessage?: string;
}

export interface ProjectSettings {
  resolution: '1080p' | '4K' | '720p';
  fps: 30 | 60;
  qualityFlag: '-ql' | '-qm' | '-qh' | '-qk';
  aspectRatio: '16:9' | '9:16' | '1:1';
  backgroundColor: string;
  voiceModel: string;
}

export interface Project {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
  totalDuration: string;
  totalScenes: number;
  generationPhase: GenerationPhase;
  settings: ProjectSettings;
  scenes: ManimScene[];
}

export interface SettingsState {
  theme: 'dark';
  fontSize: 'sm' | 'base';
  autoSave: boolean;
  notifications: boolean;
  renderEngine: 'Manim Community v0.18.0' | 'ManimGL v1.6';
  apiKeys: {
    openai: string;
    anthropic: string;
    gemini: string;
  };
}
