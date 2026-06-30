// src/Pages/ProjectVault.jsx - Completed projects with certificates
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import TierBadge from '../components/TierBadge';

// Map a badge category (stored on evaluations) to its badge image in /public/Images.
const BADGE_IMAGES = {
  development: '/Images/TechDev.png',
  'quality-assurance': '/Images/TechQA.png',
  mentorship: '/Images/TechMO.png',
  leadership: '/Images/TechLeads.png',
  design: '/Images/TechArchs.png',
  security: '/Images/TechGuard.png',
};
const getBadgeImage = (category) => BADGE_IMAGES[category] || null;

// Track aliases so we can count badges per track regardless of how category is stored.
const TRACK_ALIASES = {
  development: ['development', 'techdev', 'developer'],
  'quality-assurance': ['quality-assurance', 'techqa', 'quality', 'qa'],
  security: ['security', 'techguard', 'cybersecurity', 'network'],
  leadership: ['leadership', 'techleads', 'leader', 'non-technical'],
  design: ['design', 'techarchs', 'architecture', 'low-code', 'no-code'],
  mentorship: ['mentorship', 'techpo', 'techmo', 'product', 'project-owner'],
};

// Count a user's badges in the same track as `category`, then derive the live tier.
// This matches how the profile/dashboard show level (by count, not frozen value).
const deriveLevel = (badges, category) => {
  const cat = (category || '').toString().toLowerCase();
  // Find which alias group this category belongs to.
  let aliases = [cat];
  for (const [, group] of Object.entries(TRACK_ALIASES)) {
    if (group.includes(cat)) { aliases = group; break; }
  }
  const count = (badges || []).filter(b => {
    const fields = [b.category, b.id, b.title, b.badgeCategory].map(x => (x || '').toString().toLowerCase());
    return aliases.some(a => fields.some(f => f === a || f.includes(a)));
  }).length;
  return count >= 11 ? 'Expert' : count >= 6 ? 'Advanced' : count >= 2 ? 'Associate' : count >= 1 ? 'Novice' : 'Novice';
};

// Tier ring color for the printed certificate (matches TierBadge: steel/bronze/silver/gold).
const tierRingCss = (level) => {
  const k = (level || '').toString().toLowerCase();
  if (k.startsWith('expert')) return 'linear-gradient(135deg,#fcd34d,#d97706)';
  if (k.startsWith('advanc')) return 'linear-gradient(135deg,#e5e7eb,#9ca3af)';
  if (k.startsWith('assoc')) return 'linear-gradient(135deg,#d8975a,#a55b2e)';
  return 'linear-gradient(135deg,#9ca3af,#6b7280)';
};

const ProjectVault = () => {
  const { currentUser } = useAuth();
  const [userBadges, setUserBadges] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [disputedProjects, setDisputedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [viewingCert, setViewingCert] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProjects = async () => {
      try {
        // Load the user's badges so we can derive certificate tier by COUNT
        // (same as the profile/dashboard), not the frozen badgeLevel.
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const uSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (uSnap.exists()) setUserBadges(uSnap.data().badges || []);
        } catch (_) {}
        const allDisputed = [];

        // Fetch ALL projects the user is involved in with just two single-field
        // queries (no composite index needed), then categorize client-side.
        const involved = new Map();
        try {
          const memberSnap = await getDocs(query(collection(db, 'projects'), where('members', 'array-contains', currentUser.uid)));
          memberSnap.docs.forEach(d => involved.set(d.id, { id: d.id, ...d.data(), isOwner: false }));
        } catch (e) { console.log('Member projects query:', e.message); }
        try {
          const ownerSnap = await getDocs(query(collection(db, 'projects'), where('submitterId', '==', currentUser.uid)));
          ownerSnap.docs.forEach(d => involved.set(d.id, { id: d.id, ...d.data(), isOwner: true }));
        } catch (e) { console.log('Owner projects query:', e.message); }

        const all = Array.from(involved.values());

        // Completed + rejected go on the "completed" wall.
        const completed = all
          .filter(p => p.status === 'completed' || p.reviewStatus === 'rejected')
          .map(p => p.reviewStatus === 'rejected' ? { ...p, isRejected: true } : p);

        completed.sort((a, b) => (b.completedAt?.toDate?.() || 0) - (a.completedAt?.toDate?.() || 0));
        setCompletedProjects(completed);

        // Disputed projects (awaiting payment confirmation with a disputed entry).
        all.filter(p => p.status === 'awaiting_payment_confirmation').forEach(data => {
          if (Object.values(data.paymentConfirmations || {}).some(c => c.status === 'disputed')
              && !allDisputed.find(p => p.id === data.id)) {
            allDisputed.push(data);
          }
        });

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
        badgeCategory: 'leadership',
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
      badgeCategory: myEval?.badgeCategory || '',
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
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div id="certificate-content" className="p-8 text-center bg-white">
                <div className="border-2 border-blue-200 rounded-xl p-8">
                  <img src="/Images/512X512.png" alt="Ascivan" className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-6">Certificate of Completion</p>
                  <p className="text-gray-500 text-sm mb-1">This certifies that</p>
                  <p className="text-gray-900 text-2xl font-bold mb-1">{currentUser?.displayName || 'Member'}</p>
                  <p className="text-gray-500 text-sm mb-4">has successfully completed the project</p>
                  <p className="text-blue-600 text-lg font-bold mb-1">"{viewingCert.projectTitle}"</p>
                  <p className="text-gray-600 text-sm mb-1">as <span className="font-semibold">{viewingCert.role}</span></p>
                  {getBadgeImage(viewingCert.badgeCategory) && (
                    <div className="flex justify-center mt-3 mb-1">
                      <TierBadge image={getBadgeImage(viewingCert.badgeCategory)} alt="Badge earned" level={deriveLevel(userBadges, viewingCert.badgeCategory)} size={72} showLabel={true} />
                    </div>
                  )}
                  {viewingCert.badgeName && (
                    <p className="text-gray-500 text-xs mt-2">Badge earned: {viewingCert.badgeName} ({deriveLevel(userBadges, viewingCert.badgeCategory)})</p>
                  )}
                  {viewingCert.isOwner && viewingCert.teamSize > 0 && (
                    <p className="text-gray-500 text-xs mt-1">Team size: {viewingCert.teamSize} members</p>
                  )}
                  <p className="text-gray-400 text-xs mt-4">Completed: {viewingCert.completedAt}</p>
                  <p className="text-gray-300 text-[10px] mt-2">ascivan.com</p>
                </div>
              </div>
              <div className="px-8 pb-6 space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-700 text-xs text-center">Please download and save your certificate. Do not rely on our server for long-term storage.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById('certificate-content');
                      if (!el) return;
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html><head><title>Certificate - ${viewingCert.projectTitle}</title>
                        <style>body{margin:0;padding:40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center}
                        .border{border:2px solid #bfdbfe;border-radius:12px;padding:40px}
                        img{width:64px;height:64px;margin-bottom:12px}
                        .subtitle{color:#2563eb;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:3px;margin-bottom:24px}
                        .label{color:#6b7280;font-size:14px;margin:4px 0}
                        .name{font-size:28px;font-weight:700;color:#111;margin:4px 0}
                        .project{color:#2563eb;font-size:18px;font-weight:700;margin:4px 0}
                        .role{color:#374151;font-size:14px}
                        .meta{color:#9ca3af;font-size:11px;margin-top:16px}
                        .site{color:#d1d5db;font-size:10px;margin-top:8px}
                        </style></head><body>
                        <div class="border">
                        <img src="${window.location.origin}/Images/512X512.png" alt="Ascivan" />
                        <div class="subtitle">Certificate of Completion</div>
                        <div class="label">This certifies that</div>
                        <div class="name">${currentUser?.displayName || 'Member'}</div>
                        <div class="label">has successfully completed the project</div>
                        <div class="project">"${viewingCert.projectTitle}"</div>
                        <div class="role">as <strong>${viewingCert.role}</strong></div>
                        ${getBadgeImage(viewingCert.badgeCategory) ? `<div style="margin:12px auto 4px;width:96px;height:96px;border-radius:9999px;background:${tierRingCss(deriveLevel(userBadges, viewingCert.badgeCategory))};display:flex;align-items:center;justify-content:center;padding:6px;box-sizing:border-box"><div style="width:84px;height:84px;border-radius:9999px;background:#fff;display:flex;align-items:center;justify-content:center"><img src="${window.location.origin}${getBadgeImage(viewingCert.badgeCategory)}" alt="Badge" style="width:70px;height:70px;object-fit:contain" /></div></div>` : ''}
                        ${viewingCert.badgeName ? `<div class="meta">Badge earned: ${viewingCert.badgeName} (${deriveLevel(userBadges, viewingCert.badgeCategory)})</div>` : ''}
                        ${viewingCert.isOwner && viewingCert.teamSize > 0 ? `<div class="meta">Team size: ${viewingCert.teamSize} members</div>` : ''}
                        <div class="meta">Completed: ${viewingCert.completedAt}</div>
                        <div class="site">ascivan.com</div>
                        </div></body></html>
                      `);
                      printWindow.document.close();
                      setTimeout(() => { printWindow.print(); }, 500);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-all"
                  >
                    Download Certificate
                  </button>
                  <button onClick={() => setViewingCert(null)} className="px-4 py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 border border-gray-200 rounded-lg">
                    Close
                  </button>
                </div>
              </div>
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
                                  <span className="text-gray-700">{h.memberName} - <span className={h.action === 'disputed' ? 'text-red-600 font-semibold' : h.action === 'confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>{h.action}</span></span>
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
                          {project.isRejected ? (
                            <span className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-600 rounded-md flex-shrink-0">Rejected</span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md flex-shrink-0">Completed</span>
                          )}
                          {project.isOwner && <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">Owner</span>}
                        </div>
                        <p className="text-gray-400 text-xs">{project.category || 'General'}</p>
                        {project.isRejected ? (
                          <p className="text-red-500 text-xs mt-1">This project was rejected. No certificate was awarded.{project.reviewFeedback ? ` Reviewer note: ${project.reviewFeedback}` : ''}</p>
                        ) : project.completedAt && (
                          <p className="text-gray-400 text-xs mt-1">
                            Completed {project.completedAt?.toDate?.().toLocaleDateString() || ''}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!project.isRejected && (
                          <button
                            onClick={() => handleViewCertificate(project)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                          >
                            View Certificate
                          </button>
                        )}
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
                                <span className="text-gray-700">{h.memberName} - <span className={h.action === 'disputed' ? 'text-red-600 font-semibold' : h.action === 'confirmed' ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>{h.action}</span></span>
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
                                  <span className="text-gray-500"> - {log.description}</span>
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
