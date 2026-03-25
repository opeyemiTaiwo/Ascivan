// src/Pages/Account.jsx — Earnings & Disbursements for members and owners
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const Account = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [memberEarnings, setMemberEarnings] = useState({ pending: 0, earned: 0 });
  const [ownerDisbursements, setOwnerDisbursements] = useState({ pending: 0, disbursed: 0 });
  const [memberProjects, setMemberProjects] = useState([]);
  const [ownerProjects, setOwnerProjects] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetch = async () => {
      try {
        let mPending = 0, mEarned = 0;
        let oPending = 0, oDisbursed = 0;
        const mProjects = [];
        const oProjects = [];

        // Get user's approved applications to find their role + payment
        const appQ = query(collection(db, 'project_applications'), where('applicantUid', '==', currentUser.uid), where('status', '==', 'approved'));
        const appSnap = await getDocs(appQ);
        const myApps = {};
        appSnap.docs.forEach(d => { const a = d.data(); myApps[a.projectId] = a; });

        // Member: active paid projects
        try {
          const activeQ = query(collection(db, 'projects'), where('members', 'array-contains', currentUser.uid));
          const activeSnap = await getDocs(activeQ);
          activeSnap.docs.forEach(d => {
            const data = d.data();
            if (data.pricingType !== 'paid' || data.submitterId === currentUser.uid) return;
            const app = myApps[d.id];
            const myRole = app?.role || '';
            const roleData = (data.teamRoles || []).find(r => r.role === myRole);
            const myPay = parseFloat(roleData?.paymentPerPerson || 0);
            if (myPay <= 0) return;
            const isCompleted = data.status === 'completed';
            if (isCompleted) { mEarned += myPay; } else { mPending += myPay; }
            mProjects.push({
              id: d.id, title: data.projectTitle || data.title || 'Untitled',
              role: myRole, amount: myPay,
              status: isCompleted ? 'earned' : 'pending',
              completedAt: data.completedAt?.toDate?.() || null,
            });
          });
        } catch (e) { console.log('Member query skipped:', e.message); }

        // Owner: projects I own
        try {
          const ownerQ = query(collection(db, 'projects'), where('submitterId', '==', currentUser.uid));
          const ownerSnap = await getDocs(ownerQ);
          ownerSnap.docs.forEach(d => {
            const data = d.data();
            if (data.pricingType !== 'paid') return;
            const totalBudget = parseFloat(data.totalBudget || 0);
            if (totalBudget <= 0) return;
            const memberCount = (data.members || []).filter(m => m !== currentUser.uid).length;
            const isCompleted = data.status === 'completed';
            if (isCompleted) { oDisbursed += totalBudget; } else { oPending += totalBudget; }
            oProjects.push({
              id: d.id, title: data.projectTitle || data.title || 'Untitled',
              totalBudget, memberCount,
              roles: (data.teamRoles || []).map(r => `${r.role}: $${r.paymentPerPerson} × ${r.count}`),
              status: isCompleted ? 'disbursed' : 'pending',
              completedAt: data.completedAt?.toDate?.() || null,
            });
          });
        } catch (e) { console.log('Owner query skipped:', e.message); }

        setMemberEarnings({ pending: mPending, earned: mEarned });
        setOwnerDisbursements({ pending: oPending, disbursed: oDisbursed });
        setMemberProjects(mProjects);
        setOwnerProjects(oProjects);
      } catch (e) { console.error('Error:', e); }
      setLoading(false);
    };
    fetch();
  }, [currentUser]);

  const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  const hasMember = memberProjects.length > 0;
  const hasOwner = ownerProjects.length > 0;
  const hasNothing = !hasMember && !hasOwner;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Account</h1>
      <p className="text-gray-500 text-sm mb-6">Track your earnings and project disbursements.</p>

      {/* Member Earnings */}
      {hasMember && (
        <>
          <h2 className="text-base font-bold text-gray-900 mb-3">My Earnings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <p className="text-orange-700 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-700">{fmt(memberEarnings.pending)}</p>
              <p className="text-orange-600 text-xs mt-1">From {memberProjects.filter(p => p.status === 'pending').length} active project(s)</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-blue-700 text-sm mb-1">Earned</p>
              <p className="text-2xl font-bold text-blue-700">{fmt(memberEarnings.earned)}</p>
              <p className="text-blue-600 text-xs mt-1">From {memberProjects.filter(p => p.status === 'earned').length} completed project(s)</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-700 text-sm mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(memberEarnings.pending + memberEarnings.earned)}</p>
              <p className="text-gray-500 text-xs mt-1">Pending + Earned</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Project Breakdown</h3>
            <div className="space-y-2">
              {memberProjects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 text-sm font-medium truncate">{p.title}</p>
                    <p className="text-gray-400 text-xs">Role: {p.role}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`font-semibold text-sm ${p.status === 'earned' ? 'text-blue-600' : 'text-orange-600'}`}>{fmt(p.amount)}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${p.status === 'earned' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>{p.status === 'earned' ? 'Earned' : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Owner Disbursements */}
      {hasOwner && (
        <>
          <h2 className="text-base font-bold text-gray-900 mb-3">Project Disbursements (as Owner)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <p className="text-orange-700 text-sm mb-1">To Disburse</p>
              <p className="text-2xl font-bold text-orange-700">{fmt(ownerDisbursements.pending)}</p>
              <p className="text-orange-600 text-xs mt-1">From {ownerProjects.filter(p => p.status === 'pending').length} active project(s)</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-blue-700 text-sm mb-1">Disbursed</p>
              <p className="text-2xl font-bold text-blue-700">{fmt(ownerDisbursements.disbursed)}</p>
              <p className="text-blue-600 text-xs mt-1">From {ownerProjects.filter(p => p.status === 'disbursed').length} completed project(s)</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-700 text-sm mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(ownerDisbursements.pending + ownerDisbursements.disbursed)}</p>
              <p className="text-gray-500 text-xs mt-1">All paid projects</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Project Breakdown</h3>
            <div className="space-y-3">
              {ownerProjects.map(p => (
                <div key={p.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-900 text-sm font-medium truncate">{p.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className={`font-semibold text-sm ${p.status === 'disbursed' ? 'text-blue-600' : 'text-orange-600'}`}>{fmt(p.totalBudget)}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${p.status === 'disbursed' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>{p.status === 'disbursed' ? 'Disbursed' : 'To Disburse'}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">{p.memberCount} member(s) — {p.roles.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {hasNothing && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-900 font-semibold mb-1">No paid projects yet</p>
          <p className="text-gray-500 text-sm mb-4">Join or create paid projects to track earnings here.</p>
          <button onClick={() => navigate('/projects')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all">Browse Projects</button>
        </div>
      )}
    </div>
  );
};

export default Account;
