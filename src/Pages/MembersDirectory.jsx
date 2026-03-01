import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import { 
  collection, 
  query, 
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import FollowButton from '../components/community/FollowButton';
import { throttle } from '../utils/throttle';

const MembersDirectory = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;

  const [userCounts, setUserCounts] = useState({});

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { 
        replace: true,
        state: { from: '/members', message: 'Please sign in to access the member directory' }
      });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    const handleMouseMove = throttle((e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }, 50);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCountUpdate = (countData) => {
    if (countData.targetUserId) {
      setUserCounts(prev => ({
        ...prev,
        [countData.targetUserId]: countData.targetUser
      }));
    }
  };

  // Fetch all users
  useEffect(() => {
    if (authLoading || !currentUser) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);

        if (usersSnapshot.size === 0) {
          setMembers([]);
          setFilteredMembers([]);
          setLoading(false);
          return;
        }

        const membersData = usersSnapshot.docs.map((userDoc) => {
          try {
            const userData = userDoc.data();
            const email = userData.email;
            
            if (!email || !email.includes('@')) return null;

            return {
              uid: userDoc.id,
              email,
              name: userData.displayName || email.split('@')[0],
              displayName: userData.displayName || email.split('@')[0],
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              photoURL: userData.photoURL || null,
              initials: userData.initials || '',
              university: userData.university || '',
              major: userData.major || '',
              city: userData.city || '',
              state: userData.state || '',
              visaStatus: userData.visaStatus || '',
              joinedDate: userData.createdAt && typeof userData.createdAt.toDate === 'function' 
                ? userData.createdAt.toDate() 
                : userData.createdAt instanceof Date 
                ? userData.createdAt 
                : null,
              lastLogin: userData.lastLogin && typeof userData.lastLogin.toDate === 'function'
                ? userData.lastLogin.toDate()
                : userData.lastLogin instanceof Date
                ? userData.lastLogin
                : null,
              lastActive: (userData.lastLogin && typeof userData.lastLogin.toDate === 'function')
                ? userData.lastLogin.toDate().getTime()
                : (userData.createdAt && typeof userData.createdAt.toDate === 'function')
                ? userData.createdAt.toDate().getTime()
                : Date.now() - (365 * 24 * 60 * 60 * 1000),
              isActive: userData.lastLogin && typeof userData.lastLogin.toDate === 'function'
                ? userData.lastLogin.toDate().getTime() > (Date.now() - (90 * 24 * 60 * 60 * 1000))
                : false,
            };
          } catch (e) {
            console.error(`Error processing member ${userDoc.id}:`, e);
            return null;
          }
        }).filter(m => m && m.email);

        setMembers(membersData);
        setFilteredMembers(membersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load member directory');
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentUser, authLoading]);

  // Apply filters
  useEffect(() => {
    let filtered = [...members];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(q) ||
        (member.university && member.university.toLowerCase().includes(q)) ||
        (member.major && member.major.toLowerCase().includes(q)) ||
        (member.city && member.city.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.lastActive - a.lastActive);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredMembers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const goToNextPage = () => { if (currentPage < totalPages) goToPage(currentPage + 1); };
  const goToPrevPage = () => { if (currentPage > 1) goToPage(currentPage - 1); };

  const openMemberModal = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  const copyEmail = async (email) => {
    try {
      if (!currentUser || !email.includes('@')) {
        toast.error('Access denied');
        return;
      }
      await navigator.clipboard.writeText(email);
      toast.success('Email copied!');
    } catch (err) {
      toast.error('Failed to copy email');
    }
  };

  if (authLoading || (currentUser && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div 
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.1), transparent 40%)` }}
        />
        <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-2xl p-5 sm:p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {authLoading ? 'Checking authentication...' : 'Loading member directory...'}
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col relative" style={{ backgroundColor: '#000000' }}>
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.1), transparent 40%)` }}
      />

      <Navbar />

      <main className="flex-grow pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
          
          {/* Hero Section */}
          <section className="relative mb-16 pt-8 text-center">
            <div className="max-w-4xl mx-auto">
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-4 w-4 bg-green-500 rounded-full animate-ping shadow-lg" 
                     style={{boxShadow: '0 0 20px rgba(76, 175, 80, 0.8)'}}></div>
                <span className="text-green-400 uppercase tracking-widest text-lg font-black" 
                      style={{ textShadow: '0 0 20px rgba(76, 175, 80, 0.8), 2px 2px 4px rgba(0,0,0,0.9)' }}>
                   Member Directory
                </span>
                <div className="h-4 w-4 bg-green-500 rounded-full animate-ping shadow-lg" 
                     style={{boxShadow: '0 0 20px rgba(76, 175, 80, 0.8)'}}></div>
              </div>
              
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 md:mb-8 leading-[0.9]"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e8 50%, #ffffff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.9))'
                  }}>
                Connect With Our{' '}
                <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-orange-500"
                      style={{filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'}}>
                  Community
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light mb-8" 
                 style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
                Discover and connect with <span className="text-green-400 font-semibold">international students</span> and <span className="text-green-400 font-semibold">alumni</span> in your field.
              </p>

              {/* Directory Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-lg mx-auto">
                <div className="bg-gradient-to-br from-green-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">{members.length}</div>
                  <div className="text-sm text-green-100">Total Members</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                  <div className="text-2xl font-bold text-orange-300">{members.filter(m => m.isActive).length}</div>
                  <div className="text-sm text-orange-100">Recently Active</div>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/20">
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by name, university, major, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300 text-lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                >
                  <option value="recent">Recently Active</option>
                  <option value="name">Name A-Z</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
                >
                  Clear All
                </button>
              </div>

              <div className="flex justify-between items-center text-gray-300">
                <span>
                  <span className="text-green-400 font-semibold">{filteredMembers.length}</span> members found
                  {filteredMembers.length > 0 && (
                    <span className="ml-2 text-sm">
                      • Showing {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* Members Grid */}
          <section>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-white mb-4">No members found</h3>
                <p className="text-gray-300">
                  {members.length === 0 
                    ? "Loading member directory..."
                    : "Try adjusting your search to find more members."
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {currentMembers.map((member) => (
                    <div key={member.email} className="group">
                      <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500 h-full flex flex-col">
                        
                        {/* Member Header */}
                        <div className="flex items-center mb-4">
                          <div className="relative flex-shrink-0 mr-4">
                            {member.photoURL ? (
                              <img 
                                src={member.photoURL} 
                                alt={`${member.name}'s profile`}
                                className="w-16 h-16 rounded-full object-cover ring-4 ring-green-400/50"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-orange-500 flex items-center justify-center ring-4 ring-green-400/50">
                                <span className="text-xl text-black font-bold">
                                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            {member.isActive && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-grow min-w-0">
                            <h3 className="text-xl font-black text-white group-hover:text-green-400 transition-colors duration-300 truncate">
                              {member.name}
                            </h3>
                            {member.university && (
                              <p className="text-green-400 text-sm truncate">{member.university}</p>
                            )}
                            {member.major && (
                              <p className="text-gray-400 text-xs truncate">{member.major}</p>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="mb-4 flex-grow space-y-1">
                          {(member.city || member.state) && (
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="truncate">{[member.city, member.state].filter(Boolean).join(', ')}</span>
                            </p>
                          )}
                          {member.joinedDate && (
                            <p className="text-gray-500 text-xs">
                              Joined {member.joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => openMemberModal(member)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 text-xs"
                          >
                            View Profile
                          </button>
                          
                          {member.uid !== currentUser.uid && (
                            <div className="flex-shrink-0">
                              <FollowButton
                                targetUser={member}
                                currentUser={currentUser}
                                size="sm"
                                onCountUpdate={handleCountUpdate}
                              />
                            </div>
                          )}
                          
                          <button
                            onClick={() => copyEmail(member.email)}
                            className="px-3 py-3 rounded-xl font-semibold transition-all duration-300 text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                            title="Copy email address"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-4">
                    <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                            currentPage === 1
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                          }`}
                        >
                          ← Previous
                        </button>

                        <div className="flex items-center space-x-2">
                          {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = index + 1;
                            else if (currentPage <= 3) pageNum = index + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + index;
                            else pageNum = currentPage - 2 + index;

                            if (pageNum < 1 || pageNum > totalPages) return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                                  currentPage === pageNum
                                    ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                            currentPage === totalPages
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                          }`}
                        >
                          Next →
                        </button>
                      </div>

                      <div className="text-center mt-4 text-gray-300 text-sm">
                        Page {currentPage} of {totalPages} • {filteredMembers.length} total members
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Member Detail Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="relative mr-5">
                  {selectedMember.photoURL ? (
                    <img 
                      src={selectedMember.photoURL} 
                      alt={`${selectedMember.name}'s profile`}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-green-400/50"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-orange-500 flex items-center justify-center ring-4 ring-green-400/50">
                      <span className="text-2xl text-black font-bold">
                        {selectedMember.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  {selectedMember.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">{selectedMember.name}</h2>
                  
                  {selectedMember.university && (
                    <p className="text-green-400 text-sm font-semibold">{selectedMember.university}</p>
                  )}
                  {selectedMember.major && (
                    <p className="text-gray-400 text-sm">{selectedMember.major}</p>
                  )}
                  
                  <div className="flex items-center mt-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      selectedMember.isActive ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      selectedMember.isActive ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {selectedMember.isActive ? 'Recently Active' : 'Less Active'}
                    </span>
                  </div>
                  
                  {selectedMember.joinedDate && selectedMember.joinedDate.toLocaleDateString && (
                    <p className="text-gray-400 text-sm mt-1">
                      Member since {selectedMember.joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeMemberModal}
                className="text-gray-400 hover:text-white transition-colors text-2xl ml-4"
              >
                ×
              </button>
            </div>

            {/* Member Details */}
            <div className="space-y-6">
              
              {/* Info */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-green-400 font-semibold mb-4 text-lg">About</h3>
                <div className="space-y-3">
                  {selectedMember.university && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">University</span>
                      <span className="text-white font-medium">{selectedMember.university}</span>
                    </div>
                  )}
                  {selectedMember.major && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Major</span>
                      <span className="text-white font-medium">{selectedMember.major}</span>
                    </div>
                  )}
                  {(selectedMember.city || selectedMember.state) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location</span>
                      <span className="text-white font-medium">{[selectedMember.city, selectedMember.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {selectedMember.visaStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Visa Status</span>
                      <span className="text-white font-medium">{selectedMember.visaStatus}</span>
                    </div>
                  )}
                  {!selectedMember.university && !selectedMember.major && !selectedMember.city && !selectedMember.visaStatus && (
                    <p className="text-gray-500 text-sm text-center py-4">This member hasn't updated their profile details yet.</p>
                  )}
                </div>
              </div>

              {/* Connect Section */}
              <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 rounded-xl p-6 border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-4 text-lg">Connect</h3>
                <p className="text-gray-300 mb-4">
                  Want to connect with {selectedMember.name}? Follow them or copy their email to reach out.
                </p>
                <div className="flex gap-4">
                  {selectedMember.uid !== currentUser.uid && (
                    <div className="flex-1">
                      <FollowButton
                        targetUser={selectedMember}
                        currentUser={currentUser}
                        size="md"
                        onCountUpdate={handleCountUpdate}
                        fullWidth={true}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => copyEmail(selectedMember.email)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                    title="Copy email address"
                  >
                    Copy Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        select option {
          background-color: rgba(0, 0, 0, 0.9);
          color: white;
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.5); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.7); }
      `}</style>
    </div>
  );
};

export default MembersDirectory;
