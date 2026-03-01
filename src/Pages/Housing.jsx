// src/Pages/Housing.jsx - Housing Listings for International Students

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const Housing = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const housingTypes = [
    { id: 'all', label: 'All' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'room', label: 'Room / Shared' },
    { id: 'studio', label: 'Studio' },
    { id: 'house', label: 'House' },
    { id: 'student-housing', label: 'Student Housing' },
  ];

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true, state: { from: '/housing' } });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const q = query(
      collection(db, 'housing_posts'),
      where('status', 'in', ['active', 'closed']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        availableFrom: doc.data().availableFrom?.toDate(),
      })).filter(p => !p.expiresAt || new Date() < p.expiresAt);

      setPosts(data);
      setFilteredPosts(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching housing posts:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, authLoading]);

  useEffect(() => {
    let filtered = [...posts];

    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.housingType === selectedType);
    }

    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.city && p.city.toLowerCase().includes(loc)) ||
        (p.state && p.state.toLowerCase().includes(p)) ||
        (p.address && p.address.toLowerCase().includes(loc))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      if (sortBy === 'price-low') return (a.monthlyRent || 0) - (b.monthlyRent || 0);
      if (sortBy === 'price-high') return (b.monthlyRent || 0) - (a.monthlyRent || 0);
      return 0;
    });

    setFilteredPosts(filtered);
  }, [posts, selectedType, locationFilter, searchQuery, sortBy]);

  const handlePostClick = async (post) => {
    try {
      await updateDoc(doc(db, 'housing_posts', post.id), { viewCount: (post.viewCount || 0) + 1 });
      if (post.contactLink || post.externalLink) {
        window.open(post.contactLink || post.externalLink, '_blank');
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await updateDoc(doc(db, 'housing_posts', postId), { status: 'deleted', deletedAt: serverTimestamp() });
      toast.success('Listing deleted');
    } catch (e) { toast.error('Error deleting listing'); }
  };

  const handleMarkClosed = async (postId, currentStatus) => {
    const closing = currentStatus !== 'closed';
    if (!window.confirm(closing ? 'Mark as unavailable?' : 'Mark as available again?')) return;
    try {
      await updateDoc(doc(db, 'housing_posts', postId), { status: closing ? 'closed' : 'active' });
      toast.success(closing ? 'Listing marked as unavailable' : 'Listing reopened');
    } catch (e) { toast.error('Error updating listing'); }
  };

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
      'apartment': { label: 'Apartment', cls: 'bg-blue-500/20 text-blue-300' },
      'room': { label: 'Room / Shared', cls: 'bg-purple-500/20 text-purple-300' },
      'studio': { label: 'Studio', cls: 'bg-teal-500/20 text-teal-300' },
      'house': { label: 'House', cls: 'bg-green-500/20 text-green-300' },
      'student-housing': { label: 'Student Housing', cls: 'bg-orange-500/20 text-orange-300' },
    };
    return map[type] || { label: type || 'Housing', cls: 'bg-orange-500/20 text-orange-300' };
  };

  if (authLoading || (currentUser && loading)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading Housing...</p>
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
              <p className="text-orange-400 font-semibold text-sm">🏠 Verified, affordable housing for international students</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4">Housing</h1>
            <p className="text-gray-300 text-base sm:text-lg mb-6">Apartments · Rooms · Studios · Student Housing</p>
            <button
              onClick={() => navigate('/housing/post')}
              className="px-6 py-3 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              List Your Space
            </button>
          </section>

          {/* Type Filter */}
          <section className="mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-start sm:justify-center flex-nowrap sm:flex-wrap">
                {housingTypes.map(type => (
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
            </div>
          </section>

          {/* Search, Location & Sort */}
          <section className="mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm"
                />
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Filter by city or state..."
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
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">
                  <span className="text-orange-400 font-semibold">{filteredPosts.length}</span> listings found
                </span>
                {(searchQuery || locationFilter || selectedType !== 'all') && (
                  <button onClick={() => { setSearchQuery(''); setLocationFilter(''); setSelectedType('all'); }} className="text-orange-400 hover:text-orange-300 font-semibold min-h-[44px] flex items-center">
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Listings Grid */}
          <section>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl sm:text-5xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {posts.length === 0 ? 'No listings yet' : 'No listings match your search'}
                </h3>
                <p className="text-gray-400 mb-8">
                  {posts.length === 0 ? 'Be the first to list a space!' : 'Try adjusting your filters.'}
                </p>
                <button onClick={() => navigate('/housing/post')} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all">
                  List Your Space
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPosts.map((post) => {
                  const typeBadge = getTypeBadge(post.housingType);
                  const isOwnPost = post.posterId === currentUser.uid;
                  const isClosed = post.status === 'closed';
                  return (
                    <div key={post.id} className="group">
                      <div className={`bg-white/5 backdrop-blur-sm border rounded-xl p-5 sm:p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 h-full flex flex-col ${isClosed ? 'border-white/10 opacity-75' : 'border-white/20 hover:border-orange-500/30'}`}>

                        {/* Header */}
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeBadge.cls}`}>{typeBadge.label}</span>
                            {post.studentFriendly && <span className="bg-green-500/20 text-green-300 px-2.5 py-1 rounded-lg text-xs font-semibold">✓ Student-Friendly</span>}
                            {isClosed && <span className="bg-white/10 text-gray-400 px-2.5 py-1 rounded-lg text-xs font-semibold">Unavailable</span>}
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

                        {/* Location */}
                        {(post.city || post.state) && (
                          <p className="flex items-center gap-1 text-orange-400 text-sm font-semibold mb-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {[post.city, post.state].filter(Boolean).join(', ')}
                          </p>
                        )}

                        {/* Price & Details */}
                        <div className="flex flex-wrap gap-2 text-xs mb-3">
                          {post.monthlyRent && (
                            <span className="bg-green-500/20 text-green-300 px-2.5 py-1 rounded-lg font-semibold">
                              ${post.monthlyRent.toLocaleString()}/mo
                            </span>
                          )}
                          {post.bedrooms && <span className="bg-white/10 text-gray-300 px-2.5 py-1 rounded-lg">{post.bedrooms} bed</span>}
                          {post.bathrooms && <span className="bg-white/10 text-gray-300 px-2.5 py-1 rounded-lg">{post.bathrooms} bath</span>}
                          {post.availableFrom && (
                            <span className="bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg">
                              Avail. {post.availableFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        <p className={`text-sm mb-4 line-clamp-3 flex-grow ${isClosed ? 'text-gray-500' : 'text-gray-300'}`}>{post.description}</p>

                        {/* Amenities */}
                        {post.amenities && post.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.amenities.slice(0, 3).map((a, i) => (
                              <span key={i} className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs">{a}</span>
                            ))}
                            {post.amenities.length > 3 && <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs">+{post.amenities.length - 3}</span>}
                          </div>
                        )}

                        {/* Footer */}
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
                            {isClosed ? 'Unavailable' : 'Contact Landlord →'}
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

export default Housing;
