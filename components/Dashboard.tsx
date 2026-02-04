import React from 'react';
import { ExerciseData } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Activity, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  data: ExerciseData[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Compute Stats
  const totalAnalyzed = data.length;
  const correctCount = data.filter(d => d.status === 'Correct').length;
  const accuracy = totalAnalyzed ? Math.round((correctCount / totalAnalyzed) * 100) : 0;
  
  // Data for Charts
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  const pieData = [
    { name: 'Correct Poses', value: correctCount },
    { name: 'Incorrect Poses', value: totalAnalyzed - correctCount },
  ];
  
  const COLORS = ['#10b981', '#ef4444'];

  const StatCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-slate-800 dark:text-white">{value}</h3>
          {subText && <p className="text-xs text-slate-400 mt-1">{subText}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-6">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Analyzed" 
          value={totalAnalyzed} 
          icon={Activity} 
          color="bg-blue-500"
          subText="Lifetime sessions"
        />
        <StatCard 
          title="Avg Accuracy" 
          value={`${accuracy}%`} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
          subText="Form correctness"
        />
        <StatCard 
          title="Avg Confidence" 
          value={`${Math.round(data.reduce((acc, curr) => acc + curr.confidence, 0) / (totalAnalyzed || 1))}%`} 
          icon={TrendingUp} 
          color="bg-purple-500"
          subText="AI certainty"
        />
        <StatCard 
          title="Issues Detected" 
          value={totalAnalyzed - correctCount} 
          icon={AlertTriangle} 
          color="bg-amber-500"
          subText="Requires correction"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Confidence History</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sortedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.1} />
                <XAxis dataKey="id" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Form Distribution</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
