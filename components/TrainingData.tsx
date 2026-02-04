import React from 'react';
import { ExerciseData } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface TrainingDataProps {
  data: ExerciseData[];
}

const TrainingData: React.FC<TrainingDataProps> = ({ data }) => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Training Data</h2>
            <p className="text-slate-500 dark:text-slate-400">Reference dataset used for pose comparison (Mock Data).</p>
        </div>
        <span className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 text-xs font-semibold rounded-full">
            {data.length} Entries
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <div key={item.id} className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="relative h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.exercise} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2' }}
              />
              <div className="absolute top-3 right-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold backdrop-blur-md text-white ${item.status === 'Correct' ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`}>
                   {item.status === 'Correct' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                   {item.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-slate-800 dark:text-white">{item.exercise}</h3>
                 <span className="text-xs font-mono text-slate-400">#{item.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                <span>Confidence</span>
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-primary-500" style={{ width: `${item.confidence}%` }}></div>
                </div>
                <span className="text-xs font-medium ml-2">{item.confidence}%</span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                  {new Date(item.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingData;
