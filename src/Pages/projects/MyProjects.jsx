// src/Pages/projects/MyProjects.jsx - View projects you applied to or created

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const formatTimeline = (t) => ({ '1-week': '1 Week', '2-weeks': '2 Weeks', '1-month': '1 Month', '2-3-months': '2-3 Months', '3-6-months': '3-6 Months', '6-months-plus': '6+ Months', 'flexible': 'Flexible' }[t] || t);

const statusColors = {
  submitted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  removed: 'bg-red-500/20 text-red-300 border-red-500/30',
  completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const MyProjects = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [postedProjects, setPostedProjects] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('applied'); // 'applied' | 'posted' | 'badges'
  const [projectFilter, setProjectFilter] = useState('ongoing'); // 'ongoing' | 'completed'

  // Filter applications based on toggle — completed means the project application has status indicating completion
  const filteredApplications = applications.filter(app => {
    if (projectFilter === 'completed') {
      return app.status === 'completed' || app.completionStatus;
    }
    return app.status !== 'completed' && !app.completionStatus;
  });

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }

    // Fetch applications
    const appQ = query(collection(db, 'project_applications'), where('applicantEmail', '==', currentUser.email));
    const unsubApps = onSnapshot(appQ, async (snap) => {
      const apps = [];
      for (const d of snap.docs) {
        const app = { id: d.id, ...d.data() };
        // Fetch project details
        try {
          const projQ = query(collection(db, 'projects'), where('__name__', '==', app.projectId));
          // Direct doc get would be better but onSnapshot doesn't support it easily
          app.projectDetails = null; // Will be fetched inline
        } catch (e) {}
        apps.push(app);
      }
      apps.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      setApplications(apps);
      setLoading(false);
    });

    // Fetch posted projects
    const postQ = query(collection(db, 'projects'), where('submitterEmail', '==', currentUser.email));
    const unsubPosts = onSnapshot(postQ, (snap) => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      posts.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      setPostedProjects(posts);
    });

    // Fetch badges
    const badgeQ = query(collection(db, 'member_badges'), where('memberEmail', '==', currentUser.email));
    const unsubBadges = onSnapshot(badgeQ, (snap) => {
      const b = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      b.sort((a, b) => (b.awardedAt?.toDate?.() || 0) - (a.awardedAt?.toDate?.() || 0));
      setBadges(b);
    });

    return () => { unsubApps(); unsubPosts(); unsubBadges(); };
  }, [currentUser]);

  if (loading) {
    return (
      <><Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden pt-20 sm:pt-24" style={{ backgroundColor: '#000' }}>
        <main className="pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">

            {/* Centered Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: '"Inter", sans-serif' }}>
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-500">Projects</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Track your applications, posted projects, and earned badges</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { id: 'applied', label: `Applied (${applications.length})` },
                { id: 'posted', label: `Posted (${postedProjects.length})` },
                { id: 'badges', label: `Badges (${badges.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2 min-h-[40px] rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    tab === t.id ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Applied Tab */}
            {tab === 'applied' && (
              <>
                <div className="flex justify-center gap-2 mb-4">
                  <button onClick={() => setProjectFilter('ongoing')}
                    className={`px-4 py-2 min-h-[36px] rounded-lg text-xs font-semibold transition-all ${projectFilter === 'ongoing' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    Ongoing
                  </button>
                  <button onClick={() => setProjectFilter('completed')}
                    className={`px-4 py-2 min-h-[36px] rounded-lg text-xs font-semibold transition-all ${projectFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    Completed
                  </button>
                </div>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-400 text-lg font-semibold mb-2">
                      {projectFilter === 'completed' ? 'Completed projects are displayed here' : 'Ongoing projects are displayed here'}
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      {applications.length === 0 ? 'Browse projects and apply to get started' : `No ${projectFilter} projects found`}
                    </p>
                    {applications.length === 0 && (
                      <Link to="/projects" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl text-sm">Browse Projects</Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApplications.map(app => (
                      <Link key={app.id} to={`/projects/${app.projectId}`}
                        className="block bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="text-white font-semibold text-sm">{app.projectTitle}</p>
                            <p className="text-gray-500 text-xs mt-0.5">Applied as: {app.role}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[app.status] || 'bg-white/10 text-gray-300 border-white/20'}`}>
                            {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Posted Tab */}
            {tab === 'posted' && (
              postedProjects.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg font-semibold mb-2">No posted projects</p>
                  <p className="text-gray-500 text-sm mb-6">Create your first project</p>
                  <Link to="/projects/submit" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl text-sm">Post a Project</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {postedProjects.map(project => (
                    <Link key={project.id} to={`/projects/${project.id}`}
                      className="block bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-white font-semibold text-sm">{project.projectTitle}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-gray-500 text-xs">{formatTimeline(project.timeline)}</span>
                            <span className={`text-xs font-bold ${project.pricingType === 'paid' ? 'text-orange-300' : 'text-green-300'}`}>
                              {project.pricingType === 'paid' ? `$${project.totalBudget?.toLocaleString()}` : 'Free'}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${project.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
                          {project.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Badges Tab */}
            {tab === 'badges' && (
              badges.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg font-semibold mb-2">No badges earned yet</p>
                  <p className="text-gray-500 text-sm">Complete projects to earn tech badges</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {badges.map(badge => (
                    <div key={badge.id} className="bg-white/5 border border-white/20 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{badge.badgeName}</p>
                          <p className="text-gray-400 text-xs">Level: {badge.badgeLevel} -- {badge.projectTitle}</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">{badge.awardedAt?.toDate ? new Date(badge.awardedAt.toDate()).toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        </main>
      </div>
    </>
  );
};

export default MyProjects;
