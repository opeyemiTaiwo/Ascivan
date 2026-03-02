// src/Pages/Jobs.jsx - Jobs Board with Location & Visa Filters

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import Navbar from '../components/Navbar';
import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const Jobs = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [visaFilter, setVisaFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const jobTypes = [
    { id: 'all',        label: 'All Jobs' },
    { id: 'full-time',  label: 'Full-time' },
    { id: 'freelancer', label: 'Freelancer' },
    { id: 'internship', label: 'Internship' },
  ];

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true, state: { from: '/jobs' } });
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
      const data = snapshot.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          createdAt: raw.createdAt?.toDate(),
          expiresAt: raw.expiresAt?.toDate(),
        };
      }).filter(p => {
        const isJob = !p.category || p.category === 'job';
        const notExpired = !p.expiresAt || new Date() < p.expiresAt;
        return isJob && notExpired;
      });

      setPosts(data);
      setFilteredPosts(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, authLoading]);

  useEffect(() => {
    let filtered = [...posts];

    // Job type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.jobType === selectedType);
    }

    // Location filter
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.location && p.location.toLowerCase().includes(loc)) ||
        (p.city && p.city.toLowerCase().includes(loc)) ||
        (p.state && p.state.toLowerCase().includes(loc)) ||
        (p.jobType === 'freelancer') // freelancer = remote, always show
      );
    }

    // Visa-compliant filter
    if (visaFilter) {
      filtered = filtered.filter(p => p.visaCompliant === true || p.sponsorshipAvailable === true);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.companyName && p.companyName.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      if (sortBy === 'expiring') {
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return a.expiresAt - b.expiresAt;
      }
      return 0;
    });

    setFilteredPosts(filtered);
  }, [posts, selectedType, locationFilter, visaFilter, searchQuery, sortBy]);

  const handlePostClick = async (post) => {
    try {
      await updateDoc(doc(db, 'hub_posts', post.id), { viewCount: (post.viewCount || 0) + 1 });
      if (post.externalLink) {
        await updateDoc(doc(db, 'hub_posts', post.id), { clickCount: (post.clickCount || 0) + 1 });
        window.open(post.externalLink, '_blank');
      }
    } catch (e) { console.error(e); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this job post?')) return;
    try {
      await updateDoc(doc(db, 'hub_posts', postId), { status: 'deleted', deletedAt: serverTimestamp() });
      toast.success('Post deleted');
    } catch (e) { toast.error('Error deleting post'); }
  };

  const handleMarkClosed = async (postId, currentStatus) => {
    const closing = currentStatus !== 'closed';
    if (!window.confirm(closing ? 'Mark as closed?' : 'Reopen this job?')) return;
    try {
      await updateDoc(doc(db, 'hub_posts', postId), {
        status: closing ? 'closed' : 'active',
        closedAt: closing ? serverTimestamp() : null
      });
      toast.success(closing ? 'Job closed' : 'Job reopened');
    } catch (e) { toast.error('Error updating'); }
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const diff = new Date() - date;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatExpiration = (expiresAt) => {
    if (!expiresAt) return 'Open';
    const days = Math.ceil((expiresAt - new Date()) / 86400000);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Closes today';
    if (days === 1) return '1 day left';
    if (days < 7) return `${days} days left`;
    return `Closes ${expiresAt.toLocaleDateString()}`;
  };

  const getTypeBadge = (jobType) => {
    const map = {
      'full-time':  { label: 'Full-time',  cls: 'bg-blue-500/20 text-blue-300' },
      'freelancer': { label: 'Freelancer', cls: 'bg-purple-500/20 text-purple-300' },
      'internship': { label: 'Internship', cls: 'bg-teal-500/20 text-teal-300' },
    };
    return map[jobType] || { label: jobType || 'Job', cls: 'bg-orange-500/20 text-orange-300' };
  };

  const clearAll = () => {
    setSearchQuery('');
    setLocationFilter('');
    setSelectedType('all');
    setVisaFilter(false);
  };

  const hasActiveFilters = searchQuery || locationFilter || selectedType !== 'all' || visaFilter;

  if (authLoading || (currentUser && loading)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading Jobs...</p>
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
              <p className="text-orange-400 font-semibold text-sm">
                Welcome, {currentUser.displayName?.split(' ')[0] || 'User'}! Find your next opportunity.
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4">Jobs</h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-5 sm:mb-6">Full-time · Freelancer · Internship</p>
            <button
              onClick={() => navigate('/jobs/post')}
              className="px-6 py-3 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Post a Job
            </button>
          </section>

          {/* Job Type Pills */}
          <section className="mb-5">
            <div className="bg-white/5 rounded-xl border border-white/20 p-4">
              <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-start sm:justify-center flex-nowrap sm:flex-wrap">
                {jobTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                      selectedType === type.id
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white/5 to-transparent pointer-events-none sm:hidden" />
              </div>
            </div>
          </section>

          {/* Filters Row */}
          <section className="mb-8">
            <div className="bg-white/5 rounded-xl border border-white/20 p-4 sm:p-5">
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 mb-4">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search title, company, skills…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm"
                />

                {/* Location */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="City, state, or 'remote'…"
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:border-orange-400 focus:outline-none text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="expiring">Closing Soon</option>
                </select>
              </div>

              {/* Visa Toggle + Results count */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Visa-compliant toggle */}
                <button
                  onClick={() => setVisaFilter(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition-all ${
                    visaFilter
                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-xs border ${visaFilter ? 'bg-green-500 border-green-400' : 'border-gray-500'}`}>
                    {visaFilter && '✓'}
                  </span>
                  Visa-Compliant / Sponsorship Available
                </button>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-300">
                    <span className="text-orange-400 font-semibold">{filteredPosts.length}</span> jobs found
                  </span>
                  {hasActiveFilters && (
                    <button onClick={clearAll} className="text-orange-400 hover:text-orange-300 font-semibold">
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Job Cards */}
          <section>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {posts.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
                </h3>
                <p className="text-gray-400 mb-8">
                  {posts.length === 0 ? 'Be the first to post a job!' : 'Try adjusting your filters.'}
                </p>
                {hasActiveFilters
                  ? <button onClick={clearAll} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all mr-3">Clear Filters</button>
                  : null}
                <button
                  onClick={() => navigate('/jobs/post')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Post a Job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPosts.map(post => {
                  const typeBadge = getTypeBadge(post.jobType);
                  const isOwnPost = post.posterId === currentUser.uid;
                  const isClosed = post.status === 'closed';
                  const expiringSoon = post.expiresAt && (post.expiresAt - new Date()) < 7 * 86400000;

                  return (
                    <div key={post.id} className="group">
                      <div className={`bg-white/5 border rounded-xl p-5 sm:p-6 h-full flex flex-col ${
                        isClosed ? 'border-white/10 opacity-75' : 'border-white/20 border-white/20'
                      }`}>

                        {/* Header row */}
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeBadge.cls}`}>
                              {typeBadge.label}
                            </span>
                            {post.visaCompliant && (
                              <span className="bg-green-500/20 text-green-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                                Visa OK
                              </span>
                            )}
                            {post.sponsorshipAvailable && (
                              <span className="bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                                Sponsorship
                              </span>
                            )}
                            {isClosed && (
                              <span className="bg-white/10 text-gray-400 px-2.5 py-1 rounded-lg text-xs font-semibold">Closed</span>
                            )}
                          </div>
                          {isOwnPost && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => handleMarkClosed(post.id, post.status)}
                                className={`${isClosed ? 'text-green-400' : 'text-yellow-400'} px-2 py-1 text-xs font-semibold hover:opacity-75 min-h-[44px] flex items-center`}>
                                {isClosed ? 'Reopen' : 'Close'}
                              </button>
                              <button onClick={() => handleDeletePost(post.id)}
                                className="text-red-400 hover:text-red-300 px-2 py-1 text-xs font-semibold min-h-[44px] flex items-center">
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Title & company */}
                        <h3 className={`text-lg font-bold mb-1 line-clamp-2 ${isClosed ? 'text-gray-500' : 'text-white'}`}>
                          {post.title}
                        </h3>
                        {post.companyName && (
                          <p className="text-orange-400 text-sm font-semibold mb-2 truncate">{post.companyName}</p>
                        )}

                        {/* Location + salary */}
                        <div className="flex flex-wrap gap-2 text-xs mb-3">
                          {post.location && (
                            <span className="flex items-center gap-1 text-gray-300">
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {post.location}
                            </span>
                          )}
                          {post.salaryRange && (
                            <span className="flex items-center gap-1 text-green-300">
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {post.salaryRange}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className={`text-sm mb-4 line-clamp-3 flex-grow ${isClosed ? 'text-gray-500' : 'text-gray-300'}`}>
                          {post.description}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.tags.slice(0, isMobile ? 2 : 3).map((tag, i) => (
                              <span key={i} className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs">{tag}</span>
                            ))}
                            {post.tags.length > (isMobile ? 2 : 3) && (
                              <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs">
                                +{post.tags.length - (isMobile ? 2 : 3)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-auto pt-4 border-t border-white/10">
                          <div className="flex justify-between text-xs text-gray-400 mb-3">
                            <span className="truncate max-w-[120px] flex items-center gap-1">{post.posterName}</span>
                            <span className={expiringSoon && !isClosed ? 'text-red-400' : ''}>
                              {formatExpiration(post.expiresAt)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mb-3">
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            <span>{post.viewCount || 0} views</span>
                          </div>
                          <button
                            onClick={() => !isClosed && handlePostClick(post)}
                            disabled={isClosed}
                            className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                              isClosed
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                            }`}
                          >
                            {isClosed ? 'Position Closed' : 'Apply Now →'}
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

export default Jobs;
