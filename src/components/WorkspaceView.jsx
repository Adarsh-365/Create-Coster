import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Send, Bot, User, Sparkles, Folder, History, LayoutTemplate,
  Plus, LogOut, Loader2, AlertCircle, MessageSquare, FolderPlus, X, Film, Clapperboard, ArrowRight, CheckCircle2, MessageCircle
} from 'lucide-react';
import SceneCoaster from './SceneCoaster';
import SceneDrawer from './SceneDrawer';
import { useAuth } from '../context/AuthContext';
import { startWorkflowApi, chatApi, createProjectApi, loadProjectsApi, loadChatHistoryApi } from '../services/api';

export default function WorkspaceView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const initialProjectName = location.state?.projectName || '';
  const [activeProjectName, setActiveProjectName] = useState(initialProjectName);

  const [projectHistory, setProjectHistory] = useState(
    initialProjectName ? [{ name: initialProjectName, type: 'multi', messages: [], scenes: [], topic: '', estimatedDuration: '' }] : []
  );

  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);

  useEffect(() => {
    if (location.state?.openCreateProject) {
      setIsModalOpen(true);
      setModalStep(1);
      setNewProjectName('');
      setNewProjectType('multi');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      if (!user?.id) return;
      setIsLoadingProjects(true);
      try {
        const data = await loadProjectsApi(user.id);
        if (!isMounted) return;
        
        const projectList = data.project_list || data.projects || data.data || (Array.isArray(data) ? data : []);
        if (projectList.length === 0) return;

        const history = projectList.map(p => {
          if (Array.isArray(p)) {
            // Handle [id, name] tuple format from backend
            return {
              id: p[0] || '',
              name: p[1] || 'Unnamed Project',
              type: 'multi',
              messages: [],
              scenes: [],
              topic: '',
              estimatedDuration: ''
            };
          }
          // Fallback for object format
          return {
            id: p.project_id || p.id || '',
            name: p.project_name || p.projectname || p.name || 'Unnamed Project',
            type: p.type || 'multi',
            messages: p.messages || [],
            scenes: p.scenes || [],
            topic: p.topic || '',
            estimatedDuration: p.estimatedDuration || ''
          };
        });
        
        // Try to maintain active project if one was passed, else use first from backend
        let nextActive = history[0];
        if (initialProjectName) {
          const found = history.find(h => h.name === initialProjectName);
          if (found) nextActive = found;
          else {
            // Keep the initial project stub and append history
            setProjectHistory(prev => [...prev, ...history]);
            return;
          }
        }
        
        setProjectHistory(history);
        setActiveProjectName(nextActive.name);
        setMessages(nextActive.messages || []);
        setScenes(nextActive.scenes || []);
        setTopic(nextActive.topic || '');
        setEstimatedDuration(nextActive.estimatedDuration || '');

        if (nextActive.id) {
          setIsLoadingChatHistory(true);
          try {
            const historyData = await loadChatHistoryApi(nextActive.id);
            const backendMessages = historyData.chat || historyData.messages || historyData.data || (Array.isArray(historyData) ? historyData : []);
            
            if (backendMessages && backendMessages.length > 0) {
              const formatted = backendMessages.map((m, idx) => {
                if (Array.isArray(m)) {
                  return { id: Date.now() + idx, role: m[0] || 'user', text: m[1] || '' };
                }
                return { id: m.id || Date.now() + idx, role: m.role || 'user', text: m.text || m.content || '' };
              });
              if (isMounted) setMessages(formatted);
            }
          } catch (err) {
            console.error("Failed to load chat history on init:", err);
          } finally {
            if (isMounted) setIsLoadingChatHistory(false);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    }
    
    // Run exactly once if the user has no history or just the un-ID'd stub
    if (projectHistory.length === 0 || (projectHistory.length === 1 && !projectHistory[0].id)) {
      loadProjects();
    } else {
      setIsLoadingProjects(false);
    }
    
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);


  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState('multi');
  const [isCreating, setIsCreating] = useState(false);

  // Pure API State
  const [messages, setMessages] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  // Sync active project state to projectHistory
  useEffect(() => {
    if (activeProjectName) {
      setProjectHistory(prev => {
        const exists = prev.find(p => p.name === activeProjectName);
        if (exists) {
          return prev.map(p => 
            p.name === activeProjectName 
              ? { ...p, messages, scenes, topic, estimatedDuration } 
              : p
          );
        }
        return prev;
      });
    }
  }, [messages, scenes, topic, estimatedDuration, activeProjectName]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedScene, setSelectedScene] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  /**
   * Send prompt to API: http://127.0.0.1:8000/api/v1/project/start_worflow
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    const userQuery = inputPrompt;
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: userQuery
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsSubmitting(true);
    setApiError('');

    try {
      const activeProj = projectHistory.find(p => p.name === activeProjectName);
      const projectId = activeProj?.id || activeProjectName; // fallback if id isn't set

      const response = await chatApi({
        prompt: userQuery,
        project_id: projectId,
        user_id: user?.id
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      const assistantId = Date.now() + 1;

      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: ""
        }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Handle SSE JSON format if used
        if (chunk.includes('data:')) {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const dataStr = line.substring(5).trim();
              if (!dataStr || dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.token) assistantText += data.token;
                else if (data.content) assistantText += data.content;
                else if (data.type === 'scene' && data.scene) {
                  setScenes(prev => {
                    const exists = prev.find(s => s.id === data.scene.id);
                    if (exists) return prev.map(s => s.id === data.scene.id ? data.scene : s);
                    return [...prev, data.scene];
                  });
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        } else {
          // Raw text fallback
          assistantText += chunk;
        }

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, text: assistantText }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('API Error:', err);
      setApiError(err.message || 'Failed to connect to backend server at http://127.0.0.1:8000/api/v1/chat');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: `[API Connection Error] ${err.message}`
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWorkflow = async () => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAssistantMessage || !lastAssistantMessage.text) {
      setApiError('No final script found from assistant yet.');
      return;
    }
    
    const script = lastAssistantMessage.text;
    const activeProj = projectHistory.find(p => p.name === activeProjectName);
    const projectId = activeProj?.id;

    if (!projectId) {
      setApiError('No active project found.');
      return;
    }

    setIsSubmitting(true);
    try {
      await startWorkflowApi({
        project_id: projectId,
        script: script,
        project_name: activeProjectName,
        user_id: user?.id
      });
      navigate('/status');
    } catch (err) {
      setApiError(err.message || 'Failed to initiate video rendering on server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateScene = (sceneId, updatedFields) => {
    setScenes((prev) =>
      prev.map((sc, idx) => {
        const currentId = sc.id || sc.scene_number || (idx + 1);
        return currentId === sceneId ? { ...sc, ...updatedFields } : sc;
      })
    );
    setSelectedScene(null);
  };

  const handleSwitchProject = async (proj) => {
    setActiveProjectName(proj.name);
    setMessages(proj.messages || []);
    setScenes(proj.scenes || []);
    setTopic(proj.topic || '');
    setEstimatedDuration(proj.estimatedDuration || '');
    setSelectedScene(null);

    if (proj.id) {
      setIsLoadingChatHistory(true);
      try {
        const historyData = await loadChatHistoryApi(proj.id);
        const backendMessages = historyData.chat || historyData.messages || historyData.data || (Array.isArray(historyData) ? historyData : []);
        
        if (backendMessages && backendMessages.length > 0) {
          const formatted = backendMessages.map((m, idx) => {
            if (Array.isArray(m)) {
              return {
                id: Date.now() + idx,
                role: m[0] || 'user',
                text: m[1] || ''
              };
            }
            return {
              id: m.id || Date.now() + idx,
              role: m.role || 'user',
              text: m.text || m.content || ''
            };
          });
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoadingChatHistory(false);
      }
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setApiError('Please enter a project name.');
      return;
    }
    setIsCreating(true);
    setApiError('');
    try {
      const createRes = await createProjectApi({
        user_id: user?.id,
        project_name: newProjectName.trim(),
        type: newProjectType
      });
      const newProj = {
        id: createRes?.id || createRes?.project_id || '',
        name: newProjectName.trim(),
        type: newProjectType,
        messages: [],
        scenes: [],
        topic: '',
        estimatedDuration: ''
      };
      
      setProjectHistory(prev => [newProj, ...prev]);
      setActiveProjectName(newProj.name);
      setMessages([]);
      setScenes([]);
      setTopic('');
      setSelectedScene(null);
      setIsModalOpen(false);
    } catch (err) {
      setApiError(err.message || 'Failed to create project.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden transition-colors duration-200">
      {/* 1. Workspace Sidebar (Hidden on mobile < md) */}
      <aside className="w-64 border-r border-slate-200 dark:border-zinc-800 glass-card flex flex-col justify-between hidden md:flex">
        <div className="p-4 space-y-6">
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Project History
            </div>

            {isLoadingProjects ? (
              <div className="py-6 flex justify-center items-center">
                <div className="loader-spinner scale-[0.6]"></div>
              </div>
            ) : projectHistory.length === 0 ? (
              <div className="px-2 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center">
                No projects yet
              </div>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {projectHistory.map((proj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSwitchProject(proj)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeProjectName === proj.name
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <MessageCircle className={`w-4 h-4 shrink-0 ${activeProjectName === proj.name ? 'text-blue-500' : 'text-slate-400 dark:text-zinc-500'}`} />
                      <span className="truncate">{proj.name}</span>
                    </span>
                    {activeProjectName === proj.name && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Card Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold">
              {user?.avatar || 'DV'}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-900 dark:text-white">{user?.name || 'Developer'}</div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-500">{user?.email || 'dev@enterprise.io'}</div>
            </div>
          </div>
          <button onClick={logout} className="p-1 text-slate-400 dark:text-zinc-500 hover:text-rose-500" title="Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Main AI Conversation & Scene Coaster Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between glass-panel">
          <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-500" />
            {activeProjectName ? activeProjectName : 'No Active Project'}
          </div>
          <button 
            onClick={() => { setIsModalOpen(true); setModalStep(1); setNewProjectName(''); setNewProjectType('multi'); }}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Project</span>
          </button>
        </header>

        {apiError && (
          <div className="p-3 bg-rose-500/10 border-b border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{apiError}</span>
            </div>
            <button onClick={() => setApiError('')} className="text-xs underline shrink-0 ml-2">Dismiss</button>
          </div>
        )}

        {/* Chat History & Scene Coaster Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full">
          {isLoadingChatHistory ? (
            <div className="py-20 flex justify-center items-center">
              <div className="loader-spinner"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 sm:py-16 text-center px-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                Start a New Script Generation
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                Describe the script you want to build and chat with the AI to refine your scenes.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Bot className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-2xl rounded-xl p-3 sm:p-4 text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-blue-600 text-white font-medium shadow-md'
                      : 'glass-card text-slate-800 dark:text-zinc-200 shadow-sm'
                    }`}
                >
                  <div className="font-semibold text-[10px] sm:text-[11px] mb-1 font-mono opacity-75">
                    {msg.role === 'user' ? (user?.name || 'You') : 'Manim AI API Response'}
                  </div>
                  {msg.role === 'assistant' ? (
                    msg.text ? (
                      <div 
                        className="markdown-body"
                        dangerouslySetInnerHTML={{ 
                          __html: window.marked ? window.marked.parse(msg.text || '') : msg.text 
                        }} 
                      />
                    ) : (
                      <div className="py-2">
                        <div className="loader scale-[0.35] origin-left"></div>
                      </div>
                    )
                  ) : (
                    <div>{msg.text}</div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0">
                    <User className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Build Video Button after Final Script */}
          {messages.length > 0 && !isLoadingChatHistory && messages[messages.length - 1].role === 'assistant' && !isSubmitting && (
            <div className="flex justify-center pt-2 pb-6 animate-fadeIn">
              <button
                onClick={handleStartWorkflow}
                disabled={isSubmitting}
                className="btn-primary text-sm py-3 px-8 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-1 rounded-xl flex items-center justify-center gap-2"
              >
                <Clapperboard className="w-5 h-5" />
                <span className="font-bold tracking-wider uppercase">Build Video</span>
              </button>
            </div>
          )}

          {/* Embedded Scene Coaster Component */}
          <div className="pt-2 sm:pt-4">
            <SceneCoaster
              scenes={scenes}
              topic={topic}
              estimatedDuration={estimatedDuration}
              selectedSceneId={selectedScene?.id || selectedScene?.number}
              onSelectScene={(scene) => setSelectedScene(scene)}
              onGenerateVideo={handleStartWorkflow}
              isLoading={isSubmitting}
            />
          </div>
        </div>

        {/* Chat Prompt Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800 glass-panel">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Enter topic (e.g. LeetCode Two Sum Solution)..."
                className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-sans shadow-inner pr-8 sm:pr-10"
              />
              <Sparkles className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2.5 sm:py-3 px-3 sm:px-4 font-medium shrink-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>

      {/* Right Drawer Panel */}
      <SceneDrawer
        scene={selectedScene}
        onClose={() => setSelectedScene(null)}
        onUpdateScene={handleUpdateScene}
      />

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Create New Project</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              {modalStep === 1 ? (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Introduction to Calculus"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newProjectName.trim()) setModalStep(2);
                    }}
                  />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setModalStep(2)}
                      disabled={!newProjectName.trim()}
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-4">
                    Select Project Type
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div
                      onClick={() => setNewProjectType('single')}
                      className={`cursor-pointer rounded-lg p-4 border relative ${
                        newProjectType === 'single'
                          ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/50'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {newProjectType === 'single' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 absolute top-2 right-2" />
                      )}
                      <Film className="w-5 h-5 text-blue-500 mb-2" />
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Single Scene</h4>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">One focused animation block.</p>
                    </div>

                    <div
                      onClick={() => setNewProjectType('multi')}
                      className={`cursor-pointer rounded-lg p-4 border relative ${
                        newProjectType === 'multi'
                          ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/50'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {newProjectType === 'multi' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 absolute top-2 right-2" />
                      )}
                      <Clapperboard className="w-5 h-5 text-blue-500 mb-2" />
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Multi Scene</h4>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">Full video with multiple scenes.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button onClick={() => setModalStep(1)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300">
                      Back
                    </button>
                    <button
                      onClick={handleCreateProject}
                      disabled={isCreating}
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Project'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
