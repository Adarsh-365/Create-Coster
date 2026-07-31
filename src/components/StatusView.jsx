import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RefreshCw } from 'lucide-react';
import { getAllProjectsStatusApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const getStatusBadgeColor = (status) => {
  const s = (status || '').toUpperCase();
  if (['QUEUED', 'INITIALIZING'].includes(s)) {
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
  if (['GENERATING_SCRIPT', 'PLANNING_SCENES'].includes(s)) {
    return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
  }
  if (['GENERATING_MANIM_CODE', 'VALIDATING_CODE'].includes(s)) {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
  }
  if (['RENDERING_SCENES', 'MERGING_VIDEOS'].includes(s)) {
    return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
  }
  if (['POST_PROCESSING', 'UPLOADING'].includes(s)) {
    return 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400';
  }
  if (['COMPLETED', 'SUCCESS'].includes(s)) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
  }
  if (['FAILED', 'ERROR'].includes(s)) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
  }
  return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400';
};

const getProgress = (project) => {
  if (project.progress && project.progress !== '0%') return project.progress;
  const s = (project.status || '').toUpperCase();
  const progressMap = {
    'QUEUED': '0%',
    'INITIALIZING': '5%',
    'GENERATING_SCRIPT': '10%',
    'PLANNING_SCENES': '20%',
    'GENERATING_MANIM_CODE': '35%',
    'VALIDATING_CODE': '55%',
    'RENDERING_SCENES': '65%',
    'MERGING_VIDEOS': '80%',
    'POST_PROCESSING': '90%',
    'UPLOADING': '95%',
    'COMPLETED': '100%'
  };
  return progressMap[s] || project.progress || '0%';
};

export default function StatusView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllProjectsStatusApi(user.id);
      const rawList = data?.project_list || data?.projects || data?.data || (Array.isArray(data) ? data : []);
      const projectList = rawList.map(p => {
        if (Array.isArray(p)) {
          return {
            id: p[0],
            user_id: p[1],
            name: p[2],
            timestamp: p[3],
            stage: p[4],
            progress: p[5],
            status: p[6]
          };
        }
        return p;
      });
      setProjects(projectList);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch projects status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStatus();
    }
  }, [user?.id]);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 sm:p-6 md:p-10 flex flex-col transition-colors duration-200">
      <div className="max-w-6xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-slate-200 dark:border-zinc-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Projects Status</h1>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
              List of all your projects and their current status
            </p>
          </div>
          <button 
            onClick={fetchStatus} 
            disabled={isLoading}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Projects List */}
        <div className="glass-card rounded-xl overflow-hidden bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Time</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Stage</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Progress</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {isLoading && projects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                      Loading...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  projects.map((project, idx) => (
                    <tr key={project.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                        {project.project_name || project.name || 'Unnamed Project'}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-zinc-400">
                        {project.timestamp ? new Date(project.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-zinc-400">
                        {project.stage || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-zinc-400">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 max-w-[80px]">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: getProgress(project) }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium w-8">{getProgress(project)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${getStatusBadgeColor(project.status)}`}>
                          {project.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <button className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
