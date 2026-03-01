// src/Pages/Finance.jsx - Finance & Financial Resources for International Students

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const Finance = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const serviceTypes = [
    { id: 'all', label: 'All Resources', icon: '📋' },
    { id: 'scholarships', label: 'Scholarships', icon: '🎓' },
    { id: 'loans', label: 'Loans', icon: '💰' },
    { id: 'work-study', label: 'Work-Study', icon: '💼' },
    { id: 'grants', label: 'Grants', icon: '🏆' },
    { id: 'assistantships', label: 'Assistantships', icon: '📚' },
    { id: 'fellowships', label: 'Fellowships', icon: '🏅' },
  ];

  const sourceTypes = [
    { id: 'all', label: 'All Sources' },
    { id: 'university', label: 'University' },
    { id: 'federal', label: 'Federal' },
    { id: 'state', label: 'State' },
    { id: 'private', label: 'Private' },
    { id: 'nonprofit', label: 'Nonprofit' },
    { id: 'employer', label: 'Employer' },
  ];

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true, state: { from: '/finance' } });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const q = query(
      collection(db, 'banking_posts'),
      where('status', 'in', ['active', 'closed']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })).filter(p => !p.expiresAt || new Date() < p.expiresAt);

      setPosts(data);
      setFilteredPosts(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching finance posts:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, authLoading]);

  useEffect(() => {
    let filtered = [...posts];

    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.serviceType === selectedType);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(p => p.fundingSource === selectedSource);
    }

    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.city && p.city.toLowerCase().includes(loc)) ||
        (p.state && p.state.toLowerCase().includes(loc)) ||
        (p.university && p.university.toLowerCase().includes(loc)) ||
        p.availableNationwide === true
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.providerName && p.providerName.toLowerCase().includes(q)) ||
        (p.university && p.university.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      return 0;
    });

    setFilteredPosts(filtered);
  }, [posts, selectedType, selectedSource, locationFilter, searchQuery, sortBy]);

  const handlePostClick = async (post) => {
    try {
      await updateDoc(doc(db, 'banking_posts', post.id), { viewCount: (post.viewCount || 0) + 1 });
      if (post.externalLink) window.open(post.externalLink, '_blank');
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await updateDoc(doc(db, 'banking_posts', postId), { status: 'deleted', deletedAt: serverTimestamp() });
      toast.success('Listing deleted');
    } catch (e) { toast.error('Error deleting'); }
  };

  const handleMarkClosed = async (postId, currentStatus) => {
    const closing = currentStatus !== 'closed';
    try {
      await updateDoc(doc(db, 'banking_posts', postId), { status: closing ? 'closed' : 'active' });
      toast.success(closing ? 'Listing closed' : 'Listing reopened');
    } catch (e) { toast.error('Error updating'); }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setSelectedType('all');
    setSelectedSource('all');
  };

  const hasActiveFilters = searchQuery || locationFilter || selectedType !== 'all' || selectedSource !== 'all';

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - date) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeBadge = (type) => {
    const map = {
      'scholarships': { label: '🎓 Scholarship', cls: 'bg-yellow-500/20 text-yellow-300' },
      'loans': { label: '💰 Loan', cls: 'bg-blue-500/20 text-blue-300' },
      'work-study': { label: '💼 Work-Study', cls: 'bg-indigo-500/20 text-indigo-300' },
      'grants': { label: '🏆 Grant', cls: 'bg-emerald-500/20 text-emerald-300' },
      'assistantships': { label: '📚 Assistantship', cls: 'bg-cyan-500/20 text-cyan-300' },
      'fellowships': { label: '🏅 Fellowship', cls: 'bg-amber-500/20 text-amber-300' },
    };
    return map[type] || { label: type || 'Financial Resource', cls: 'bg-orange-500/20 text-orange-300' };
  };

  const getSourceBadge = (source) => {
    const map = {
      'university': { label: '🏫 University', cls: 'bg-blue-600/20 text-blue-200' },
      'federal': { label: '🏛️ Federal', cls: 'bg-slate-500/20 text-slate-300' },
      'state': { label: '🗺️ State', cls: 'bg-violet-500/20 text-violet-300' },
      'private': { label: '🏢 Private', cls: 'bg-pink-500/20 text-pink-300' },
      'nonprofit': { label: '💚 Nonprofit', cls: 'bg-green-600/20 text-green-200' },
      'employer': { label: '👔 Employer', cls: 'bg-amber-600/20 text-amber-200' },
    };
    return map[source] || null;
  };

  if (authLoading || (currentUser && loading)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading Finance Resources...</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentUser) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden pt-20 sm:pt-24" style={{ backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6 sm:py-8 md:py-10">

          {/* Hero */}
          <section className="mb-10 text-center">
            <div className="mb-4 inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-orange-400 font-semibold text-sm">💰 Financial resources for international students</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4">Finance</h1>
            <p className="text-gray-300 text-base sm:text-lg mb-6">Scholarships · Loans · Work-Study · Grants · Fellowships · Banking · Tax Help</p>
            <button
              onClick={() => navigate('/finance/post')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              List a Resource
            </button>
          </section>

          {/* Category Filter */}
          <section className="mb-4">
            <div className="bg-white/5 rounded-xl border border-white/20 p-4">
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Category</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-start sm:justify-center flex-nowrap sm:flex-wrap">
                {serviceTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                      selectedType === type.id
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Source / Funding Type Filter */}
          <section className="mb-6">
            <div className="bg-white/5 rounded-xl border border-white/20 p-4">
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Source / Funding Type</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-start sm:justify-center flex-nowrap sm:flex-wrap">
                {sourceTypes.map(source => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                      selectedSource === source.id
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Search, Location & Sort */}
          <section className="mb-8">
            <div className="bg-white/5 rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm"
                />
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="City, state, university, or 'nationwide'..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:border-orange-400 focus:outline-none text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">
                  <span className="text-orange-400 font-semibold">{filteredPosts.length}</span> resources found
                </span>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-orange-400 hover:text-orange-300 font-semibold min-h-[44px] flex items-center">
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Cards */}
          <section>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl sm:text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {posts.length === 0 ? 'No resources listed yet' : 'No resources match your search'}
                </h3>
                <p className="text-gray-400 mb-8">
                  {posts.length === 0 ? 'Be the first to list a financial resource!' : 'Try adjusting your filters.'}
                </p>
                <button onClick={() => navigate('/finance/post')} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl transition-all">
                  List a Resource
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPosts.map((post) => {
                  const typeBadge = getTypeBadge(post.serviceType);
                  const sourceBadge = getSourceBadge(post.fundingSource);
                  const isOwnPost = post.posterId === currentUser.uid;
                  const isClosed = post.status === 'closed';
                  return (
                    <div key={post.id} className="group">
                      <div className={`bg-white/5 border rounded-xl p-5 sm:p-6 h-full flex flex-col ${isClosed ? 'border-white/10 opacity-75' : 'border-white/20 border-white/20'}`}>

                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeBadge.cls}`}>{typeBadge.label}</span>
                            {sourceBadge && <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${sourceBadge.cls}`}>{sourceBadge.label}</span>}
                            {post.noSSNRequired && <span className="bg-green-500/20 text-green-300 px-2.5 py-1 rounded-lg text-xs font-semibold">No SSN Req.</span>}
                            {post.internationalFriendly && <span className="bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold">Intl. Friendly</span>}
                            {post.availableNationwide && <span className="bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-lg text-xs font-semibold">🌎 Nationwide</span>}
                            {isClosed && <span className="bg-white/10 text-gray-400 px-2.5 py-1 rounded-lg text-xs font-semibold">Closed</span>}
                          </div>
                          {isOwnPost && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => handleMarkClosed(post.id, post.status)} className={`${isClosed ? 'text-green-400' : 'text-yellow-400'} px-2 py-1 text-xs font-semibold hover:opacity-75 min-h-[44px] flex items-center`}>
                                {isClosed ? 'Reopen' : 'Close'}
                              </button>
                              <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300 px-2 py-1 text-xs font-semibold min-h-[44px] flex items-center">Delete</button>
                            </div>
                          )}
                        </div>

                        <h3 className={`text-lg font-bold mb-1 line-clamp-2 ${isClosed ? 'text-gray-500' : 'text-white'}`}>{post.title}</h3>
                        {post.providerName && <p className="text-orange-400 text-sm font-semibold mb-1">{post.providerName}</p>}
                        {post.university && <p className="text-blue-400 text-xs font-semibold mb-2">🏫 {post.university}</p>}

                        {/* Location */}
                        {(post.city || post.availableNationwide) && (
                          <p className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {post.availableNationwide ? 'Nationwide' : [post.city, post.state].filter(Boolean).join(', ')}
                          </p>
                        )}

                        {/* Amount / Fees */}
                        {(post.fees || post.amount) && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {post.amount && <span className="bg-green-500/20 text-green-300 px-2.5 py-1 rounded-lg text-xs font-semibold">{post.amount}</span>}
                            {post.fees && <span className="bg-orange-500/20 text-orange-300 px-2.5 py-1 rounded-lg text-xs font-semibold">{post.fees}</span>}
                          </div>
                        )}

                        {/* Deadline */}
                        {post.deadline && (
                          <p className="text-yellow-400 text-xs font-semibold mb-2">⏰ Deadline: {post.deadline}</p>
                        )}

                        <p className={`text-sm mb-4 line-clamp-3 flex-grow ${isClosed ? 'text-gray-500' : 'text-gray-300'}`}>{post.description}</p>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.tags.slice(0, 3).map((t, i) => (
                              <span key={i} className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs">{t}</span>
                            ))}
                            {post.tags.length > 3 && <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs">+{post.tags.length - 3}</span>}
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-white/10">
                          <div className="flex justify-between text-xs text-gray-400 mb-3">
                            <span className="truncate max-w-[140px] flex items-center gap-1">{post.posterName}{post.isCompanyPost && <span className="text-blue-400 text-[10px]">🏢</span>}</span>
                            <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                          <button
                            onClick={() => !isClosed && handlePostClick(post)}
                            disabled={isClosed}
                            className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                              isClosed ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                            }`}
                          >
                            {isClosed ? 'Unavailable' : 'Learn More →'}
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
        <style jsx>{`select option { background-color: #111; color: white; }`}</style>
      </div>
    </>
  );
};

export default Finance;
