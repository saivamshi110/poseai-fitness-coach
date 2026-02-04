import React, { useState } from 'react';
import { Save, RefreshCw, Key, Cpu, FileText } from 'lucide-react';
import { AppSettings, AIModel } from '../types';
import { fetchSupportedModels } from '../services/geminiService';

interface SettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleFetchModels = async () => {
    if (!localSettings.apiKey) {
      setStatusMsg('Please enter an API Key first.');
      return;
    }
    setLoadingModels(true);
    setStatusMsg('');
    try {
      const fetched = await fetchSupportedModels(localSettings.apiKey);
      if (fetched.length > 0) {
        setModels(fetched);
        setLocalSettings(prev => ({ ...prev, selectedModel: fetched[0].name }));
        setStatusMsg(`Success! Found ${fetched.length} models.`);
      } else {
        // Fallback message if fetch returns empty (which we handled in service to not throw)
        setStatusMsg('Could not fetch models automatically. Using default list.');
      }
    } catch (e: any) {
      setStatusMsg(`Error: ${e.message || 'Check API Key'}`);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = () => {
    const trimmedSettings = {
        ...localSettings,
        apiKey: localSettings.apiKey.trim()
    };
    onSave(trimmedSettings);
    setLocalSettings(trimmedSettings);
    setStatusMsg('Settings saved successfully!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-6">
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
            <Cpu className="w-6 h-6 text-primary-500" />
            Configuration
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your AI connection and coaching parameters.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* API Key Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Google Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={localSettings.apiKey}
                onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                placeholder="Enter your AI Studio API Key"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
            <p className="text-xs text-slate-500">
              Your key is stored locally in your browser. We do not transmit it to any backend server.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                AI Model
              </label>
              <button
                onClick={handleFetchModels}
                disabled={loadingModels}
                className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loadingModels ? 'animate-spin' : ''}`} />
                {loadingModels ? 'Fetching...' : 'Refresh Models'}
              </button>
            </div>
            
            <div className="relative">
              <select
                value={localSettings.selectedModel}
                onChange={(e) => setLocalSettings({ ...localSettings, selectedModel: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none dark:text-white"
              >
                 {/* Always show models if fetched, otherwise show defaults */}
                 {models.length > 0 ? (
                   models.map(m => <option key={m.name} value={m.name}>{m.displayName} ({m.name})</option>)
                 ) : (
                   <>
                    <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Recommended)</option>
                    <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                   </>
                 )}
              </select>
            </div>
          </div>

          {/* System Instruction */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              System Instruction (Context Injection)
            </label>
            <textarea
              value={localSettings.systemInstruction}
              onChange={(e) => setLocalSettings({ ...localSettings, systemInstruction: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white text-sm font-mono"
            />
          </div>

        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className={`text-sm font-medium ${statusMsg.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {statusMsg}
            </span>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-lg shadow-lg shadow-primary-500/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;