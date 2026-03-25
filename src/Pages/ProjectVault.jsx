// src/Pages/ProjectVault.jsx — Completed projects with certificates
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProjectVault = () => {
  const { currentUser } = useAuth();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCompleted = async () => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('members', 'array-contains', currentUser.uid),
          where('status', '==', 'completed')
        );
        const snap = await getDocs(q);
        const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        projects.sort((a, b) => (b.completedAt?.toDate?.() || 0) - (a.completedAt?.toDate?.() || 0));
        setCompletedProjects(projects);
      } catch (e) {
        console.error('Error fetching completed projects:', e);
      }
      setLoading(false);
    };
    fetchCompleted();
  }, [currentUser]);

  const handleViewCertificate = (project) => {
    // Certificate could be a stored URL or generated
    if (project.certificateUrl) {
      window.open(project.certificateUrl, '_blank');
    } else {
      alert('Certificate will be available once the project owner finalizes it.');
    }
  };

  const handleDownloadCertificate = (project) => {
    if (project.certificateUrl) {
      const link = document.createElement('a');
      link.href = project.certificateUrl;
      link.download = `${project.title || 'project'}-certificate.pdf`;
      link.click();
    }
  };

  return (
    
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Project Vault</h1>
        <p className="text-gray-500 text-sm mb-6">Your completed projects and earned certificates.</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : completedProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-900 font-semibold text-lg mb-2">No completed projects yet</p>
            <p className="text-gray-400 text-sm mb-4">Complete your first project to see it here with a certificate.</p>
            <a href="/projects" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">Browse Projects</a>
          </div>
        ) : (
          <div className="space-y-4">
            {completedProjects.map(project => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900 font-semibold text-base truncate">{project.title || 'Untitled Project'}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md flex-shrink-0">Completed</span>
                    </div>
                    <p className="text-gray-400 text-xs">{project.category || 'General'}</p>
                    {project.completedAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        Completed {project.completedAt?.toDate?.().toLocaleDateString() || ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewCertificate(project)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                    >
                      View Certificate
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(project)}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
  );
};

export default ProjectVault;
