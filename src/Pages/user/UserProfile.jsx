// src/Pages/user/UserProfile.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Message button — only shows if mutual follow
const MessageButton = ({ targetUser, currentUser, navigate }) => {
  const [isMutual, setIsMutual] = React.useState(false);
  React.useEffect(() => {
    if (!currentUser || !targetUser?.uid) return;
    getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
      if (snap.exists()) {
        const { following = [], followers = [] } = snap.data();
        setIsMutual(following.includes(targetUser.uid) && followers.includes(targetUser.uid));
      }
    }).catch(err => console.error('Error checking mutual follow:', err));
  }, [currentUser, targetUser]);
  if (!isMutual) return null;
  return (
    <button
      onClick={() => navigate(`/messages?with=${targetUser.uid}`)}
      className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Message
    </button>
  );
};

const UserProfile = () => {
  const { userEmail } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const userParam = userEmail ? decodeURIComponent(userEmail).trim() : '';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!userParam || !currentUser) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        let userData = null;

        // STEP 1: If the param matches the current user (by email or uid), load their own doc directly
        const isOwnEmail = currentUser.email?.toLowerCase() === userParam.toLowerCase();
        const isOwnUID = currentUser.uid === userParam;

        if (isOwnEmail || isOwnUID) {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          if (snap.exists()) {
            userData = { uid: currentUser.uid, ...snap.data() };
          } else {
            // Doc doesn't exist yet — use auth data as fallback
            userData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0],
              photoURL: currentUser.photoURL || null,
              createdAt: null,
            };
          }
        }

        // STEP 2: UID lookup for other users
        if (!userData && !userParam.includes('@')) {
          const snap = await getDoc(doc(db, 'users', userParam));
          if (snap.exists()) userData = { uid: snap.id, ...snap.data() };
        }

        // STEP 3: Email query for other users
        if (!userData && userParam.includes('@')) {
          try {
            const q = query(collection(db, 'users'), where('email', '==', userParam.toLowerCase()), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) userData = { uid: snap.docs[0].id, ...snap.docs[0].data() };
          } catch (e) {
            console.warn('Email query failed, trying full scan:', e.message);
          }
        }

        // STEP 4: Full scan fallback
        if (!userData) {
          const snap = await getDocs(collection(db, 'users'));
          for (const d of snap.docs) {
            const data = d.data();
            if (
              d.id === userParam ||
              data.uid === userParam ||
              data.email?.toLowerCase() === userParam.toLowerCase()
            ) {
              userData = { uid: d.id, ...data };
              break;
            }
          }
        }

        if (userData) {
          setProfile(userData);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userParam, currentUser]);

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ');
      return parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name[0].toUpperCase();
    }
    return email?.[0]?.toUpperCase() || '?';
  };

  const formatDate = (ts) => {
    if (!ts) return null;
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-white">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (notFound || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-white/5 rounded-2xl p-10 border border-white/20 text-center max-w-md w-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white font-bold">?</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-400 text-sm mb-6">This member hasn't set up their profile yet.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate(-1)} className="flex-1 bg-white/10 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
                Go Back
              </button>
              <button onClick={() => navigate('/members-directory')} className="flex-1 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
                Browse Members
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isOwnProfile = currentUser?.uid === profile.uid || currentUser?.email?.toLowerCase() === profile.email?.toLowerCase();
  const displayName = profile.displayName || profile.email?.split('@')[0] || 'Member';
  const initials = getInitials(displayName, profile.email);

  const visaLabels = {
    'F-1': 'F-1 Student Visa', 'OPT': 'OPT', 'CPT': 'CPT',
    'H-1B': 'H-1B Work Visa', 'J-1': 'J-1 Exchange Visitor',
    'permanent-resident': 'Permanent Resident', 'citizen': 'US Citizen', 'other': 'Other'
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-20 sm:pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl py-8">

          {/* Profile Card */}
          <div className="bg-white/5 rounded-2xl border border-white/20 overflow-hidden mb-6">

            {/* Header banner */}
            <div className="h-24 bg-gradient-to-r from-orange-500/30 to-orange-600/20" />

            {/* Avatar + name */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-5">
                <div>
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={displayName}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-black shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center ring-4 ring-black shadow-xl">
                      <span className="text-3xl text-white font-bold">{initials}</span>
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/dashboard?tab=profile')}
                    className="self-start sm:self-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
                {!isOwnProfile && profile && (
                  <MessageButton targetUser={profile} currentUser={currentUser} navigate={navigate} />
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">{displayName}</h1>

              {profile.createdAt && (
                <p className="text-gray-400 text-sm mb-4">
                  Member since {formatDate(profile.createdAt)}
                </p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {profile.university && (
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">University</p>
                    <p className="text-white font-semibold text-sm">{profile.university}</p>
                  </div>
                )}
                {profile.major && (
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Major</p>
                    <p className="text-white font-semibold text-sm">{profile.major}</p>
                  </div>
                )}
                {profile.visaStatus && (
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Visa Status</p>
                    <p className="text-white font-semibold text-sm">{visaLabels[profile.visaStatus] || profile.visaStatus}</p>
                  </div>
                )}
                {(profile.city || profile.state) && (
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white font-semibold text-sm">
                      {[profile.city, profile.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                {profile.isCompany && profile.companyProfile?.companyName && (
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 sm:col-span-2">
                    <p className="text-white font-semibold text-sm">{profile.companyProfile.companyName}</p>
                    {profile.companyProfile.companyLocation && (
                      <p className="text-gray-400 text-xs mt-0.5">{profile.companyProfile.companyLocation}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Empty state */}
              {!profile.university && !profile.major && !profile.visaStatus && !profile.city && !profile.state && (
                <div className="mt-5 text-center py-6 bg-white/3 rounded-xl border border-white/10">
                  <p className="text-gray-500 text-sm">
                    {isOwnProfile
                      ? 'Your profile is empty. Click Edit Profile to add your details.'
                      : "This member hasn't filled in their profile yet."}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/dashboard?tab=profile')}
                      className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold"
                    >
                      Complete Your Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

        </div>
      </div>
    </>
  );
};

export default UserProfile;
