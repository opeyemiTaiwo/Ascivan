// src/Pages/Account.jsx - Account overview: projects joined, projects owned, badges earned
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Account = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ joined: 0, completedJoined: 0, owned: 0, completedOwned: 0, badges: 0 });
  const [memberProjects, setMemberProjects] = useState([]);
  const [ownerProjects, setOwnerProjects] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetch = async () => {
      try {
        const mProjects = [];
        const oProjects = [];
        let badges = 0;

        // Badge count from the user profile
        try {
          const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (userSnap.exists()) badges = (userSnap.data().badges || []).length;
        } catch (e) { console.log('Badge count skipped:', e.message); }

        // Projects I've joined as a member
        try {
          const activeQ = query(collection(db, 'projects'), where('members', 'array-contains', currentUser.uid));
          const activeSnap = await getDocs(activeQ);
          activeSnap.docs.forEach(d => {
            const data = d.data();
            if (data.submitterId === currentUser.uid) return;
            mProjects.push({
              id: d.id,
              title: data.projectTitle || data.title || 'Untitled',
              status: data.reviewStatus === 'rejected' ? 'rejected' : (data.status === 'cancelled' ? 'cancelled' : (data.status === 'completed' ? 'completed' : 'active')),
              completedAt: data.completedAt?.toDate?.() || null,
            });
          });
        } catch (e) { console.log('Member query skipped:', e.message); }

        // Projects I own
        try {
          const ownerQ = query(collection(db, 'projects'), where('submitterId', '==', currentUser.uid));
          const ownerSnap = await getDocs(ownerQ);
          ownerSnap.docs.forEach(d => {
            const data = d.data();
            oProjects.push({
              id: d.id,
              title: data.projectTitle || data.title || 'Untitled',
              memberCount: (data.members || []).filter(m => m !== currentUser.uid).length,
              status: data.reviewStatus === 'rejected' ? 'rejected' : (data.status === 'cancelled' ? 'cancelled' : (data.status === 'completed' ? 'completed' : 'active')),
              completedAt: data.completedAt?.toDate?.() || null,
            });
          });
        } catch (e) { console.log('Owner query skipped:', e.message); }

        setMemberProjects(mProjects);
        setOwnerProjects(oProjects);
        setStats({
          joined: mProjects.length,
          completedJoined: mProjects.filter(p => p.status === 'completed' || p.status === 'rejected').length,
          owned: oProjects.length,
          completedOwned: oProjects.filter(p => p.status === 'completed' || p.status === 'rejected').length,
          badges,
        });
      } catch (e) { console.error('Error:', e); }
      setLoading(false);
    };
    fetch();
  }, [currentUser]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Account</h1>
      <p className="text-gray-500 text-sm mb-6">Your collaborative project activity and earned credentials.</p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Projects Joined</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.joined}</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.completedJoined} completed</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Projects Owned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.owned}</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.completedOwned} completed</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Badges Earned</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.badges}</p>
          <p className="text-gray-400 text-xs mt-0.5">verified credentials</p>
        </div>
      </div>

      {/* Projects joined */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Projects I've Joined</h2>
        {memberProjects.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-3">You haven't joined any projects yet.</p>
            <button onClick={() => navigate('/projects')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all">
              Browse Projects
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {memberProjects.map(p => (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="flex items-center justify-between gap-2 min-w-0 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all">
                <p className="text-gray-900 text-sm font-medium truncate min-w-0">{p.title}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-gray-900 flex-shrink-0 whitespace-nowrap ${p.status === 'completed' ? 'bg-blue-100' : (p.status === 'rejected' || p.status === 'cancelled') ? 'bg-red-100' : 'bg-amber-100'}`}>
                  {p.status === 'completed' ? 'Completed' : p.status === 'rejected' ? 'Rejected' : p.status === 'cancelled' ? 'Closed' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects owned */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-bold text-gray-900 mb-3">Projects I Own</h2>
        {ownerProjects.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-3">You haven't posted any projects yet.</p>
            <button onClick={() => navigate('/projects/submit')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all">
              Post a Project
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {ownerProjects.map(p => (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="flex items-center justify-between gap-2 min-w-0 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all">
                <div className="min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate min-w-0">{p.title}</p>
                  <p className="text-gray-400 text-xs">{p.memberCount} {p.memberCount === 1 ? 'member' : 'members'}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-gray-900 flex-shrink-0 whitespace-nowrap ${p.status === 'completed' ? 'bg-blue-100' : (p.status === 'rejected' || p.status === 'cancelled') ? 'bg-red-100' : 'bg-amber-100'}`}>
                  {p.status === 'completed' ? 'Completed' : p.status === 'rejected' ? 'Rejected' : p.status === 'cancelled' ? 'Closed' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
