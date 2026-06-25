// src/Pages/admin/AdminPanel.jsx — Platform admin dashboard (admin-only)
// Tabs: Overview (stats) · Projects · Users · Generate · Moderation
// Gated by users/{uid}.role === 'admin'.

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc,
  query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { generateProject } from '../../utils/projectGenerator';

const fmtDate = (ts) => {
  try {
    const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
    return d ? d.toLocaleDateString() : '—';
  } catch { return '—'; }
};

const statusStyle = {
  lead_recruitment: 'bg-amber-100 text-amber-700',
  setup: 'bg-purple-100 text-purple-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState('overview');

  const [stats, setStats] = useState({ users: 0, projects: 0, posts: 0, badges: 0, completed: 0, leadRecruitment: 0 });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Generate tab
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draft, setDraft] = useState(null);

  const [userSearch, setUserSearch] = useState('');

  // --- Admin gate ---
  useEffect(() => {
    if (!currentUser) { navigate('/login', { replace: true }); return; }
    getDoc(doc(db, 'users', currentUser.uid))
      .then(snap => {
        const role = snap.exists() ? snap.data().role : null;
        if (role !== 'admin') {
          toast.error('Admins only');
          navigate('/dashboard', { replace: true });
          return;
        }
        setIsAdmin(true);
      })
      .catch(() => navigate('/dashboard', { replace: true }))
      .finally(() => setChecking(false));
  }, [currentUser, navigate]);

  // --- Load all data once admin-confirmed ---
  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [usersSnap, projectsSnap, postsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'projects')),
        getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))).catch(() => getDocs(collection(db, 'posts'))),
      ]);

      const userList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const projectList = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const postList = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      let badgeTotal = 0;
      userList.forEach(u => { badgeTotal += Array.isArray(u.badges) ? u.badges.length : 0; });

      setUsers(userList);
      setProjects(projectList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setPosts(postList);
      setStats({
        users: userList.length,
        projects: projectList.length,
        posts: postList.length,
        badges: badgeTotal,
        completed: projectList.filter(p => p.status === 'completed').length,
        leadRecruitment: projectList.filter(p => p.status === 'lead_recruitment').length,
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load admin data.');
    }
    setLoadingData(false);
  }, []);

  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin, loadData]);

  // --- Actions ---
  const toggleAdmin = async (u) => {
    const makeAdmin = u.role !== 'admin';
    if (u.id === currentUser.uid && !makeAdmin) {
      toast.error("You can't remove your own admin access.");
      return;
    }
    if (!window.confirm(`${makeAdmin ? 'Promote' : 'Demote'} ${u.displayName || u.email}?`)) return;
    try {
      await updateDoc(doc(db, 'users', u.id), { role: makeAdmin ? 'admin' : 'member' });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: makeAdmin ? 'admin' : 'member' } : x));
      toast.success(`${makeAdmin ? 'Promoted to admin' : 'Demoted to member'}.`);
    } catch (e) { console.error(e); toast.error('Update failed.'); }
  };

  const deleteProject = async (p) => {
    if (!window.confirm(`Delete project "${p.projectTitle || p.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'projects', p.id));
      setProjects(prev => prev.filter(x => x.id !== p.id));
      setStats(s => ({ ...s, projects: s.projects - 1 }));
      toast.success('Project deleted.');
    } catch (e) { console.error(e); toast.error('Delete failed.'); }
  };

  const deletePost = async (p) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'posts', p.id));
      setPosts(prev => prev.filter(x => x.id !== p.id));
      setStats(s => ({ ...s, posts: s.posts - 1 }));
      toast.success('Post deleted.');
    } catch (e) { console.error(e); toast.error('Delete failed.'); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      setDraft(await generateProject());
      toast.success('Generated — review and publish.');
    } catch (e) { console.error(e); toast.error('Generation failed.'); }
    setGenerating(false);
  };

  const handlePublish = async () => {
    if (!draft) return;
    setPublishing(true);
    try {
      await addDoc(collection(db, 'projects'), {
        projectTitle: draft.projectTitle,
        projectDescription: draft.projectDescription,
        projectGoals: draft.projectGoals || null,
        industryTrack: draft.industryTrack,
        timeline: 'flexible',
        proposedRoles: draft.proposedRoles,
        teamRoles: [],
        maxTeamSize: 0,
        status: 'lead_recruitment',
        isActive: true,
        isGenerated: true,
        leadConfirmed: false,
        submitterId: null,
        submitterEmail: null,
        submitterName: 'Loomiqe (Auto-generated)',
        isCompanyPost: false,
        viewCount: 0,
        applicationCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Published in lead recruitment.');
      setDraft(null);
      loadData();
      setTab('projects');
    } catch (e) { console.error(e); toast.error('Publish failed.'); }
    setPublishing(false);
  };

  if (checking) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }
  if (!isAdmin) return null;

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (u.displayName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const tabs = [
    ['overview', 'Overview'],
    ['projects', 'Projects'],
    ['users', 'Users'],
    ['generate', 'Generate'],
    ['moderation', 'Moderation'],
  ];

  const StatCard = ({ label, value, sub }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Manage projects, users, and content across Loomiqe.</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {label}
          </button>
        ))}
      </div>

      {loadingData && <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>}

      {/* OVERVIEW */}
      {!loadingData && tab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total Users" value={stats.users} />
          <StatCard label="Total Projects" value={stats.projects} sub={`${stats.completed} completed`} />
          <StatCard label="Awaiting Lead" value={stats.leadRecruitment} sub="lead recruitment" />
          <StatCard label="Community Posts" value={stats.posts} sub="recent (last 50)" />
          <StatCard label="Badges Issued" value={stats.badges} />
          <StatCard label="Admins" value={users.filter(u => u.role === 'admin').length} />
        </div>
      )}

      {/* PROJECTS */}
      {!loadingData && tab === 'projects' && (
        <div className="space-y-2">
          {projects.length === 0 ? <p className="text-gray-400 text-sm">No projects yet.</p> : projects.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3">
              <div className="min-w-0">
                <p className="text-gray-900 text-sm font-medium truncate">{p.projectTitle || p.title || 'Untitled'}</p>
                <p className="text-gray-400 text-xs">
                  {p.isGenerated ? 'Auto-generated' : `by ${p.submitterName || 'Owner'}`} · {fmtDate(p.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusStyle[p.status] || 'bg-gray-100 text-gray-600'}`}>
                  {(p.status || 'unknown').replace('_', ' ')}
                </span>
                <button onClick={() => navigate(`/projects/${p.id}`)} className="text-blue-600 text-xs font-semibold">View</button>
                <button onClick={() => deleteProject(p)} className="text-red-500 text-xs font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {!loadingData && tab === 'users' && (
        <div>
          <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email"
            className="w-full mb-4 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3">
                <div className="min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">
                    {u.displayName || 'No name'}
                    {u.role === 'admin' && <span className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">ADMIN</span>}
                    {u.isCompany && <span className="ml-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">COMPANY</span>}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{u.email} · {u.country || 'no country'} · joined {fmtDate(u.createdAt)}</p>
                </div>
                <button onClick={() => toggleAdmin(u)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${u.role === 'admin' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && <p className="text-gray-400 text-sm">No users match.</p>}
          </div>
        </div>
      )}

      {/* GENERATE */}
      {!loadingData && tab === 'generate' && (
        <div>
          <p className="text-gray-500 text-sm mb-4">Generate a software or AI project (no physical prototypes). It publishes in lead recruitment — anyone can apply to lead, then the confirmed lead refines it and opens the team.</p>
          <button onClick={handleGenerate} disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-50">
            {generating ? 'Generating…' : draft ? 'Regenerate' : 'Generate a Project'}
          </button>
          {draft && (
            <div className="mt-5 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div><p className="text-gray-400 text-xs uppercase font-semibold">Title</p><p className="text-gray-900 font-bold">{draft.projectTitle}</p></div>
              <div><p className="text-gray-400 text-xs uppercase font-semibold">Industry</p><p className="text-gray-700 text-sm capitalize">{draft.industryTrack}</p></div>
              <div><p className="text-gray-400 text-xs uppercase font-semibold">Description</p><p className="text-gray-700 text-sm">{draft.projectDescription}</p></div>
              {draft.projectGoals && <div><p className="text-gray-400 text-xs uppercase font-semibold">Goals</p><p className="text-gray-700 text-sm">{draft.projectGoals}</p></div>}
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Proposed Roles</p>
                <div className="space-y-1">
                  {draft.proposedRoles.map((r, i) => (
                    <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">{r.role} · <span className="capitalize">{r.experienceLevel}</span> · {r.count} {r.count === 1 ? 'person' : 'people'}</div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handlePublish} disabled={publishing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-lg disabled:opacity-50">
                  {publishing ? 'Publishing…' : 'Publish in Lead Recruitment'}
                </button>
                <button onClick={() => setDraft(null)} disabled={publishing} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg">Discard</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODERATION */}
      {!loadingData && tab === 'moderation' && (
        <div className="space-y-2">
          <p className="text-gray-500 text-sm mb-2">Recent community posts (latest 50). Delete anything that violates guidelines.</p>
          {posts.length === 0 ? <p className="text-gray-400 text-sm">No posts.</p> : posts.map(p => (
            <div key={p.id} className="flex items-start justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3">
              <div className="min-w-0">
                <p className="text-gray-900 text-xs font-semibold">{p.authorName || 'Unknown'} <span className="text-gray-400 font-normal">· {fmtDate(p.createdAt)}</span></p>
                {p.title && <p className="text-gray-800 text-sm font-medium mt-0.5">{p.title}</p>}
                <p className="text-gray-600 text-sm mt-0.5 line-clamp-3">{p.content || '(no text)'}</p>
              </div>
              <button onClick={() => deletePost(p)} className="flex-shrink-0 text-red-500 text-xs font-semibold">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
