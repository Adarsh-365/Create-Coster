import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Sliders, Key, Keyboard, ShieldAlert, Monitor, Sun, Moon } from 'lucide-react';
import type { SettingsState } from './Types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onSaveSettings: (settings: SettingsState) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<'appearance' | 'chat' | 'keys' | 'shortcuts' | 'privacy'>('appearance');
  const [localSettings, setLocalSettings] = React.useState<SettingsState>({ ...settings });

  React.useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings, isOpen]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const updateApiKey = (provider: keyof SettingsState['apiKeys'], value: string) => {
    const updated = {
      ...localSettings,
      apiKeys: {
        ...localSettings.apiKeys,
        [provider]: value
      }
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-3xl h-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex overflow-hidden z-10 font-sans"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Left Navigation */}
          <div className="w-60 bg-slate-50 dark:bg-slate-950/40 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-1">
            <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Settings</h2>
            
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'appearance'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Palette size={18} />
              Appearance
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'chat'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Sliders size={18} />
              System Settings
            </button>

            <button
              onClick={() => setActiveTab('keys')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'keys'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Key size={18} />
              API Providers
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'shortcuts'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Keyboard size={18} />
              Shortcuts
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'privacy'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert size={18} />
              Privacy & Data
            </button>
          </div>

          {/* Right Contents */}
          <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">Appearance Settings</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Configure visual themes, fonts, and language setups.</p>
                </div>

                {/* Theme selection */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-semibold">Theme Mode</span>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => updateSetting('theme', 'light')}
                      className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-xl transition-all ${
                        localSettings.theme === 'light'
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      <Sun size={20} />
                      <span className="text-xs font-semibold">Light</span>
                    </button>
                    <button
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-xl transition-all ${
                        localSettings.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      <Moon size={20} />
                      <span className="text-xs font-semibold">Dark</span>
                    </button>
                    <button
                      onClick={() => updateSetting('theme', 'system')}
                      className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-xl transition-all ${
                        localSettings.theme === 'system'
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      <Monitor size={20} />
                      <span className="text-xs font-semibold">System</span>
                    </button>
                  </div>
                </div>

                {/* Font Size switcher */}
                <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Font Size</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Scales the conversation reading view.</span>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => updateSetting('fontSize', sz)}
                        className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-all ${
                          localSettings.fontSize === sz
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language switcher */}
                <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Preferred Language</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Interface and primary AI target language.</span>
                  </div>
                  <select
                    value={localSettings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="English">English (US)</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                    <option value="German">Deutsch</option>
                    <option value="Chinese">中文</option>
                    <option value="Japanese">日本語</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">System & Chat Parameters</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Configure response parameters and caching mechanisms.</p>
                </div>

                {/* Streaming toggle */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Response Streaming</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Stream out answers character-by-character.</span>
                  </div>
                  <button
                    onClick={() => updateSetting('streaming', !localSettings.streaming)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      localSettings.streaming ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      localSettings.streaming ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Auto save toggle */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Auto-Save Conversations</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Saves message streams into history logs.</span>
                  </div>
                  <button
                    onClick={() => updateSetting('autoSave', !localSettings.autoSave)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      localSettings.autoSave ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      localSettings.autoSave ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Shared context memory toggle */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Shared Memory</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Allow model to remember preferences across chats.</span>
                  </div>
                  <button
                    onClick={() => updateSetting('memoryEnabled', !localSettings.memoryEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      localSettings.memoryEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      localSettings.memoryEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Notifications toggle */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Sound Notifications</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Chime on response finished.</span>
                  </div>
                  <button
                    onClick={() => updateSetting('notifications', !localSettings.notifications)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      localSettings.notifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      localSettings.notifications ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">API Key Management</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Configure key values to bypass default trial limits.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">OpenAI API Key</label>
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={localSettings.apiKeys.openai}
                      onChange={(e) => updateApiKey('openai', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Anthropic API Key</label>
                    <input
                      type="password"
                      placeholder="sk-ant-..."
                      value={localSettings.apiKeys.anthropic}
                      onChange={(e) => updateApiKey('anthropic', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Google Gemini Key</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={localSettings.apiKeys.gemini}
                      onChange={(e) => updateApiKey('gemini', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">DeepSeek Key</label>
                    <input
                      type="password"
                      placeholder="ds-..."
                      value={localSettings.apiKeys.deepseek}
                      onChange={(e) => updateApiKey('deepseek', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">Keyboard Shortcuts</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Accelerate your navigation using direct mapping commands.</p>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Toggle Sidebar</span>
                    <kbd className="bg-slate-100 dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold">Ctrl + \\</kbd>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Toggle Right Panel</span>
                    <kbd className="bg-slate-100 dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold">Ctrl + J</kbd>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Search Conversations</span>
                    <kbd className="bg-slate-100 dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold">Ctrl + K</kbd>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Start New Chat</span>
                    <kbd className="bg-slate-100 dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold">Ctrl + N</kbd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Open Settings</span>
                    <kbd className="bg-slate-100 dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold">Ctrl + ,</kbd>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">Privacy & Security</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Control data caching and conversation logging retention.</p>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Store Conversations Locally</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">History will persist on device storage.</span>
                    </div>
                    <button
                      onClick={() => updateSetting('historyEnabled', !localSettings.historyEnabled)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        localSettings.historyEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        localSettings.historyEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 py-1">
                    <span className="text-sm font-semibold">Data Control actions</span>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold transition-colors">
                        Delete Local Cache
                      </button>
                      <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors">
                        Export Conversations (JSON)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
