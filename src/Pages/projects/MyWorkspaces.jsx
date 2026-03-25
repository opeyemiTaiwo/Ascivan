// src/Pages/projects/MyWorkspaces.jsx — List of member's active project workspaces
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MyWorkspaces = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProjects = async () => {
      try {
        // Fetch projects where user is a member and status is active or awaiting payment
        const q = query(
          collection(db, 'projects'),
          where('members', 'array-contains', currentUser.uid),
        );
        const snap = await getDocs(q);
        const active = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => p.status === 'active' || p.status === 'awaiting_payment_confirmation');
        active.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        setProjects(active);
      } catch (e) { console.error('Error fetching workspaces:', e); }
      setLoading(false);
    };
    fetchProjects();
  }, [currentUser]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Workspaces</h1>
      <p className="text-gray-500 text-sm mb-6">Your active and approved project workspaces.</p>

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-gray-900 font-semibold mb-1">No active workspaces</p>
          <p className="text-gray-500 text-sm mb-4">Join a project to access its workspace.</p>
          <button onClick={() => navigate('/projects')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all">
            Browse Projects
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}/workspace`)}
              className="bg-white border border-blue-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-gray-900 font-semibold text-sm truncate">{project.projectTitle || project.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{project.category || project.industryTrack || 'General'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${project.status === 'active' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                    {project.status === 'active' ? 'Active' : 'Awaiting Payment'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWorkspaces;
