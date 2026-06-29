// src/Pages/user/dashboard.jsx - Dashboard Overview
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PremiumBadge } from '../../components/PremiumBadge';
import FindFirstProject from '../../components/FindFirstProject';
import DiscoverTrack from '../../components/DiscoverTrack';

const badgeData = [
  { id: 'techmo', title: 'TechPO', image: '/Images/TechMO.png', label: 'Product / Project Owner' },
  { id: 'techqa', title: 'TechQA', image: '/Images/TechQA.png', label: 'Quality Assurance' },
  { id: 'techdev', title: 'TechDev', image: '/Images/TechDev.png', label: 'Development' },
  { id: 'techleads', title: 'TechLeads', image: '/Images/TechLeads.png', label: 'Non-Technical Roles' },
  { id: 'techarchs', title: 'TechArchs', image: '/Images/TechArchs.png', label: 'Low/No-Code Developer' },
  { id: 'techguard', title: 'TechGuard', image: '/Images/TechGuard.png', label: 'Cybersecurity' },
];

const DashboardOverview = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ projectsCompleted: 0, ongoingProjects: 0, badgesEarned: 0 });
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membershipPlan, setMembershipPlan] = useState('Free');
  const [userRole, setUserRole] = useState('member');
  const isPremiumUser = membershipPlan === 'Premium' || userRole === 'admin';

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      try {
        // Fetch profile
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData(data);
          setMembershipPlan(data.membershipPlan || 'Free');
          setUserRole(data.role || 'member');
          setStats(prev => ({ ...prev, badgesEarned: (data.badges || []).length }));
        }

        // Fetch ongoing projects (single where to avoid composite index; filter+sort in JS)
        try {
          const projectsQ = query(
            collection(db, 'projects'),
            where('members', 'array-contains', currentUser.uid)
          );
          const projectsSnap = await getDocs(projectsQ);
          const projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.status === 'active')
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, 5);
          setOngoingProjects(projects);
          setStats(prev => ({ ...prev, ongoingProjects: projects.length }));
        } catch (e) {
          console.log('Projects query skipped:', e.message);
        }

        // Fetch completed projects (single where; filter in JS)
        try {
          const completedQ = query(
            collection(db, 'projects'),
            where('members', 'array-contains', currentUser.uid)
          );
          const completedSnap = await getDocs(completedQ);
          const completedList = completedSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.status === 'completed');
          setCompletedProjects(completedList.slice(0, 5));
          setStats(prev => ({ ...prev, projectsCompleted: completedList.length }));
        } catch (e) {
          console.log('Completed projects query skipped:', e.message);
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

        {/* Cold-start: nudge unfinished Foundations first (learn, then projects). */}
        {!loading && !profileData?.isCompany && ongoingProjects.length === 0 && completedProjects.length === 0 &&
          !(profileData?.foundationsComplete && profileData.foundationsComplete[profileData?.primarySkillTrack]) && (
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Start with your Foundations</h2>
            <p className="text-gray-600 text-sm mb-4">Before you join a project, complete a short set of foundational lessons for your track. It only takes a little while, and then you'll be ready to contribute.</p>
            <button onClick={() => navigate('/foundations')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all">
              Go to Foundations
            </button>
          </div>
        )}

        {/* Cold-start: show "find your first project" only if the user has joined none yet. */}
        {!loading && ongoingProjects.length === 0 && completedProjects.length === 0 && !profileData?.isCompany && (
          <FindFirstProject profile={profileData} />
        )}

        {/* Help users who haven't settled on a track (new to tech or unsure) discover one. */}
        {!loading && !profileData?.isCompany && !profileData?.primarySkillTrack && ongoingProjects.length === 0 && completedProjects.length === 0 && (
          <div className="mb-6">
            <DiscoverTrack />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-gray-500 text-sm mb-1">Projects Completed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.projectsCompleted}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-gray-500 text-sm mb-1">Ongoing Projects</p>
            <p className="text-3xl font-bold text-gray-900">{stats.ongoingProjects}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-gray-500 text-sm mb-1">Badges Earned</p>
            <p className="text-3xl font-bold text-gray-900">{stats.badgesEarned}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-gray-500 text-sm mb-1">Talent Board</p>
            <p className="text-3xl font-bold text-gray-900">{stats.badgesEarned > 0 ? 'Listed' : '-'}</p>
            <p className="text-gray-400 text-xs mt-1">{stats.badgesEarned > 0 ? 'Recruiters can find you' : 'Earn a badge to get listed'}</p>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join a Project CTA */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Join a project</h3>
              <p className="text-gray-600 text-sm mb-4">Browse active projects looking for collaborators. Earn badges by completing real-world work.</p>
              <button onClick={() => navigate('/projects')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                Browse Projects
              </button>
            </div>

            {/* Ongoing Projects */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Ongoing Projects</h3>
                <Link to="/projects/my-projects" className="text-blue-600 text-sm font-medium hover:underline">See All</Link>
              </div>
              {ongoingProjects.length === 0 ? (
                <p className="text-gray-400 text-sm">No ongoing projects. Browse projects to get started.</p>
              ) : (
                <div className="space-y-3">
                  {ongoingProjects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-900 text-sm font-medium truncate">{project.projectTitle || project.title || 'Untitled Project'}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{project.industryTrack || project.category || 'General'}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md flex-shrink-0 ml-3">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Projects */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Completed Projects</h3>
                <Link to="/project-vault" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
              </div>
              {completedProjects.length === 0 ? (
                <p className="text-gray-400 text-sm">No completed projects yet. Finish a project to see it here.</p>
              ) : (
                <div className="space-y-3">
                  {completedProjects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-900 text-sm font-medium truncate">{project.projectTitle || project.title || 'Untitled Project'}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{project.industryTrack || project.category || 'General'}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md flex-shrink-0 ml-3">Completed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Your Badges */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your Badges</h3>
              <p className="text-gray-500 text-xs mb-4">Earn badges by completing projects in each track.</p>

              {/* Badge Levels */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4 p-2.5 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-[10px] font-medium mr-0.5">Levels:</p>
                {['Novice', 'Associate', 'Advanced', 'Expert'].map((level, i) => (
                  <span key={level} className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    i === 0 ? 'bg-blue-50 text-blue-600' :
                    i === 1 ? 'bg-blue-100 text-blue-700' :
                    i === 2 ? 'bg-orange-50 text-orange-600' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {level}
                  </span>
                ))}
              </div>

              {/* All 6 Badges */}
              <div className="space-y-3">
                {badgeData.map((badge) => {
                  const earned = profileData?.badges?.find(b => b.id === badge.id || b.title === badge.title);
                  return (
                    <div key={badge.id} className={`flex items-center gap-3 p-3 rounded-lg border ${earned ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                      <img src={badge.image} alt={badge.title} className={`w-10 h-10 flex-shrink-0 ${earned ? '' : 'opacity-40 grayscale'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold ${earned ? 'text-gray-900' : 'text-gray-400'}`}>{badge.title}</p>
                          {earned && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">{earned.level || 'Novice'}</span>
                          )}
                        </div>
                        <p className={`text-xs ${earned ? 'text-gray-600' : 'text-gray-400'}`}>{badge.label}</p>
                      </div>
                      {earned ? (
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-gray-300 text-xs flex-shrink-0">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Current Plan</h3>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-blue-600 font-semibold text-lg">{membershipPlan} Plan</p>
                {isPremiumUser && <PremiumBadge size="md" />}
              </div>
              <p className="text-gray-400 text-xs mb-3">{!isPremiumUser ? 'Unlimited collaborative projects, all badge tracks, Proof Wall, and messaging.' : 'Priority Talent Board ranking, verified company badge, unlimited job posts, priority support.'}</p>
              {!isPremiumUser && (
                <button onClick={() => navigate('/settings?tab=membership')} className="text-blue-600 text-sm font-medium hover:underline">
                  Upgrade to Premium
                </button>
              )}
              {isPremiumUser && (
                <p className="text-gray-500 text-xs mt-2">Priority support: <a href="mailto:info.ascivan@gmail.com" className="text-blue-600 hover:underline">info.ascivan@gmail.com</a></p>
              )}
            </div>

            {/* Talent Board - Premium only */}
            {isPremiumUser && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                  Talent Board
                  <PremiumBadge size="sm" />
                </h3>
                <p className="text-gray-600 text-xs mb-3">You're visible to recruiters and companies on the Talent Board.</p>
                <Link to="/talent-board" className="text-blue-600 text-sm font-medium hover:underline">View Talent Board</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    
  );
};

export default DashboardOverview;
