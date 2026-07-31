import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, Cpu, Layers, ArrowRight, Check, Shield, 
  Code2, ChevronDown, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingView() {
  const [openFaq, setOpenFaq] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartProject = () => {
    if (isAuthenticated) {
      navigate('/workspace', { state: { openCreateProject: true } });
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <Code2 className="w-5 h-5 text-blue-500" />,
      title: "Programmatic Animation Synthesis",
      description: "Generates high-precision Manim Python code directly from mathematical queries and technical prompts."
    },
    {
      icon: <Layers className="w-5 h-5 text-blue-500" />,
      title: "Scene Coaster Engine",
      description: "Deconstructs complex video requests into modular, parallel-rendered scenes with state tracking."
    },
    {
      icon: <Cpu className="w-5 h-5 text-blue-500" />,
      title: "Dedicated GPU Cluster",
      description: "High-concurrency rendering pipeline running NVIDIA A100 GPUs for sub-30 minute full-HD exports."
    },
    {
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      title: "Enterprise Governance",
      description: "SOC2 Type II compliant with custom Python sandboxing, audit trails, and SSO integration."
    }
  ];

  const faqs = [
    {
      q: "What visual engine powers the video generation?",
      a: "ManimFlow leverages 3Blue1Brown's open-source Manim engine combined with proprietary LLM code synthesis to produce perfectly formatted 60fps mathematical vector animations."
    },
    {
      q: "How does the Scene Coaster component work?",
      a: "The Scene Coaster visualizes your multi-scene project as a connected pipeline. Each scene (coach) renders independently on our serverless GPU nodes so errors are isolated to a single scene."
    },
    {
      q: "Can I export raw Python code for manual fine-tuning?",
      a: "Yes. Every generated scene includes full raw Manim Python code (`.py`) along with rendered MP4 vectors and narration audio files."
    },
    {
      q: "What rendering resolutions and frame rates are supported?",
      a: "Pro and Enterprise tiers support 1080p60 and 4K60 rendering with customizable color palettes and typography."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden border-b border-slate-200 dark:border-zinc-800/60">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ManimFlow Studio v2.4 Released</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            The Enterprise Platform for <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-blue-400">
              Programmatic AI Video Production
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Synthesize complex mathematical visualizations, CS algorithms, and multi-scene technical videos using Manim Python code & distributed GPU rendering.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button 
              onClick={handleStartProject}
              className="btn-primary px-6 py-3 text-sm font-medium shadow-lg hover:shadow-blue-500/25"
            >
              <span>Create Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isAuthenticated && (
              <Link 
                to="/login"
                className="btn-secondary px-6 py-3 text-sm font-medium"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span>Sign In First</span>
              </Link>
            )}
          </div>

          {/* Code Preview Terminal */}
          <div className="mt-14 max-w-4xl mx-auto rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-900 shadow-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                <span className="ml-2 text-xs font-mono text-slate-400">two_sum_scene.py — Manim Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-emerald text-[11px]">GPU Ready</span>
              </div>
            </div>
            
            <div className="p-6 font-mono text-xs text-slate-300 bg-[#0c0c0f] overflow-x-auto leading-relaxed">
              <span className="text-purple-400">from</span> manim <span className="text-purple-400">import</span> *<br/><br/>
              <span className="text-purple-400">class</span> <span className="text-yellow-300">TwoSumSolution</span>(Scene):<br/>
              &nbsp;&nbsp;<span className="text-purple-400">def</span> <span className="text-blue-400">construct</span>(self):<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;array = SquareGroup([2, 7, 11, 15], color=BLUE)<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;target = Text("Target = 9", color=YELLOW)<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;self.play(Create(array), FadeIn(target))<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;self.wait(1)
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest font-semibold">Capabilities</span>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mt-2">Engineered for Technical Precision</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest font-semibold">Pricing</span>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mt-2">Transparent Enterprise Plans</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="glass-card p-8 rounded-xl relative">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pro Studio</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Ideal for individual developers & educators</p>
            <div className="my-6">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$49</span>
              <span className="text-slate-500 dark:text-zinc-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-300 mb-8">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" /> 120 Video Renders / month
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" /> Multi-scene Scene Coaster Track
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" /> 1080p60 Export + Raw Python Code
              </li>
            </ul>
            <button 
              onClick={handleStartProject}
              className="w-full btn-secondary py-2.5 justify-center text-xs"
            >
              Start Free Trial
            </button>
          </div>

          <div className="glass-card p-8 rounded-xl border border-blue-500/50 relative shadow-md">
            <div className="absolute top-4 right-4">
              <span className="badge badge-blue text-[10px]">POPULAR</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Enterprise Cluster</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">For engineering teams & technical orgs</p>
            <div className="my-6">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$249</span>
              <span className="text-slate-500 dark:text-zinc-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-300 mb-8">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" /> Unlimited Video Generations
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" /> Dedicated NVIDIA A100 GPU Cluster
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" /> 4K60 Ultra-HD Video Quality
              </li>
            </ul>
            <button 
              onClick={handleStartProject}
              className="w-full btn-primary py-2.5 justify-center text-xs"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-6 max-w-3xl mx-auto w-full border-t border-slate-200 dark:border-zinc-800/60">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-medium text-slate-800 dark:text-zinc-200"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-zinc-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 dark:text-zinc-400 border-t border-slate-200 dark:border-zinc-800/40 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">ManimFlow SaaS Platform</span>
            <span>© 2026 ManimFlow Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-500">Documentation</a>
            <a href="#" className="hover:text-blue-500">API Status</a>
            <a href="#" className="hover:text-blue-500">Security</a>
            <a href="#" className="hover:text-blue-500">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
