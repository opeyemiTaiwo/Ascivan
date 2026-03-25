// src/Pages/TalentBoard.jsx — Discover and recruit verified talent
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PremiumBadge } from '../components/PremiumBadge';

const badgeOptions = [
  { id: '', label: 'All Tracks' },
  { id: 'TechDev', label: 'Development' },
  { id: 'TechQA', label: 'Quality Assurance' },
  { id: 'TechMO', label: 'Project Management' },
  { id: 'TechArchs', label: 'Architecture' },
  { id: 'TechLeads', label: 'Leadership' },
  { id: 'TechGuard', label: 'Cybersecurity' },
];

const TalentBoard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Check premium access
  useEffect(() => {
    if (!currentUser) { setCheckingAccess(false); return; }
    getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setIsPremium(data.membershipPlan === 'Premium' || data.role === 'admin');
      }
      setCheckingAccess(false);
    }).catch(() => setCheckingAccess(false));
  }, [currentUser]);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('displayName'), limit(50));
        const snap = await getDocs(q);
        const users = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.onboardingComplete && !u.isCompany && u.uid !== currentUser?.uid);
        setTalents(users);
      } catch (e) {
        console.error('Error fetching talents:', e);
      }
      setLoading(false);
    };
    fetchTalents();
  }, [currentUser]);

  const filtered = talents.filter(t => {
    const matchesSearch = !searchTerm || 
      (t.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBadge = !filterBadge || t.primarySkillTrack === filterBadge;
    return matchesSearch && matchesBadge;
  });

  if (checkingAccess) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  if (!isPremium) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h2>
        <p className="text-gray-500 text-sm mb-6">The Talent Board is available to Premium members. Upgrade to get discovered by recruiters and browse top tech professionals.</p>
        <button onClick={() => navigate('/settings?tab=membership')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
          Upgrade to Premium — $200/year
        </button>
        <p className="text-gray-400 text-xs mt-3">or $20/month</p>
      </div>
    );
  }

  return (
    
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Talent Board</h1>
        <p className="text-gray-500 text-sm mb-6">Discover and connect with verified tech professionals.</p>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={filterBadge}
            onChange={e => setFilterBadge(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            {badgeOptions.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No talent found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(talent => (
              <div
                key={talent.id}
                onClick={() => navigate(`/profile/${encodeURIComponent(talent.email)}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              >
                {talent.photoURL ? (
                  <img src={talent.photoURL} alt={talent.displayName} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {(talent.displayName || 'U')[0]}
                  </div>
                )}
                <p className="text-gray-900 text-sm font-semibold truncate">{talent.displayName || 'User'}</p>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{talent.specialization || talent.primarySkillTrack || 'Tech Professional'}</p>
                {talent.primarySkillTrack && (
                  <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                    {badgeOptions.find(b => b.id === talent.primarySkillTrack)?.label || talent.primarySkillTrack}
                  </span>
                )}
                {talent.badges && talent.badges.length > 0 && (
                  <p className="text-gray-400 text-xs mt-1">{talent.badges.length} badge{talent.badges.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    
  );
};

export default TalentBoard;
