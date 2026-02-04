import React, { useState } from 'react';
import { analyzePoseWithGemini, urlToBase64 } from '../services/geminiService';
import { AppSettings, ExerciseData } from '../types';
import { Upload, Camera, AlertCircle, Check, Loader2, PlayCircle } from 'lucide-react';

interface AnalyzePoseProps {
  settings: AppSettings;
  onAnalysisComplete: (newData: ExerciseData) => void;
}

const AnalyzePose: React.FC<AnalyzePoseProps> = ({ settings, onAnalysisComplete }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setResult(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      setError("Please provide an image first.");
      return;
    }
    if (!settings.apiKey) {
      setError("API Key missing. Please go to Settings.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Determine if it's a data URI or a remote URL
      let base64Data = '';
      if (imageUrl.startsWith('data:')) {
        base64Data = imageUrl.split(',')[1];
      } else {
        base64Data = await urlToBase64(imageUrl);
      }

      const analysis = await analyzePoseWithGemini(
        settings.apiKey,
        settings.selectedModel,
        base64Data,
        settings.systemInstruction
      );

      setResult(analysis);
      
      // Save to "Test Data"
      const newData: ExerciseData = {
        id: Date.now(),
        exercise: analysis.exercise,
        status: analysis.isCorrect ? 'Correct' : 'Incorrect',
        confidence: analysis.score,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
        feedback: analysis.feedback
      };
      
      onAnalysisComplete(newData);

    } catch (err: any) {
      setError(err.message || "Analysis failed. Ensure the image is accessible and API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
             <Camera className="w-5 h-5 text-primary-500" />
             Input Source
           </h2>
           
           <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={imageUrl.startsWith('data:') ? 'File uploaded' : imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setResult(null);
                  }}
                  disabled={imageUrl.startsWith('data:')}
                  placeholder="https://example.com/squat.jpg"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                 <span className="text-xs text-slate-400 font-medium">OR</span>
                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
              </div>

              {/* File Upload */}
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl group-hover:border-primary-500 transition-colors bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2 group-hover:text-primary-500 transition-colors" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Drag & drop or click to upload
                    </p>
                  </div>
                </div>
              </div>
           </div>

           {/* Preview */}
           {imageUrl && (
             <div className="mt-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900 aspect-video relative">
               <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
               <button 
                onClick={() => { setImageUrl(''); setResult(null); }}
                className="absolute top-2 right-2 p-1 bg-slate-900/50 text-white rounded-full hover:bg-red-500/80 transition-colors"
               >
                 <Loader2 className="w-4 h-4" /> 
               </button>
             </div>
           )}

           {/* Action Button */}
           <button 
             onClick={handleAnalyze}
             disabled={loading || !imageUrl}
             className={`w-full mt-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${loading || !imageUrl ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 hover:shadow-primary-500/25'}`}
           >
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
             {loading ? 'Analyzing with Gemini...' : 'Analyze Posture'}
           </button>

           {error && (
             <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
               {error}
             </div>
           )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {result ? (
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-slide-up">
              <div className={`p-6 ${result.isCorrect ? 'bg-emerald-500/10' : 'bg-rose-500/10'} border-b border-slate-100 dark:border-slate-700`}>
                 <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {result.exercise}
                      </h2>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold mt-2 ${result.isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                        {result.isCorrect ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {result.isCorrect ? 'Correct Form' : 'Incorrect Form'}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-800 dark:text-white">{result.score}</div>
                      <div className="text-xs uppercase tracking-wider text-slate-500">Score</div>
                    </div>
                 </div>
              </div>

              <div className="p-6 space-y-6">
                 <div>
                   <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Analysis</h3>
                   <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                     {result.feedback}
                   </p>
                 </div>

                 {result.corrections && result.corrections.length > 0 && (
                   <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                     <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Key Points / Corrections</h3>
                     <ul className="space-y-2">
                       {result.corrections.map((c: string, idx: number) => (
                         <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                           <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></span>
                           {c}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
           </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <ActivityIcon className="w-10 h-10 opacity-20" />
             </div>
             <p className="text-lg font-medium mb-1">Waiting for Analysis</p>
             <p className="text-sm">Upload an image and click analyze to see AI feedback here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for empty state
const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default AnalyzePose;
