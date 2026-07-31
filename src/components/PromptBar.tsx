import { useState, useRef, useEffect } from 'react';
import { Wand2, ChevronDown, Loader2, Sparkles, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptBarProps {
  onGenerate: (prompt: string, model: string) => void;
  isGenerating: boolean;
}

const MODELS = [
  { id: 'gpt-4o',      label: 'GPT-4o',       provider: 'OpenAI',    color: '#10b981', icon: '🟢' },
  { id: 'claude-3-5',  label: 'Claude 3.5',   provider: 'Anthropic', color: '#f59e0b', icon: '🟡' },
  { id: 'gemini-pro',  label: 'Gemini Pro',   provider: 'Google',    color: '#3b82f6', icon: '🔵' },
  { id: 'deepseek-r1', label: 'DeepSeek R1',  provider: 'DeepSeek',  color: '#8b5cf6', icon: '🟣' },
];

const EXAMPLE_PROMPTS = [
  'Explain binary search with animated array visualization',
  'Visualize Dijkstra\'s shortest path algorithm step by step',
  'Animate the fast Fourier transform butterfly diagram',
  'Show how gradient descent finds the minimum of a loss function',
  'Prove the Pythagorean theorem geometrically',
  'Animate merge sort with side-by-side comparisons',
];

export default function PromptBar({ onGenerate, isGenerating }: PromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cycle example prompts in placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % EXAMPLE_PROMPTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim(), selectedModel.id);
  };

  const estimatedScenes = Math.max(3, Math.min(8, Math.ceil(prompt.split(' ').length / 8)));
  const estimatedTime = estimatedScenes * 25;

  return (
    <div className="px-5 pt-5 pb-3 border-b border-[var(--border)] shrink-0">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} className="text-blue-400" />
        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">AI Video Generator</span>
      </div>

      {/* Main Input Box */}
      <div
        className={`relative rounded-2xl border transition-all duration-300 ${
          isFocused
            ? 'border-blue-500/50 shadow-[0_0_0_3px_rgba(59,130,246,0.12),0_0_30px_rgba(59,130,246,0.08)] bg-[var(--bg-card)]'
            : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-blue-500/25'
        }`}
      >
        {/* Animated top border when focused */}
        {isFocused && (
          <div className="absolute top-0 left-4 right-4 h-px overflow-hidden rounded-full">
            <div className="border-flow-wrap h-full w-full" />
          </div>
        )}

        <div className="p-4">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={EXAMPLE_PROMPTS[placeholderIdx]}
            rows={1}
            className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none leading-relaxed font-medium"
            style={{ minHeight: '28px', maxHeight: '120px' }}
            disabled={isGenerating}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
            {/* Left: Model selector + estimates */}
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsModelOpen(p => !p)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-[var(--border)] text-xs font-semibold text-slate-300 hover:border-blue-500/30 hover:text-white transition-all"
                >
                  <Cpu size={11} style={{ color: selectedModel.color }} />
                  {selectedModel.label}
                  <ChevronDown size={10} className={`text-slate-500 transition-transform ${isModelOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isModelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1.5 w-44 glass-bright rounded-xl shadow-2xl border border-[var(--border)] z-50 overflow-hidden"
                    >
                      {MODELS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedModel(m); setIsModelOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-blue-500/10 transition-colors ${
                            selectedModel.id === m.id ? 'bg-blue-500/10 text-blue-300' : 'text-slate-300'
                          }`}
                        >
                          <span>{m.icon}</span>
                          <div>
                            <p className="font-semibold">{m.label}</p>
                            <p className="text-[10px] text-slate-500">{m.provider}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Estimates */}
              {prompt.trim().length > 10 && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Zap size={9} className="text-amber-400" />
                    ~{estimatedScenes} scenes · ~{estimatedTime}s
                  </span>
                </motion.div>
              )}
            </div>

            {/* Right: Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                !prompt.trim() || isGenerating
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'btn-primary text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  Generate
                  <kbd className="text-[9px] opacity-50 bg-white/10 px-1 py-0.5 rounded font-mono">⌘↵</kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
