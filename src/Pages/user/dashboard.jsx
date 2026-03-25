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
  const [loading, setLoading] = useState(true);
  const [membershipPlan, setMembershipPlan] = useState('Free');

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
          setStats(prev => ({ ...prev, projectsCompleted: completedSnap.size }));
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
                        <p className="text-gray-900 text-sm font-medium truncate">{project.title || 'Untitled Project'}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{project.category || 'General'}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md flex-shrink-0 ml-3">Active</span>
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
