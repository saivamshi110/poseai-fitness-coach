import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  ScanLine, 
  Settings as SettingsIcon, 
  Dumbbell,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { ExerciseData, AppSettings, ViewState } from './types';
import Dashboard from './components/Dashboard';
import TrainingData from './components/TrainingData';
import AnalyzePose from './components/AnalyzePose';
import Settings from './components/Settings';

// Mock Data Initialization
const MOCK_DATA: ExerciseData[] = Array.from({ length: 20 }).map((_, i) => ({
  id: 1000 + i,
  exercise: ['Squat', 'Pushup', 'Plank', 'Lunge'][i % 4],
  status: Math.random() > 0.3 ? 'Correct' : 'Incorrect',
  confidence: Math.floor(Math.random() * 20) + 80,
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
  imageUrl: `https://picsum.photos/seed/${i + 123}/400/300`
}));

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
  const [trainingData, setTrainingData] = useState<ExerciseData[]>(MOCK_DATA);
  const [testData, setTestData] = useState<ExerciseData[]>([]);
  
  // Settings State with Persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('poseCoachSettings');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      selectedModel: 'gemini-3-flash-preview',
      systemInstruction: 'You are an expert biomechanics and fitness coach. Analyze the provided image. Identify the exercise. Evaluate the form/posture. Provide a score from 0-100. List specific corrections if needed.',
      theme: 'dark'
    };
  });

  // Effects
  useEffect(() => {
    localStorage.setItem('poseCoachSettings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Handlers
  const handleNewAnalysis = (newData: ExerciseData) => {
    setTestData(prev => [newData, ...prev]);
    // Also add to "All Data" for dashboard stats, assuming test data counts towards analytics
    setTrainingData(prev => [newData, ...prev]);
  };

  const NavItem = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => { setView(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        view === id 
          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${view === id ? 'text-white' : 'group-hover:text-primary-500'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
                PoseAI
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wider">FITNESS COACH</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="training" label="Training Data" icon={Database} />
            <NavItem id="analyze" label="Analyze Pose" icon={ScanLine} />
            <NavItem id="settings" label="Settings" icon={SettingsIcon} />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Current Model</p>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">
                   {settings.selectedModel.split('/')[1] || settings.selectedModel}
                 </span>
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setSidebarOpen(true)}
               className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
             >
               <Menu className="w-6 h-6" />
             </button>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize hidden md:block">
               {view.replace('-', ' ')}
             </h2>
           </div>

           <div className="flex items-center gap-4">
             <button
               onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
               className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
               {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
             </div>
           </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
          <div className="max-w-7xl mx-auto py-8">
            {view === 'dashboard' && <Dashboard data={trainingData} />}
            {view === 'training' && <TrainingData data={trainingData} />}
            {view === 'analyze' && <AnalyzePose settings={settings} onAnalysisComplete={handleNewAnalysis} />}
            {view === 'settings' && <Settings settings={settings} onSave={setSettings} />}
          </div>
        </div>
      </main>

    </div>
  );
};

export default App;