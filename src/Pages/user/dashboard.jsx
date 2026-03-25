// src/Pages/user/dashboard.jsx — Dashboard Overview
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

const badgeData = [
  { id: 'techmo', title: 'TechMO', image: '/Images/TechMO.png', label: 'Project Management' },
  { id: 'techqa', title: 'TechQA', image: '/Images/TechQA.png', label: 'Quality Assurance' },
  { id: 'techdev', title: 'TechDev', image: '/Images/TechDev.png', label: 'Development' },
  { id: 'techleads', title: 'TechLeads', image: '/Images/TechLeads.png', label: 'Leadership' },
  { id: 'techarchs', title: 'TechArchs', image: '/Images/TechArchs.png', label: 'Architecture' },
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
  const [earnings, setEarnings] = useState({ pending: 0, earned: 0, total: 0 });

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
          setStats(prev => ({ ...prev, badgesEarned: (data.badges || []).length }));
        }

        // Fetch ongoing projects
        try {
          const projectsQ = query(
            collection(db, 'projects'),
            where('members', 'array-contains', currentUser.uid),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const projectsSnap = await getDocs(projectsQ);
          const projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setOngoingProjects(projects);
          setStats(prev => ({ ...prev, ongoingProjects: projects.length }));
        } catch (e) {
          console.log('Projects query needs index, skipping:', e.message);
        }

        // Fetch completed projects count
        try {
          const completedQ = query(
            collection(db, 'projects'),
            where('members', 'array-contains', currentUser.uid),
            where('status', '==', 'completed')
          );
          const completedSnap = await getDocs(completedQ);
          const completedList = completedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setCompletedProjects(completedList.slice(0, 5));
          setStats(prev => ({ ...prev, projectsCompleted: completedSnap.size }));

          // Calculate earned from completed paid projects
          let earnedTotal = 0;
          completedSnap.docs.forEach(d => {
            const budget = parseFloat(d.data().budget || d.data().payment || 0);
            if (budget > 0) earnedTotal += budget;
          });
          setEarnings(prev => ({ ...prev, earned: earnedTotal, total: prev.pending + earnedTotal }));
        } catch (e) {
          console.log('Completed projects query skipped:', e.message);
        }

        // Calculate pending from active paid projects
        try {
          const activeQ = query(
            collection(db, 'projects'),
            where('members', 'array-contains', currentUser.uid),
            where('status', '==', 'active')
          );
          const activeSnap = await getDocs(activeQ);
          let pendingTotal = 0;
          activeSnap.docs.forEach(d => {
            const budget = parseFloat(d.data().budget || d.data().payment || 0);
            if (budget > 0) pendingTotal += budget;
          });
          setEarnings(prev => ({ ...prev, pending: pendingTotal, total: prev.earned + pendingTotal }));
        } catch (e) {
          console.log('Active earnings query skipped:', e.message);
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
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
            <p className="text-gray-500 text-sm mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">${earnings.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Earnings Overview */}
        {(earnings.pending > 0 || earnings.earned > 0) && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <h3 className="text-base font-bold text-gray-900 mb-4">Earnings Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-700 text-xs font-medium mb-1">Pending</p>
                <p className="text-xl font-bold text-orange-700">${earnings.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-orange-600 text-xs mt-1">From active projects</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-xs font-medium mb-1">Earned</p>
                <p className="text-xl font-bold text-blue-700">${earnings.earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-blue-600 text-xs mt-1">From completed projects</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-xs font-medium mb-1">Total</p>
                <p className="text-xl font-bold text-blue-700">${earnings.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-blue-600 text-xs mt-1">Pending + Earned</p>
              </div>
            </div>
          </div>
        )}

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
                        <p className="text-gray-900 text-sm font-medium truncate">{project.title || 'Untitled Project'}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{project.category || 'General'}</p>
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
                        <p className="text-gray-900 text-sm font-medium truncate">{project.title || 'Untitled Project'}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{project.category || 'General'}</p>
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
            {/* Current Badge Level */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Your Badges</h3>
              {profileData?.badges && profileData.badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profileData.badges.map((badge, i) => {
                    const bd = badgeData.find(b => b.id === badge.id || b.title === badge.title);
                    return (
                      <div key={i} className="text-center p-2">
                        <img src={bd?.image || '/Images/TechDev.png'} alt={badge.title} className="w-10 h-10 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 font-medium">{badge.level || 'Novice'}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Complete projects to earn your first badge.</p>
              )}
            </div>

            {/* Plan */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Current Plan</h3>
              <p className="text-blue-600 font-semibold text-lg mb-1">{membershipPlan} Plan</p>
              <p className="text-gray-400 text-xs mb-3">{membershipPlan === 'Free' ? 'Access to projects, community, and badges.' : 'Full access including hiring, smart match, and premium badges.'}</p>
              {membershipPlan === 'Free' && (
                <button onClick={() => navigate('/settings?tab=membership')} className="text-blue-600 text-sm font-medium hover:underline">
                  Upgrade to Premium
                </button>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/community" className="block text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Home Feed</Link>
                <Link to="/community/submit" className="block text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Create Post</Link>
                <Link to="/members-directory" className="block text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Follow</Link>
                <Link to="/projects/submit" className="block text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Post a Project</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default DashboardOverview;
