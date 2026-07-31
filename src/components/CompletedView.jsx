import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Download, FileCode, Edit3, RotateCcw, Copy, 
  CheckCircle2, Share2, Volume2, Maximize2
} from 'lucide-react';

export default function CompletedView() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const chapters = [
    { id: 1, title: 'Problem Introduction', time: '00:00' },
    { id: 2, title: 'Brute Force Approach', time: '01:00' },
    { id: 3, title: 'Optimal Hash Map Approach', time: '02:30' },
    { id: 4, title: 'Step-by-Step Walkthrough', time: '04:30' },
    { id: 5, title: 'Complexity Analysis', time: '06:30' },
    { id: 6, title: 'Summary and Key Takeaways', time: '08:00' },
  ];

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 sm:p-6 md:p-10 flex flex-col justify-between transition-colors duration-200">
      <div className="max-w-6xl mx-auto w-full">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-slate-200 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-emerald text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Render Successful</span>
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">LeetCode Two Sum Problem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Video Complete</h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-mono">
              All 6 Manim scenes rendered, compiled into 1080p60 MP4 with synchronized audio narration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-initial btn-primary text-xs py-2 px-4 justify-center shadow-lg hover:shadow-blue-500/30">
              <Download className="w-3.5 h-3.5" />
              <span>Download MP4</span>
            </button>

            <button className="flex-1 sm:flex-initial btn-secondary text-xs py-2 px-3 justify-center">
              <FileCode className="w-3.5 h-3.5" />
              <span>Download Python Code</span>
            </button>

            <button 
              onClick={handleCopyLink}
              className="btn-secondary text-xs py-2 px-3 justify-center"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Video Player & Chapters Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-xl bg-slate-900 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 overflow-hidden shadow-2xl group flex flex-col justify-between">
              <div className="absolute inset-0 bg-[#09090c] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                <div className="w-full max-w-md p-4 sm:p-6 rounded-xl border border-blue-500/30 bg-blue-950/20 backdrop-blur-md">
                  <div className="text-xs font-mono text-blue-400 mb-2 truncate">SCENE {currentChapter}: {chapters[currentChapter - 1].title}</div>
                  
                  <div className="flex justify-center gap-1.5 sm:gap-2 my-3 sm:my-4">
                    {[2, 7, 11, 15].map((val, idx) => (
                      <div
                        key={idx}
                        className={`w-8 sm:w-10 h-10 sm:h-12 rounded border flex items-center justify-center font-mono text-xs transition-all ${
                          idx < 2 && currentChapter >= 3
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105 sm:scale-110 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                    {isPlaying ? '▶ Playing 1080p60 Vector Video Stream' : '⏸ Video Paused at 02:45'}
                  </div>
                </div>

                {!isPlaying && (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 m-auto w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  >
                    <Play className="w-6 sm:w-7 h-6 sm:h-7 fill-current ml-1" />
                  </button>
                )}
              </div>

              {/* Video Player Controls Bar */}
              <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="text-[11px] sm:text-xs font-mono text-zinc-300">
                    <span>02:45</span> / <span className="text-zinc-500">09:00</span>
                  </div>
                </div>

                <div className="flex-1 mx-3 sm:mx-4 h-1.5 rounded-full bg-zinc-800 cursor-pointer overflow-hidden relative">
                  <div className="h-full bg-blue-500 w-1/3" />
                </div>

                <div className="flex items-center gap-2 text-zinc-400">
                  <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" />
                  <Maximize2 className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scene Timeline */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Scene Chapters</h3>
              <div className="space-y-1.5">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => { setCurrentChapter(ch.id); setIsPlaying(true); }}
                    className={`w-full p-2.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                      currentChapter === ch.id
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span className="truncate">{ch.id}. {ch.title}</span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 ml-1">{ch.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2">
              <button 
                onClick={() => navigate('/workspace')}
                className="w-full btn-secondary text-xs py-2 justify-start gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                <span>Edit Project Script</span>
              </button>

              <button 
                onClick={() => navigate('/rendering')}
                className="w-full btn-secondary text-xs py-2 justify-start gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                <span>Generate Again</span>
              </button>

              <button className="w-full btn-secondary text-xs py-2 justify-start gap-2">
                <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                <span>Duplicate Project</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card rounded-xl p-3.5 sm:p-4 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">Video Duration</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">9 minutes</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">60 fps 1080p</div>
          </div>

          <div className="glass-card rounded-xl p-3.5 sm:p-4 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">Total Render Time</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">18m 42s</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">NVIDIA A100 GPU</div>
          </div>

          <div className="glass-card rounded-xl p-3.5 sm:p-4 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">Scene Count</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">6 Scenes</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Coaster Pipeline</div>
          </div>

          <div className="glass-card rounded-xl p-3.5 sm:p-4 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">Generated Files</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">4 Assets</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">.mp4, .py, .wav, .json</div>
          </div>
        </div>
      </div>
    </div>
  );
}
