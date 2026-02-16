// src/Pages/career/MyGroups.jsx - Fully Responsive with Clean Design

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const MyGroups = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const memberQuery = query(
      collection(db, 'group_members'),
      where('userEmail', '==', currentUser.email),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(memberQuery, async (snapshot) => {
      const membershipData = snapshot.docs.map(doc => doc.data());
      
      const groupPromises = membershipData.map(async (membership) => {
        try {
          const groupDoc = await getDoc(doc(db, 'groups', membership.groupId));
          if (groupDoc.exists()) {
            return {
              id: groupDoc.id,
              ...groupDoc.data(),
              userRole: membership.role,
              joinedAt: membership.joinedAt?.toDate()
            };
          }
        } catch (error) {
          console.error('Error fetching group:', error);
        }
        return null;
      });

      const groups = await Promise.all(groupPromises);
      const validGroups = groups.filter(group => group !== null);
      
      validGroups.sort((a, b) => {
        if (a.userRole === 'admin' && b.userRole !== 'admin') return -1;
        if (b.userRole === 'admin' && a.userRole !== 'admin') return 1;
        return (b.createdAt?.toDate() || new Date()) - (a.createdAt?.toDate() || new Date());
      });
      
      setUserGroups(validGroups);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completing':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completing':
        return 'Completing';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const isProjectOwner = userGroups.some(group => group.userRole === 'admin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm sm:text-base"
            >
              <span className="mr-2">←</span>
              Back to Dashboard
            </button>
          </div>

          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-6xl sm:text-7xl">👥</span>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
                  My Project Groups
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-2">
                  Collaborate with your teams and track project progress
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
            {isProjectOwner && (
              <Link 
                to="/projects/owner-dashboard" 
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors text-sm sm:text-base shadow-sm"
              >
                Project Dashboard
                <span className="ml-2">→</span>
              </Link>
            )}

            <Link 
              to="/projects"
              className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold transition-colors text-sm sm:text-base shadow-sm"
            >
              Browse Projects
            </Link>

            <Link 
              to="/submit-project"
              className="inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-bold transition-colors text-sm sm:text-base"
            >
              Submit New Project
            </Link>
          </div>

          {/* Groups Content */}
          <section>
            {userGroups.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm max-w-2xl mx-auto">
                  <div className="text-6xl sm:text-7xl mb-6">📋</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    No Project Groups Yet
                  </h3>
                  <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed">
                    You're not part of any project groups yet. Apply to projects or submit your own to get started with collaborative workspaces.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link 
                      to="/projects" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold transition-colors text-sm sm:text-base shadow-sm"
                    >
                      Browse Projects
                    </Link>
                    <Link 
                      to="/submit-project" 
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold transition-colors text-sm sm:text-base shadow-sm"
                    >
                      Submit Project
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                    <div className="text-4xl sm:text-5xl font-black text-orange-600 mb-2">{userGroups.length}</div>
                    <div className="text-gray-700 font-semibold text-sm sm:text-base">Total Groups</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                    <div className="text-4xl sm:text-5xl font-black text-blue-600 mb-2">
                      {userGroups.filter(g => g.userRole === 'admin').length}
                    </div>
                    <div className="text-gray-700 font-semibold text-sm sm:text-base">Groups I Lead</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                    <div className="text-4xl sm:text-5xl font-black text-blue-600 mb-2">
                      {userGroups.filter(g => g.status === 'active').length}
                    </div>
                    <div className="text-gray-700 font-semibold text-sm sm:text-base">Active Projects</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                    <div className="text-4xl sm:text-5xl font-black text-green-600 mb-2">
                      {userGroups.filter(g => g.status === 'completed').length}
                    </div>
                    <div className="text-gray-700 font-semibold text-sm sm:text-base">Completed</div>
                  </div>
                </div>

                {/* Project Manager Tools Banner */}
                {isProjectOwner && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
                          <span className="text-3xl mr-3">🎯</span>
                          Project Manager & Mentor Tools
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">Manage your projects and teams efficiently</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link 
                          to="/projects/owner-dashboard" 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors text-center text-sm sm:text-base shadow-sm"
                        >
                          Project Dashboard
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Groups Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {userGroups.map((group) => (
                    <div 
                      key={group.id} 
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      {/* Group Header Banner */}
                      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <div className="text-5xl sm:text-6xl opacity-60">
                          {group.projectTitle.charAt(0).toUpperCase()}
                        </div>

                        {/* Status Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(group.status)}`}>
                            {getStatusLabel(group.status)}
                          </span>
                          {group.userRole === 'admin' && (
                            <span className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Group Content */}
                      <div className="p-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                          {group.projectTitle}
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                          {group.description}
                        </p>

                        {/* Group Meta */}
                        <div className="space-y-2 border-t border-gray-200 pt-4 mb-6">
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                            <span>Joined {group.joinedAt?.toLocaleDateString() || 'Recently'}</span>
                          </div>
                          {group.createdAt && (
                            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                              <span>Created {group.createdAt.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Link 
                            to={`/groups/${group.id}`}
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-bold transition-colors text-sm sm:text-base shadow-sm"
                          >
                            View Group →
                          </Link>

                          {group.userRole === 'admin' && (
                            <>
                              {group.status === 'active' && (
                                <Link 
                                  to={`/groups/${group.id}/complete`}
                                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center px-4 py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm shadow-sm"
                                >
                                  Complete Project
                                </Link>
                              )}
                              
                              {group.status === 'completing' && (
                                <Link 
                                  to={`/groups/${group.id}/complete`}
                                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center px-4 py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm shadow-sm"
                                >
                                  Continue Completion
                                </Link>
                              )}

                              {group.status === 'completed' && (
                                <button 
                                  disabled 
                                  className="block w-full bg-gray-200 text-gray-500 text-center px-4 py-2 rounded-lg font-semibold cursor-not-allowed text-xs sm:text-sm"
                                > 
                                  Project Completed
                                </button>
                              )}
                            </>
                          )}

                          {group.userRole !== 'admin' && group.status === 'completed' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <div className="text-green-700 font-semibold text-xs sm:text-sm">✓ Project Completed!</div>
                              <div className="text-gray-600 text-xs mt-1">Check your badges in profile</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 text-gray-700 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-gray-600 text-xs sm:text-sm font-medium">
                Transforming Careers with AI-Powered Project Collaboration
              </span>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">
              © {new Date().getFullYear()} Loomiq. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MyGroups;
