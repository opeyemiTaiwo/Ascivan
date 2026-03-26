// src/Pages/ProjectVault.jsx — Completed projects with certificates
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProjectVault = () => {
  const { currentUser } = useAuth();
  const [completedProjects, setCompletedProjects] = useState([]);
  const [disputedProjects, setDisputedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [viewingCert, setViewingCert] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProjects = async () => {
      try {
        const allCompleted = new Map();
        const allDisputed = [];

        // Completed projects where user is a member
        try {
          const memberQ = query(collection(db, 'projects'), where('members', 'array-contains', currentUser.uid), where('status', '==', 'completed'));
          const memberSnap = await getDocs(memberQ);
          memberSnap.docs.forEach(d => allCompleted.set(d.id, { id: d.id, ...d.data(), isOwner: false }));
        } catch (e) { console.log('Member completed query:', e.message); }

        // Completed projects where user is the owner
        try {
          const ownerQ = query(collection(db, 'projects'), where('submitterId', '==', currentUser.uid), where('status', '==', 'completed'));
          const ownerSnap = await getDocs(ownerQ);
          ownerSnap.docs.forEach(d => allCompleted.set(d.id, { id: d.id, ...d.data(), isOwner: true }));
        } catch (e) { console.log('Owner completed query:', e.message); }

        const completed = Array.from(allCompleted.values());
        completed.sort((a, b) => (b.completedAt?.toDate?.() || 0) - (a.completedAt?.toDate?.() || 0));
        setCompletedProjects(completed);

        // Disputed projects — member
        try {
          const dMemberQ = query(collection(db, 'projects'), where('members', 'array-contains', currentUser.uid), where('status', '==', 'awaiting_payment_confirmation'));
          const dMemberSnap = await getDocs(dMemberQ);
          dMemberSnap.docs.forEach(d => {
            const data = { id: d.id, ...d.data() };
            if (Object.values(data.paymentConfirmations || {}).some(c => c.status === 'disputed')) allDisputed.push(data);
          });
        } catch (e) {}

        // Disputed projects — owner
        try {
          const dOwnerQ = query(collection(db, 'projects'), where('submitterId', '==', currentUser.uid), where('status', '==', 'awaiting_payment_confirmation'));
          const dOwnerSnap = await getDocs(dOwnerQ);
          dOwnerSnap.docs.forEach(d => {
            const data = { id: d.id, ...d.data(), isOwner: true };
            if (Object.values(data.paymentConfirmations || {}).some(c => c.status === 'disputed') && !allDisputed.find(p => p.id === d.id)) allDisputed.push(data);
          });
        } catch (e) {}

        setDisputedProjects(allDisputed);
      } catch (e) { console.error('Error fetching projects:', e); }
      setLoading(false);
    };
    fetchProjects();
  }, [currentUser]);

  const toggleHistory = (id) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Find the user's certificate for this project
  const getUserCertificate = (project) => {
    const userDoc = currentUser;
    // Check if user is owner
    if (project.submitterId === currentUser.uid) {
      return {
        role: 'Project Owner',
        projectTitle: project.projectTitle || project.title,
        completedAt: project.completedAt?.toDate?.()?.toLocaleDateString() || 'N/A',
        teamSize: (project.members || []).length,
        isOwner: true,
      };
    }
    // Check completionData for member info
    const evals = project.completionData?.evaluations || project.pendingEvaluations || [];
    const myEval = evals.find(e => e.memberEmail === currentUser.email);
    return {
      role: myEval?.memberRole || 'Team Member',
      projectTitle: project.projectTitle || project.title,
      completedAt: project.completedAt?.toDate?.()?.toLocaleDateString() || 'N/A',
      badgeName: myEval?.badgeCategory || '',
      badgeLevel: myEval?.badgeLevel || '',
      isOwner: false,
    };
  };

  const handleViewCertificate = (project) => {
    setViewingCert(getUserCertificate(project));
  };

  return (
    
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Project Vault</h1>
        <p className="text-gray-500 text-sm mb-6">Your completed projects and earned certificates.</p>

        {/* Certificate Modal */}
        {viewingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingCert(null)}>
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="border-2 border-blue-200 rounded-xl p-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img src="/Images/512X512.png" alt="Loomiqe" className="w-10 h-10" />
                  <span className="text-xl font-bold text-gray-900">Loomiqe</span>
                </div>
                <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-6">Certificate of Completion</p>
                <p className="text-gray-500 text-sm mb-1">This certifies that</p>
                <p className="text-gray-900 text-2xl font-bold mb-1">{currentUser?.displayName || 'Member'}</p>
                <p className="text-gray-500 text-sm mb-4">has successfully completed the project</p>
                <p className="text-blue-600 text-lg font-bold mb-1">"{viewingCert.projectTitle}"</p>
                <p className="text-gray-600 text-sm mb-1">as <span className="font-semibold">{viewingCert.role}</span></p>
                {viewingCert.badgeName && (
                  <p className="text-gray-500 text-xs mt-2">Badge earned: {viewingCert.badgeName} ({viewingCert.badgeLevel})</p>
                )}
                {viewingCert.isOwner && viewingCert.teamSize > 0 && (
                  <p className="text-gray-500 text-xs mt-1">Team size: {viewingCert.teamSize} members</p>
                )}
                <p className="text-gray-400 text-xs mt-4">Completed: {viewingCert.completedAt}</p>
              </div>
              <button onClick={() => setViewingCert(null)} className="mt-4 text-gray-500 text-sm hover:text-gray-700">Close</button>
            </div>
          </div>
        )}

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
          <div className="space-y-6">
            {/* Disputed Projects */}
            {disputedProjects.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Active Disputes
                </h2>
                <div className="space-y-4">
                  {disputedProjects.map(project => (
                    <div key={project.id} className="bg-white border border-red-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-900 font-semibold text-base truncate">{project.title || project.projectTitle || 'Untitled'}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-700 rounded-md flex-shrink-0">Disputed</span>
                      </div>
                      <div className="space-y-2 mt-3">
                        {Object.entries(project.paymentConfirmations || {}).map(([email, data]) => (
                          <div key={email} className={`flex items-center justify-between p-2 rounded-lg text-xs ${data.status === 'disputed' ? 'bg-red-50' : data.status === 'confirmed' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            <span className="text-gray-900 font-medium">{data.name} ({data.role})</span>
                            <span className={`font-semibold ${data.status === 'disputed' ? 'text-red-600' : data.status === 'confirmed' ? 'text-blue-600' : 'text-gray-500'}`}>
                              {data.status === 'disputed' ? 'Disputed' : data.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Dispute History */}
                      {(project.disputeHistory || []).length > 0 && (
                        <div className="mt-3">
                          <button onClick={() => toggleHistory(project.id)} className="text-blue-600 text-xs font-medium hover:underline">
                            {expandedHistory[project.id] ? 'Hide history' : 'View history'}
                          </button>
                          {expandedHistory[project.id] && (
                            <div className="mt-2 space-y-1.5">
                              {project.disputeHistory.map((h, i) => (
                                <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                  <span className="text-gray-700">{h.memberName} — <span className={h.action === 'disputed' ? 'text-red-600 font-semibold' : h.action === 'confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>{h.action}</span></span>
                                  <span className="text-gray-400">{new Date(h.timestamp).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Projects */}
            <div>
              {disputedProjects.length > 0 && <h2 className="text-lg font-bold text-gray-900 mb-3">Completed</h2>}
              <div className="space-y-4">
                {completedProjects.map(project => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900 font-semibold text-base truncate">{project.title || project.projectTitle || 'Untitled Project'}</h3>
                          <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md flex-shrink-0">Completed</span>
                          {project.isOwner && <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">Owner</span>}
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
                      </div>
                    </div>
                    {/* Dispute/Confirmation History */}
                    {(project.disputeHistory || []).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => toggleHistory(project.id)} className="text-blue-600 text-xs font-medium hover:underline">
                          {expandedHistory[project.id] ? 'Hide payment history' : 'View payment history'}
                        </button>
                        {expandedHistory[project.id] && (
                          <div className="mt-2 space-y-1.5">
                            {project.disputeHistory.map((h, i) => (
                              <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                <span className="text-gray-700">{h.memberName} — <span className={h.action === 'disputed' ? 'text-red-600 font-semibold' : h.action === 'confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>{h.action}</span></span>
                                <span className="text-gray-400">{new Date(h.timestamp).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Activity Log */}
                    {(project.activityLog || []).length > 0 && (
                      <div className={`mt-3 pt-3 border-t border-gray-100 ${!(project.disputeHistory || []).length ? '' : ''}`}>
                        <button onClick={() => toggleHistory(`log-${project.id}`)} className="text-gray-500 text-xs font-medium hover:underline">
                          {expandedHistory[`log-${project.id}`] ? 'Hide activity log' : `View activity log (${project.activityLog.length})`}
                        </button>
                        {expandedHistory[`log-${project.id}`] && (
                          <div className="mt-2 space-y-1">
                            {project.activityLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, i) => (
                              <div key={i} className="flex items-start justify-between text-xs p-2 bg-gray-50 rounded gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="text-gray-900 font-medium">{log.actorName}</span>
                                  <span className="text-gray-500"> — {log.description}</span>
                                </div>
                                <span className="text-gray-400 flex-shrink-0 whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default ProjectVault;
