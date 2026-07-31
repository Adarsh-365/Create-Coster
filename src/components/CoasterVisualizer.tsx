import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ManimScene, SceneStatus } from './Types';

interface CoasterVisualizerProps {
  scenes: ManimScene[];
  activeSceneIdx: number;
  onSelectScene: (idx: number) => void;
  isPlaying: boolean;
}

// ── Track Configuration ───────────────────────────────────────────────────────
const VB_W = 1100;
const VB_H = 300;

// Dramatic dual-hill track path
const TRACK_PATH =
  'M 30,240 C 100,240 140,60 210,60 C 280,60 310,230 380,230 C 450,230 480,100 555,100 C 630,100 650,240 730,240 C 810,240 830,140 890,140 C 940,140 960,200 1070,200';

// Support pillar positions (x, approx y on track, ground=270)
const PILLAR_XS = [80, 130, 165, 260, 320, 360, 430, 510, 580, 640, 700, 780, 850, 930, 990, 1040];

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<SceneStatus, { fill: string; stroke: string; glow: string; label: string }> = {
  rendered:  { fill: '#10b981', stroke: '#34d399', glow: 'rgba(16,185,129,0.8)',  label: '✅' },
  rendering: { fill: '#22d3ee', stroke: '#67e8f9', glow: 'rgba(34,211,238,0.8)', label: '⚡' },
  queued:    { fill: '#f59e0b', stroke: '#fbbf24', glow: 'rgba(245,158,11,0.7)', label: '⏳' },
  pending:   { fill: '#475569', stroke: '#64748b', glow: 'rgba(71,85,105,0.5)',   label: '○' },
  failed:    { fill: '#ef4444', stroke: '#f87171', glow: 'rgba(239,68,68,0.8)',   label: '✕' },
};

// ── Utility: point on SVG path ────────────────────────────────────────────────
function getPathPoints(pathEl: SVGPathElement, count: number): Array<{ x: number; y: number; angle: number }> {
  const len = pathEl.getTotalLength();
  return Array.from({ length: count }, (_, i) => {
    const pct = count === 1 ? 0.5 : 0.04 + (i / (count - 1)) * 0.89;
    const pt = pathEl.getPointAtLength(pct * len);
    const pt1 = pathEl.getPointAtLength(Math.max(0, (pct - 0.01)) * len);
    const pt2 = pathEl.getPointAtLength(Math.min(1, (pct + 0.01)) * len);
    const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * (180 / Math.PI);
    return { x: pt.x, y: pt.y, angle };
  });
}

// ── Cart SVG Component ────────────────────────────────────────────────────────
function CoasterCart({
  x, y, angle, scene, isActive, onClick,
}: {
  x: number; y: number; angle: number;
  scene: ManimScene; isActive: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_COLORS[scene.status];
  const isRendering = scene.status === 'rendering';
  const isFailed = scene.status === 'failed';

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className={isActive ? 'cart-active' : isRendering ? 'cart-rendering' : isFailed ? 'cart-failed' : ''}
    >
      {/* Outer glow halo for active */}
      {isActive && (
        <ellipse cx={0} cy={-6} rx={24} ry={16} fill={`rgba(59,130,246,0.12)`} />
      )}

      {/* Cart body */}
      <rect x={-16} y={-20} width={32} height={14} rx={4}
        fill={isActive ? '#1d4ed8' : cfg.fill}
        stroke={isActive ? '#60a5fa' : cfg.stroke}
        strokeWidth={isActive ? 2 : 1.5}
        opacity={scene.status === 'pending' ? 0.5 : 1}
      />

      {/* Cart front slope */}
      <path d={`M 8,-20 L 14,-28 L 4,-28 Z`}
        fill={isActive ? '#2563eb' : cfg.fill}
        stroke={isActive ? '#60a5fa' : cfg.stroke}
        strokeWidth={1}
        opacity={scene.status === 'pending' ? 0.5 : 1}
      />

      {/* Scene number inside cart */}
      <text x={-7} y={-10} fontSize={7} fontWeight={800} fill="white" fontFamily="JetBrains Mono, monospace" opacity={scene.status === 'pending' ? 0.6 : 1}>
        S{String(scene.number).padStart(2, '0')}
      </text>

      {/* Status icon on front */}
      <text x={5} y={-22} fontSize={8}>{cfg.label}</text>

      {/* Passenger heads (active only) */}
      {isActive && (
        <>
          <circle cx={-8} cy={-25} r={4} fill="#f43f5e" stroke="#fca5a5" strokeWidth={0.5} />
          <circle cx={2} cy={-25} r={4} fill="#fbbf24" stroke="#fde68a" strokeWidth={0.5} />
        </>
      )}

      {/* Wheels */}
      <circle cx={-9} cy={-4} r={4} fill="#0f172a" stroke="#334155" strokeWidth={1} />
      <circle cx={9} cy={-4} r={4} fill="#0f172a" stroke="#334155" strokeWidth={1} />
      {/* Wheel spokes */}
      <line x1={-9} y1={-8} x2={-9} y2={0} stroke="#475569" strokeWidth={0.5} />
      <line x1={-13} y1={-4} x2={-5} y2={-4} stroke="#475569" strokeWidth={0.5} />
      <line x1={9} y1={-8} x2={9} y2={0} stroke="#475569" strokeWidth={0.5} />
      <line x1={5} y1={-4} x2={13} y2={-4} stroke="#475569" strokeWidth={0.5} />

      {/* Speed sparks for active */}
      {isActive && (
        <>
          <circle cx={-20} cy={-8} r={1.5} fill="#60a5fa" opacity={0.7} />
          <circle cx={-25} cy={-5} r={1} fill="#a78bfa" opacity={0.5} />
          <circle cx={-18} cy={-12} r={1} fill="#60a5fa" opacity={0.4} />
        </>
      )}

      {/* Render progress arc (rendering status) */}
      {isRendering && (
        <circle
          cx={0} cy={-13}
          r={6}
          fill="none"
          stroke={cfg.stroke}
          strokeWidth={1.5}
          strokeDasharray={`${(scene.renderProgress / 100) * 37.7} 37.7`}
          strokeLinecap="round"
          transform="rotate(-90, 0, -13)"
          opacity={0.8}
        />
      )}
    </g>
  );
}

// ── Tooltip Component ─────────────────────────────────────────────────────────
function CartTooltip({ scene, x, y }: { scene: ManimScene; x: number; y: number }) {
  const cfg = STATUS_COLORS[scene.status];
  return (
    <foreignObject x={x - 70} y={y - 75} width={140} height={65}>
      <div className="glass-bright rounded-xl p-2 shadow-2xl border border-blue-500/20 pointer-events-none">
        <p className="text-[10px] font-bold text-white truncate">{scene.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px]" style={{ color: cfg.stroke }}>{scene.status}</span>
          <span className="text-[9px] text-slate-500">·</span>
          <span className="text-[9px] text-slate-400">{scene.duration}</span>
        </div>
        {scene.status === 'rendering' && (
          <div className="mt-1.5 w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${scene.renderProgress}%` }} />
          </div>
        )}
      </div>
    </foreignObject>
  );
}

// ── Main Visualizer ───────────────────────────────────────────────────────────
export default function CoasterVisualizer({
  scenes,
  activeSceneIdx,
  onSelectScene,
  isPlaying,
}: CoasterVisualizerProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [nodePositions, setNodePositions] = useState<Array<{ x: number; y: number; angle: number }>>([]);
  const [cartPos, setCartPos] = useState({ x: 30, y: 240, angle: 0 });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Compute node positions once path is mounted
  useEffect(() => {
    const el = pathRef.current;
    if (!el || scenes.length === 0) return;
    setNodePositions(getPathPoints(el, scenes.length));
  }, [scenes.length]);

  // Animate cart toward active scene node
  useEffect(() => {
    if (nodePositions.length === 0 || !pathRef.current) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const pathEl = pathRef.current;
    const totalLen = pathEl.getTotalLength();
    const targetPct = scenes.length === 1 ? 0.5 : 0.04 + (activeSceneIdx / (scenes.length - 1)) * 0.89;

    let currentLen = pathEl.getTotalLength() * (scenes.length === 1 ? 0.5 : 0.04 + (Math.max(0, activeSceneIdx - 1) / (scenes.length - 1)) * 0.89);
    const targetLen = targetPct * totalLen;
    const direction = targetLen > currentLen ? 1 : -1;
    const speed = Math.abs(targetLen - currentLen) / 40; // pixels per frame

    const animate = () => {
      if ((direction === 1 && currentLen >= targetLen) || (direction === -1 && currentLen <= targetLen)) {
        const pt = pathEl.getPointAtLength(targetLen);
        const pt1 = pathEl.getPointAtLength(Math.max(0, targetLen - 5));
        const pt2 = pathEl.getPointAtLength(Math.min(totalLen, targetLen + 5));
        const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * (180 / Math.PI);
        setCartPos({ x: pt.x, y: pt.y, angle });
        return;
      }
      currentLen += speed * direction;
      const pt = pathEl.getPointAtLength(currentLen);
      const pt1 = pathEl.getPointAtLength(Math.max(0, currentLen - 5));
      const pt2 = pathEl.getPointAtLength(Math.min(totalLen, currentLen + 5));
      const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * (180 / Math.PI);
      setCartPos({ x: pt.x, y: pt.y, angle });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [activeSceneIdx, nodePositions, scenes.length]);

  // Approximate track Y at given X (for pillar heights)
  function trackYAt(x: number): number {
    if (x < 210) return 240 - ((x - 30) / 180) * 180;
    if (x < 380) return 60 + ((x - 210) / 170) * 170;
    if (x < 555) return 230 - ((x - 380) / 175) * 130;
    if (x < 730) return 100 + ((x - 555) / 175) * 140;
    if (x < 890) return 240 - ((x - 730) / 160) * 100;
    return 140 + ((x - 890) / 180) * 60;
  }

  return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden">
      {/* Stars / particle background */}
      <div className="absolute inset-0 stars-bg opacity-60 pointer-events-none" />

      {/* SVG Track */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Rail gradient */}
          <linearGradient id="railGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3b82f6" />
            <stop offset="40%"  stopColor="#8b5cf6" />
            <stop offset="70%"  stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Ground gradient */}
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0.06)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>

          {/* Active glow filter */}
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Cart glow filter */}
          <filter id="cartGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ground plane */}
        <line x1={10} y1={270} x2={VB_W - 10} y2={270} stroke="rgba(59,130,246,0.08)" strokeWidth={1.5} />
        <rect x={10} y={270} width={VB_W - 20} height={30} fill="url(#groundGrad)" />

        {/* Support pillars */}
        {PILLAR_XS.map(px => {
          const ty = trackYAt(px);
          if (ty >= 265) return null;
          return (
            <g key={px} opacity={0.3}>
              <line x1={px} y1={ty} x2={px} y2={270} stroke="rgba(59,130,246,0.5)" strokeWidth={1} />
              <line x1={px} y1={ty} x2={px + 30} y2={270} stroke="rgba(59,130,246,0.2)" strokeWidth={0.5} />
              <line x1={px} y1={ty} x2={px - 30} y2={270} stroke="rgba(59,130,246,0.2)" strokeWidth={0.5} />
              {/* Cross brace */}
              {px % 80 === 0 && ty < 200 && (
                <line x1={px} y1={ty + 40} x2={px + 30} y2={ty + 60} stroke="rgba(59,130,246,0.25)" strokeWidth={0.5} />
              )}
            </g>
          );
        })}

        {/* ── TRACK LAYERS ── */}
        {/* Shadow/depth rail */}
        <path ref={pathRef} d={TRACK_PATH} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={10} strokeLinecap="round" />

        {/* Lower secondary rail (parallel) */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(30,41,59,0.8)"
          strokeWidth={5}
          strokeLinecap="round"
        />

        {/* Main glowing rail */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="url(#railGradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter="url(#glowFilter)"
        />



        {/* Animated dash on track (progress indicator) */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.5}
          strokeDasharray="6 18"
          strokeLinecap="round"
          className="track-animated"
        />

        {/* ── SCENE STATION NODES ── */}
        {nodePositions.map((pt, idx) => {
          const scene = scenes[idx];
          if (!scene) return null;
          const isActive = idx === activeSceneIdx;
          const isHovered = idx === hoveredIdx;
          const cfg = STATUS_COLORS[scene.status];

          return (
            <g key={scene.id}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Station glow ring */}
              {(isActive || isHovered) && (
                <circle
                  cx={pt.x} cy={pt.y}
                  r={18}
                  fill={`rgba(${isActive ? '59,130,246' : '139,92,246'},0.08)`}
                  stroke={`rgba(${isActive ? '59,130,246' : '139,92,246'},0.25)`}
                  strokeWidth={1}
                />
              )}

              {/* Station marker dot */}
              <circle
                cx={pt.x} cy={pt.y}
                r={isActive ? 7 : isHovered ? 6 : 5}
                fill={isActive ? '#3b82f6' : cfg.fill}
                stroke={isActive ? '#93c5fd' : cfg.stroke}
                strokeWidth={1.5}
                filter={isActive ? 'url(#glowFilter)' : undefined}
                style={{ transition: 'all 0.2s' }}
              />

              {/* Scene label tag */}
              <foreignObject
                x={pt.x - 16}
                y={pt.y - 42}
                width={32}
                height={18}
              >
                <div
                  onClick={() => onSelectScene(idx)}
                  className={`flex items-center justify-center text-[9px] font-black rounded-md px-1 py-0.5 cursor-pointer select-none whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                      : 'bg-slate-800/90 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  S{String(scene.number).padStart(2, '0')}
                </div>
              </foreignObject>

              {/* Tooltip on hover */}
              {isHovered && !isActive && (
                <CartTooltip scene={scene} x={pt.x} y={pt.y} />
              )}
            </g>
          );
        })}

        {/* ── ANIMATED MAIN CART ── */}
        {nodePositions.length > 0 && (
          <g filter="url(#cartGlow)">
            <CoasterCart
              x={cartPos.x}
              y={cartPos.y}
              angle={cartPos.angle}
              scene={scenes[activeSceneIdx]}
              isActive={true}
              onClick={() => {}}
            />
          </g>
        )}

        {/* ── STATIC SCENE CARTS (non-active) ── */}
        {nodePositions.map((pt, idx) => {
          if (idx === activeSceneIdx) return null;
          const scene = scenes[idx];
          if (!scene) return null;

          return (
            <CoasterCart
              key={scene.id}
              x={pt.x}
              y={pt.y}
              angle={pt.angle}
              scene={scene}
              isActive={false}
              onClick={() => onSelectScene(idx)}
            />
          );
        })}
      </svg>

      {/* Active scene info badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSceneIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="absolute bottom-3 left-3 glass-bright rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg border border-blue-500/20"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-200">
            Scene {scenes[activeSceneIdx]?.number}/{scenes.length}
            <span className="text-slate-400 font-normal ml-1">— {scenes[activeSceneIdx]?.title}</span>
          </span>
          {isPlaying && (
            <span className="text-[10px] text-green-400 font-semibold animate-pulse ml-1">▶ Playing</span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3">
        {(Object.entries(STATUS_COLORS) as [SceneStatus, typeof STATUS_COLORS[SceneStatus]][]).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: cfg.fill }} />
            <span className="text-[9px] text-slate-600 capitalize font-medium">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
