// src/Pages/Account.jsx — Earnings overview page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const Account = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({ pending: 0, earned: 0, total: 0 });
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchEarnings = async () => {
      try {
        let pending = 0, earned = 0;
        const activePaid = [];
        const completedPaid = [];

        // Active paid projects
        try {
          const activeQ = query(
            collection(db, 'projects'),
            where('members', 'array-contains', currentUser.uid),
            where('status', '==', 'active')
          );
          const activeSnap = await getDocs(activeQ);
          activeSnap.docs.forEach(d => {
            const data = d.data();
            const budget = parseFloat(data.budget || data.payment || 0);
            if (budget > 0) {
              pending += budget;
              activePaid.push({ id: d.id, title: data.title || 'Untitled', budget, status: 'active', category: data.category || '' });
            }
          });
        } catch (e) { console.log('Active query skipped:', e.message); }

        // Completed paid projects
        try {
          const completedQ = query(
            collection(db, 'projects'),
            where('members', 'array-contains', currentUser.uid),
            where('status', '==', 'completed')
          );
          const completedSnap = await getDocs(completedQ);
          completedSnap.docs.forEach(d => {
            const data = d.data();
            const budget = parseFloat(data.budget || data.payment || 0);
            if (budget > 0) {
              earned += budget;
              completedPaid.push({ id: d.id, title: data.title || 'Untitled', budget, status: 'completed', completedAt: data.completedAt?.toDate?.() || null, category: data.category || '' });
            }
          });
        } catch (e) { console.log('Completed query skipped:', e.message); }

        setEarnings({ pending, earned, total: pending + earned });
        setActiveProjects(activePaid);
        setCompletedProjects(completedPaid);
      } catch (e) {
        console.error('Error fetching earnings:', e);
      }
      setLoading(false);
    };
    fetchEarnings();
  }, [currentUser]);

  const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Account</h1>
      <p className="text-gray-500 text-sm mb-6">Your earnings from paid projects.</p>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-yellow-700 text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{fmt(earnings.pending)}</p>
          <p className="text-yellow-600 text-xs mt-1">From {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-green-700 text-sm mb-1">Earned</p>
          <p className="text-2xl font-bold text-green-700">{fmt(earnings.earned)}</p>
          <p className="text-green-600 text-xs mt-1">From {completedProjects.length} completed project{completedProjects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-blue-700 text-sm mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-700">{fmt(earnings.total)}</p>
          <p className="text-blue-600 text-xs mt-1">Pending + Earned</p>
        </div>
      </div>

      {/* Active Paid Projects */}
      {activeProjects.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Pending Earnings</h3>
          <div className="space-y-3">
            {activeProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-all" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-900 text-sm font-medium truncate">{p.title}</p>
                  {p.category && <p className="text-gray-400 text-xs">{p.category}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-yellow-600 font-semibold text-sm">{fmt(p.budget)}</span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Paid Projects */}
      {completedProjects.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Earned</h3>
          <div className="space-y-3">
            {completedProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-all" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-900 text-sm font-medium truncate">{p.title}</p>
                  <p className="text-gray-400 text-xs">{p.completedAt ? p.completedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Completed'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-green-600 font-semibold text-sm">{fmt(p.budget)}</span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-green-50 text-green-700 rounded-md">Earned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeProjects.length === 0 && completedProjects.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-900 font-semibold mb-1">No paid projects yet</p>
          <p className="text-gray-500 text-sm mb-4">Join paid projects to start earning.</p>
          <button onClick={() => navigate('/projects')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all">
            Browse Projects
          </button>
        </div>
      )}
    </div>
  );
};

export default Account;
