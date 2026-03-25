// src/Pages/MyFinancePosts.jsx - Manage finance resource listings posted by the user

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const MyFinancePosts = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true, state: { from: '/finance/my-posts', message: 'Please sign in to view your posts' } });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const postsQuery = query(
      collection(db, 'banking_posts'),
      where('posterId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(postsQuery,
      (snap) => {
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMyPosts(posts);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading finance posts:', err);
        toast.error('Error loading your posts');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const handleToggleStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'closed' ? 'active' : 'closed';
    try {
      await updateDoc(doc(db, 'banking_posts', postId), { status: newStatus });
      toast.success(newStatus === 'closed' ? 'Post closed' : 'Post reactivated');
    } catch (err) {
      console.error('Error updating post:', err);
      toast.error('Failed to update post');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'banking_posts', postId));
      toast.success('Post deleted');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    }
  };

  const filtered = filterStatus === 'all'
    ? myPosts
    : myPosts.filter(p => {
        if (filterStatus === 'active') return p.status !== 'closed' && p.status !== 'deleted';
        if (filterStatus === 'closed') return p.status === 'closed';
        return true;
      });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
    if (sortBy === 'oldest') return (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0);
    if (sortBy === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
    return 0;
  });

  const statCounts = {
    total: myPosts.length,
    active: myPosts.filter(p => p.status !== 'closed' && p.status !== 'deleted').length,
    closed: myPosts.filter(p => p.status === 'closed').length,
    totalViews: myPosts.reduce((sum, p) => sum + (p.viewCount || 0), 0),
  };

  if (authLoading || !currentUser) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-20 sm:py-28">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-400">Finance Posts</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your finance resource listings</p>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-6">
              {[
                { label: 'Total Posts', value: statCounts.total, color: 'text-orange-400' },
                { label: 'Active', value: statCounts.active, color: 'text-blue-400' },
                { label: 'Closed', value: statCounts.closed, color: 'text-gray-400' },
                { label: 'Total Views', value: statCounts.totalViews, color: 'text-blue-400' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-white font-semibold text-sm mb-2">Filter by Status</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'active', label: 'Active' },
                    { id: 'closed', label: 'Closed' },
                  ].map(f => (
                    <button key={f.id} onClick={() => setFilterStatus(f.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filterStatus === f.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-600 hover:bg-white/20'
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-2">Sort By</p>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="views">Most Views</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading your posts...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white text-xl font-bold mb-2">
                {myPosts.length === 0 ? 'No Posts Yet' : 'No Results'}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {myPosts.length === 0
                  ? "You haven't posted any finance resources yet."
                  : 'No posts match the selected filter.'}
              </p>
              {myPosts.length === 0 && (
                <Link to="/finance/post" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm transition-all hover:from-blue-500 hover:to-blue-600">
                  Post a Resource
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map(post => {
                const isActive = post.status !== 'closed' && post.status !== 'deleted';
                const date = post.createdAt?.toDate?.() || (post.createdAt ? new Date(post.createdAt) : null);

                return (
                  <div key={post.id} className={`bg-white/5 border rounded-xl p-5 transition-all ${isActive ? 'border-white/10 hover:bg-white/[0.07]' : 'border-white/5 opacity-60'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-base truncate">{post.title || 'Finance Resource'}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${isActive ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                            {isActive ? 'Active' : 'Closed'}
                          </span>
                        </div>
                        {post.category && (
                          <p className="text-blue-400 text-xs font-semibold mb-1">{post.category}</p>
                        )}
                        {post.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">{post.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-500 text-xs">
                          {date && <span>Posted {date.toLocaleDateString()}</span>}
                          {post.viewCount !== undefined && <span>{post.viewCount} views</span>}
                          {post.resourceType && <span>{post.resourceType}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleToggleStatus(post.id, post.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[32px] ${
                            isActive ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
                          }`}>
                          {isActive ? 'Close' : 'Reactivate'}
                        </button>
                        <button onClick={() => handleDelete(post.id)}
                          className="px-3 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg text-xs font-semibold transition-all min-h-[32px]">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="mt-10 text-center">
            <Link to="/dashboard" className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyFinancePosts;
