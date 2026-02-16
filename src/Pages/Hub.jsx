// src/Pages/Hub.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import Navbar from '../components/Navbar';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const Hub = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All', color: 'gray' },
    { id: 'job', label: 'Jobs', color: 'blue' },
    { id: 'project', label: 'Projects', color: 'green' },
    { id: 'event', label: 'Events', color: 'purple' },
    { id: 'course', label: 'Courses', color: 'orange' },
    { id: 'internship', label: 'Internships', color: 'teal' },
    { id: 'program', label: 'Programs', color: 'pink' },
    { id: 'scholarship', label: 'Scholarships', color: 'yellow' }
  ];

  const getCategoryConfig = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { 
        replace: true,
        state: { from: '/hub', message: 'Please sign in to access the Hub' }
      });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const q = query(
      collection(db, 'hub_posts'),
      where('status', 'in', ['active', 'closed']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
          eventDate: data.eventDate?.toDate(),
          courseStartDate: data.courseStartDate?.toDate(),
          applicationDeadline: data.applicationDeadline?.toDate()
        };
      });

      const activePosts = postsData.filter(post => {
        if (!post.expiresAt) return true;
        return new Date() < post.expiresAt;
      });

      setPosts(activePosts);
      setFilteredPosts(activePosts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching hub posts:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, authLoading]);

  useEffect(() => {
    let filtered = [...posts];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(post => 
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.description && post.description.toLowerCase().includes(query)) ||
        (post.companyName && post.companyName.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt || new Date(0)) - (a.createdAt || new Date(0));
        case 'oldest':
          return (a.createdAt || new Date(0)) - (b.createdAt || new Date(0));
        case 'expiring':
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return a.expiresAt - b.expiresAt;
        case 'popular':
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, selectedCategory, searchQuery, sortBy]);

  const handlePostClick = async (post) => {
    try {
      await updateDoc(doc(db, 'hub_posts', post.id), {
        viewCount: (post.viewCount || 0) + 1
      });

      if (post.externalLink) {
        await updateDoc(doc(db, 'hub_posts', post.id), {
          clickCount: (post.clickCount || 0) + 1
        });
        window.open(post.externalLink, '_blank');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await updateDoc(doc(db, 'hub_posts', postId), {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  const handleMarkClosed = async (postId, currentStatus) => {
    const isClosing = currentStatus !== 'closed';
    
    if (isClosing) {
      if (!window.confirm('Mark this opportunity as closed?')) return;
    } else {
      if (!window.confirm('Reopen this opportunity?')) return;
    }

    try {
      await updateDoc(doc(db, 'hub_posts', postId), {
        status: isClosing ? 'closed' : 'active',
        closedAt: isClosing ? serverTimestamp() : null
      });
      toast.success(isClosing ? 'Post marked as closed' : 'Post reopened');
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Error updating post status');
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatExpiration = (expiresAt) => {
    if (!expiresAt) return 'Never expires';
    const now = new Date();
    const diffMs = expiresAt - now;
    const diffDays = Math.ceil(diffMs / 86400000);

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays < 7) return `Expires in ${diffDays} days`;
    return `Expires ${expiresAt.toLocaleDateString()}`;
  };

  const getCategoryDetails = (post) => {
    switch (post.category) {
      case 'job':
        return (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
            {post.jobType && <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">{post.jobType}</span>}
            {post.location && <span className="bg-white/10 text-gray-300 px-2 py-1 rounded truncate max-w-[150px]">{post.location}</span>}
            {post.salaryRange && <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded hidden sm:inline-block">{post.salaryRange}</span>}
          </div>
        );
      case 'event':
        return post.eventDate && (
          <div className="text-xs text-purple-300">
            {post.eventDate.toLocaleDateString()} {!isMobile && post.eventTime && `at ${post.eventTime}`}
          </div>
        );
      case 'course':
        return (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
            {post.coursePrice && <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded">${post.coursePrice}</span>}
            {post.courseDuration && <span className="bg-white/10 text-gray-300 px-2 py-1 rounded hidden sm:inline-block">{post.courseDuration}</span>}
            {post.courseType && <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded">{post.courseType}</span>}
          </div>
        );
      case 'scholarship':
        return (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
            {post.scholarshipAmount && <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">{post.scholarshipAmount}</span>}
            {post.applicationDeadline && <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded">Due {post.applicationDeadline.toLocaleDateString()}</span>}
          </div>
        );
      case 'internship':
        return (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
            {post.internshipDuration && <span className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded">{post.internshipDuration}</span>}
            {post.stipend && <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">{post.stipend}</span>}
          </div>
        );
      case 'project':
        return (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
            {post.projectBudget && <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">{post.projectBudget}</span>}
            {post.projectDuration && <span className="bg-white/10 text-gray-300 px-2 py-1 rounded">{post.projectDuration}</span>}
          </div>
        );
      case 'program':
        return (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
            {post.programDuration && <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded">{post.programDuration}</span>}
            {post.programCost && <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded hidden sm:inline-block">{post.programCost}</span>}
          </div>
        );
      default:
        return null;
    }
  };

  if (authLoading || (currentUser && loading)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
          <div className="glass-card-responsive max-w-sm text-center bg-gray-900 border border-white/20 rounded-xl p-6">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-base sm:text-lg">Loading Hub...</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentUser) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div className="container-responsive max-w-7xl py-6 sm:py-8">
          
          {/* Hero Section */}
          <section className="mb-8 sm:mb-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-400 font-semibold text-sm sm:text-base">
                  Welcome, {isMobile ? (currentUser.displayName?.split(' ')[0] || 'User') : (currentUser.displayName || currentUser.email)}! Discover opportunities in tech.
                </p>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white">
                Loomiq Hub
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 px-4">
                {isMobile ? 'Opportunities for Tech Professionals' : 'Jobs • Projects • Events • Courses • Internships • Programs • Scholarships'}
              </p>
              
              <button 
                onClick={() => navigate('/hub/post')}
                className="btn-responsive-base bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg"
              >
                {isMobile ? 'Post' : 'Post Opportunity'}
              </button>
            </div>
          </section>

          {/* Category Pills */}
          <section className="mb-6 sm:mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-3 sm:p-4">
              <div className="hidden md:flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-semibold text-sm lg:text-base transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              
              <div className="md:hidden overflow-x-auto -mx-3 px-3 pb-2">
                <div className="flex gap-2 min-w-max">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Search and Sort */}
          <section className="mb-6 sm:mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder={isMobile ? "Search..." : "Search by title, company, or tags..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-responsive bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-responsive bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-300">
                  <span className="text-blue-400 font-semibold">{filteredPosts.length}</span> {isMobile ? 'found' : 'opportunities found'}
                </span>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold touch-target text-left"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Posts Grid */}
          <section>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {posts.length === 0 ? 'No opportunities yet' : 'No matches found'}
                </h3>
                <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base px-4">
                  {posts.length === 0 
                    ? 'Be the first to post an opportunity!'
                    : 'Try adjusting your search or filters.'
                  }
                </p>
                <button 
                  onClick={() => navigate('/hub/post')}
                  className="btn-responsive-base bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg"
                >
                  Post Opportunity
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {filteredPosts.map((post) => {
                  const categoryConfig = getCategoryConfig(post.category);
                  const isOwnPost = post.posterId === currentUser.uid;
                  const isClosed = post.status === 'closed';
                  
                  return (
                    <div key={post.id} className="group">
                      <div className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 sm:p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 h-full flex flex-col ${
                        isClosed ? 'border-white/10 opacity-75' : 'border-white/20'
                      }`}>
                        
                        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className={`bg-${categoryConfig.color}-500/20 text-${categoryConfig.color}-300 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold`}>
                              {isMobile ? categoryConfig.label.slice(0, 4) : categoryConfig.label}
                            </span>
                            {isClosed && (
                              <span className="bg-white/10 text-gray-400 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold">
                                Closed
                              </span>
                            )}
                          </div>
                          
                          {isOwnPost && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => navigate(`/hub/edit/${post.id}`)}
                                className="text-blue-400 hover:text-blue-300 px-1.5 sm:px-2 py-1 text-xs sm:text-sm font-semibold"
                              >
                                {isMobile ? 'Ed' : 'Edit'}
                              </button>
                              <button
                                onClick={() => handleMarkClosed(post.id, post.status)}
                                className={`${isClosed ? 'text-green-400 hover:text-green-300' : 'text-yellow-400 hover:text-yellow-300'} px-1.5 sm:px-2 py-1 text-xs sm:text-sm font-semibold`}
                              >
                                {isClosed ? 'Open' : 'Close'}
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-400 hover:text-red-300 px-1.5 sm:px-2 py-1 text-xs sm:text-sm font-semibold"
                              >
                                {isMobile ? 'Del' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </div>

                        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-2 line-clamp-2 ${isClosed ? 'text-gray-500' : 'text-white'}`}>
                          {post.title}
                        </h3>
                        {post.companyName && (
                          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 truncate">{post.companyName}</p>
                        )}

                        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-grow ${isClosed ? 'text-gray-500' : 'text-gray-300'}`}>
                          {post.description}
                        </p>

                        <div className="mb-3 sm:mb-4">
                          {getCategoryDetails(post)}
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                            {post.tags.slice(0, isMobile ? 2 : 3).map((tag, idx) => (
                              <span key={idx} className="bg-white/10 text-gray-300 px-2 py-0.5 sm:py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > (isMobile ? 2 : 3) && (
                              <span className="bg-white/10 text-gray-300 px-2 py-0.5 sm:py-1 rounded text-xs">
                                +{post.tags.length - (isMobile ? 2 : 3)}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-3 sm:pt-4 border-t border-white/20">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-2 sm:mb-3">
                            <span className="truncate max-w-[120px] sm:max-w-none">{post.posterName}</span>
                            <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-2 sm:mb-3">
                            <span>{post.viewCount || 0} views</span>
                            <span className={post.expiresAt && new Date() > new Date(post.expiresAt.getTime() - 7*24*60*60*1000) ? 'text-red-400' : ''}>
                              {formatExpiration(post.expiresAt)}
                            </span>
                          </div>

                          <button
                            onClick={() => !isClosed && handlePostClick(post)}
                            disabled={isClosed}
                            className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-bold text-sm sm:text-base transition-all touch-target ${
                              isClosed 
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                            }`}
                          >
                            {isClosed ? (isMobile ? 'Closed' : 'Opportunity Closed') : (isMobile ? 'View' : 'View Details')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          
          * {
            font-family: 'Inter', sans-serif;
          }

          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.7);
          }

          select option {
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
          }
        `}</style>
      </div>
    </>
  );
};

export default Hub;
