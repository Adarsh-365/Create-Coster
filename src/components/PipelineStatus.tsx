import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import type { GenerationPhase } from './Types';

interface PipelineStatusProps {
  phase: GenerationPhase;
  onRetry?: () => void;
}

interface Step {
  id: GenerationPhase;
  label: string;
  sublabel: string;
  icon: string;
}

const STEPS: Step[] = [
  { id: 'planning',  label: 'AI Planner',     sublabel: 'Analyzing prompt',      icon: '🧠' },
  { id: 'breakdown', label: 'Breakdown',       sublabel: 'Scene segmentation',    icon: '🗂️' },
  { id: 'codegen',   label: 'Code Gen',        sublabel: 'Writing Manim Python',  icon: '💻' },
  { id: 'rendering', label: 'Rendering',       sublabel: 'Executing animations',  icon: '🎬' },
  { id: 'done',      label: 'Final Video',     sublabel: 'Export ready',          icon: '✅' },
];

const PHASE_ORDER: GenerationPhase[] = ['idle', 'planning', 'breakdown', 'codegen', 'rendering', 'done'];

function getStepStatus(stepId: GenerationPhase, currentPhase: GenerationPhase, isError: boolean) {
  if (isError) {
    const stepIdx = PHASE_ORDER.indexOf(stepId);
    const curIdx = PHASE_ORDER.indexOf(currentPhase);
    if (stepIdx < curIdx) return 'done';
    if (stepIdx === curIdx) return 'error';
    return 'idle';
  }
  const stepIdx = PHASE_ORDER.indexOf(stepId);
  const curIdx = PHASE_ORDER.indexOf(currentPhase);
  if (stepIdx < curIdx) return 'done';
  if (stepIdx === curIdx) return 'active';
  return 'idle';
}

export default function PipelineStatus({ phase, onRetry }: PipelineStatusProps) {
  const isError = phase === 'error';
  const isIdle = phase === 'idle';

  if (isIdle) return null;

  return (
    <div className="px-5 py-3 border-b border-[var(--border)] shrink-0">
      <div className="flex items-center gap-1.5 justify-between">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.id, phase, isError);

          return (
            <div key={step.id} className="flex items-center gap-1.5 flex-1 min-w-0">
              {/* Step Card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex-1 flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all min-w-0 ${
                  status === 'active'
                    ? 'pipeline-active bg-blue-600/5 border-blue-500/30'
                    : status === 'done'
                    ? 'bg-green-500/5 border-green-500/20'
                    : status === 'error'
                    ? 'bg-red-500/5 border-red-500/25'
                    : 'bg-slate-900/30 border-[var(--border)]'
                }`}
              >
                {/* Icon */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  status === 'active'  ? 'bg-blue-600/20' :
                  status === 'done'    ? 'bg-green-600/20' :
                  status === 'error'   ? 'bg-red-600/20' :
                  'bg-slate-800/60'
                }`}>
                  {status === 'done'   ? <CheckCircle2 size={12} className="text-green-400" /> :
                   status === 'error'  ? <AlertCircle  size={12} className="text-red-400" /> :
                   status === 'active' ? <Loader2 size={12} className="text-blue-400 spinner" /> :
                   <span className="opacity-40 text-[11px]">{step.icon}</span>}
                </div>

                {/* Label */}
                <div className="min-w-0 hidden sm:block">
                  <p className={`text-[10px] font-bold leading-none truncate ${
                    status === 'active' ? 'text-blue-300' :
                    status === 'done'   ? 'text-green-300' :
                    status === 'error'  ? 'text-red-300' :
                    'text-slate-600'
                  }`}>{step.label}</p>
                  {status === 'active' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[9px] text-slate-500 mt-0.5 truncate"
                    >
                      {step.sublabel}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <ArrowRight size={11} className={`shrink-0 ${
                  getStepStatus(STEPS[i + 1].id, phase, isError) !== 'idle'
                    ? 'text-blue-600/60' : 'text-slate-800'
                }`} />
              )}
            </div>
          );
        })}

        {/* Retry on error */}
        {isError && onRetry && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onRetry}
            className="ml-2 shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-600/20 transition-colors"
          >
            <RotateCcw size={11} />
            Retry
          </motion.button>
        )}
      </div>
    </div>
  );
}
