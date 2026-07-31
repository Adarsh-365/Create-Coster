import { useState } from 'react';
import {
  Code2, Terminal, MessageSquare, Settings2, Copy, Check,
  Download, Sparkles, X
} from 'lucide-react';
import type { ManimScene, ProjectSettings } from './Types';

interface UtilityPanelProps {
  scene: ManimScene | null;
  settings: ProjectSettings;
  onUpdateCode: (code: string) => void;
  onUpdateScript: (script: string) => void;
  onUpdateSettings: (newSettings: Partial<ProjectSettings>) => void;
  onClose?: () => void;
}

type TabType = 'code' | 'console' | 'script' | 'settings';

export default function UtilityPanel({
  scene,
  settings,
  onUpdateCode: _onUpdateCode,
  onUpdateScript,
  onUpdateSettings,
  onClose,
}: UtilityPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [, setIsConsoleLive] = useState(true);

  if (!scene) {
    return (
      <aside className="w-80 h-full bg-zinc-950 border-l border-zinc-800/80 p-4 flex flex-col justify-center items-center text-center text-zinc-500 text-xs">
        Select a scene from the timeline to edit code or view console logs.
      </aside>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scene.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const renderSyntaxHighlightedLines = (codeStr: string) => {
    const keywords = /\b(from|import|class|def|self|return|for|if|else|in|not|and|or|True|False|None)\b/g;
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
    const comments = /(#.*)$/;
    const numbers = /\b(\d+\.?\d*)\b/g;

    return codeStr.split('\n').map((line, i) => {
      let html = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      html = html.replace(comments, '<span class="cm">$1</span>');
      if (!html.includes('<span class="cm">')) {
        html = html
          .replace(strings, '<span class="str">$1$2$3</span>')
          .replace(numbers, '<span class="num">$1</span>')
          .replace(keywords, '<span class="kw">$1</span>');
      }

      return (
        <div key={i} className="flex gap-3 hover:bg-zinc-900/60 px-2 -mx-2 rounded">
          <span className="text-zinc-600 select-none text-right w-6 shrink-0">{i + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    });
  };

  return (
    <aside className="w-96 shrink-0 h-full bg-zinc-950 border-l border-zinc-800/80 flex flex-col overflow-hidden select-none z-10">

      {/* Header with Scene metadata */}
      <div className="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
            S{String(scene.number).padStart(2, '0')}
          </span>
          <span className="text-xs font-semibold text-zinc-200 truncate">{scene.filename}</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-0 border-b border-zinc-800/80 shrink-0 text-xs font-medium text-zinc-400 bg-zinc-950">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'text-zinc-100 border-zinc-100 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Code2 size={13} /> Python (.py)
        </button>

        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'console'
              ? 'text-zinc-100 border-zinc-100 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Terminal size={13} /> Console
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'script'
              ? 'text-zinc-100 border-zinc-100 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <MessageSquare size={13} /> Script
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'text-zinc-100 border-zinc-100 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Settings2 size={13} /> Config
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* TAB 1: PYTHON CODE EDITOR */}
        {activeTab === 'code' && (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px] text-zinc-500">
                {scene.code.split('\n').length} lines · Manim Python
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] hover:text-zinc-200 transition-colors"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="code-editor flex-1 rounded-lg border border-zinc-800 p-3 overflow-auto text-zinc-200 leading-relaxed font-mono text-xs">
              {renderSyntaxHighlightedLines(scene.code)}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
              <button className="flex-1 py-1.5 rounded-md bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition-colors">
                Apply & Compile
              </button>
              <button className="p-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors" title="Download .py">
                <Download size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CONSOLE LOG OUTPUT */}
        {activeTab === 'console' && (
          <div className="flex flex-col gap-3 h-full font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Build Logs
              </span>
              <button
                onClick={() => setIsConsoleLive(p => !p)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                Clear Output
              </button>
            </div>

            <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 overflow-y-auto flex flex-col gap-1.5 text-[11px]">
              {(scene.consoleLogs || []).map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes('[SUCCESS]') ? 'text-emerald-400 font-semibold' :
                    log.includes('[ERROR]') || log.includes('Failed') ? 'text-rose-400 font-semibold' :
                    log.includes('[INFO]') ? 'text-zinc-400' : 'text-zinc-300'
                  }`}
                >
                  {log}
                </div>
              ))}
              {scene.errorMessage && (
                <div className="mt-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-sans text-xs">
                  <strong>Error:</strong> {scene.errorMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SCENE VOICE SCRIPT */}
        {activeTab === 'script' && (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Voiceover Script (Narration)</span>
              <span className="font-mono text-[11px] text-zinc-500">
                {scene.script.split(' ').length} words
              </span>
            </div>

            <textarea
              defaultValue={scene.script}
              onChange={e => onUpdateScript(e.target.value)}
              rows={12}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 leading-relaxed resize-none focus:outline-none focus:border-zinc-700"
            />

            <button className="w-full py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5">
              <Sparkles size={13} /> Synthesize Speech Preview
            </button>
          </div>
        )}

        {/* TAB 4: ENGINE CONFIG SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Output Resolution</label>
              <select
                value={settings.resolution}
                onChange={e => onUpdateSettings({ resolution: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200 font-medium focus:outline-none"
              >
                <option value="1080p">1080p (Full HD - 1920x1080)</option>
                <option value="4K">4K (Ultra HD - 3840x2160)</option>
                <option value="720p">720p (HD Ready - 1280x720)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Target Framerate</label>
              <select
                value={settings.fps}
                onChange={e => onUpdateSettings({ fps: Number(e.target.value) as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200 font-medium focus:outline-none"
              >
                <option value={60}>60 FPS (Smooth Production)</option>
                <option value={30}>30 FPS (Standard Preview)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Manim Quality Flag</label>
              <select
                value={settings.qualityFlag}
                onChange={e => onUpdateSettings({ qualityFlag: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200 font-mono text-xs focus:outline-none"
              >
                <option value="-qh">-qh (High Quality Render)</option>
                <option value="-qm">-qm (Medium Quality)</option>
                <option value="-ql">-ql (Low Quality Fast Draft)</option>
                <option value="-qk">-qk (4K Production Quality)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Background Canvas Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={e => onUpdateSettings({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 cursor-pointer"
                />
                <span className="font-mono text-zinc-300">{settings.backgroundColor}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
