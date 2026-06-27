// src/Pages/ProofWall.jsx
// The Proof Wall — a feed of verified achievements (not social posts).
// Reads system-generated events + limited work updates from the `activity` collection.
// Members can share a work-focused project update; everything else is auto-generated proof.

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActivity, logActivity, ACTIVITY_TYPES, toggleCelebrate, editUpdate, deleteActivityItem } from '../utils/activityFeed';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const fmtAgo = (ts) => {
  try {
    const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
    if (!d) return '';
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  } catch { return ''; }
};

// Icon + color treatment per activity type (badge-forward "trophy wall" feel).
const typeStyle = {
  badge:     { bg: 'bg-amber-100',  fg: 'text-amber-600',  shape: 'rounded-xl', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ship:      { bg: 'bg-green-100',  fg: 'text-green-600',  shape: 'rounded-xl', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  lead:      { bg: 'bg-blue-100',   fg: 'text-blue-600',   shape: 'rounded-xl', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2zm9-13.5V9' },
  milestone: { bg: 'bg-purple-100', fg: 'text-purple-600', shape: 'rounded-xl', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  update:    { bg: 'bg-gray-100',   fg: 'text-gray-600',   shape: 'rounded-full', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
};

// Render the headline sentence for each event type.
const renderHeadline = (a) => {
  const name = <span className="font-semibold">{a.actorName || 'A member'}</span>;
  const proj = a.projectTitle ? <span className="font-semibold">{a.projectTitle}</span> : null;
  switch (a.type) {
    case 'badge':
      return <>{name} earned the <span className="font-semibold">{a.badgeName}</span> badge</>;
    case 'ship':
      return <>{name} shipped {proj}</>;
    case 'lead':
      return a.actorId
        ? <>{name} stepped up to lead {proj}</>
        : <>{proj} is looking for a lead</>;
    case 'milestone':
      return <>{name} {a.meta ? a.meta.replace(/^Completed /, 'completed ') : 'reached a milestone'}</>;
    case 'update':
      return <>{name} posted an update on {proj}</>;
    default:
      return <>{name}</>;
  }
};

const FILTERS = [
  { id: '', label: 'All activity' },
  { id: 'badge', label: 'Badges earned' },
  { id: 'ship', label: 'Projects shipped' },
  { id: 'lead', label: 'Needs a lead' },
  { id: 'update', label: 'Updates' },
];

const ProofWall = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [myData, setMyData] = useState(null);

  // Share-update composer
  const [showCompose, setShowCompose] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [updateProject, setUpdateProject] = useState('');
  const [posting, setPosting] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editProject, setEditProject] = useState('');

  const uid = currentUser?.uid;

  // Optimistic celebrate toggle
  const handleCelebrate = async (a) => {
    if (!uid) return;
    const celebrated = (a.celebratedBy || []).includes(uid);
    const myName = myData?.displayName || currentUser?.displayName || 'You';
    // optimistic update
    setItems(prev => prev.map(x => {
      if (x.id !== a.id) return x;
      const names = { ...(x.celebratedByNames || {}) };
      if (celebrated) delete names[uid]; else names[uid] = myName;
      return {
        ...x,
        celebratedBy: celebrated ? (x.celebratedBy || []).filter(u => u !== uid) : [...(x.celebratedBy || []), uid],
        celebrateCount: Math.max(0, (x.celebrateCount || 0) + (celebrated ? -1 : 1)),
        celebratedByNames: names,
      };
    }));
    try {
      await toggleCelebrate(a.id, uid, celebrated, myName);
    } catch (e) {
      console.error(e);
      toast.error('Could not update reaction.');
      load(filter);
    }
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setEditText(a.text || '');
    setEditProject(a.projectTitle || '');
  };

  const saveEdit = async (a) => {
    if (!editText.trim()) { toast.error('Update can\u2019t be empty.'); return; }
    try {
      await editUpdate(a.id, editText.trim(), editProject.trim());
      setItems(prev => prev.map(x => x.id === a.id ? { ...x, text: editText.trim(), projectTitle: editProject.trim() } : x));
      setEditingId(null);
      toast.success('Update edited.');
    } catch (e) { console.error(e); toast.error('Could not save edit.'); }
  };

  const handleDelete = async (a) => {
    if (!window.confirm('Delete this update? This cannot be undone.')) return;
    try {
      await deleteActivityItem(a.id);
      setItems(prev => prev.filter(x => x.id !== a.id));
      toast.success('Update deleted.');
    } catch (e) { console.error(e); toast.error('Could not delete.'); }
  };

  const load = useCallback(async (f) => {
    setLoading(true);
    setItems(await getActivity(50, f || null));
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  useEffect(() => {
    if (!currentUser) return;
    getDoc(doc(db, 'users', currentUser.uid))
      .then(s => { if (s.exists()) setMyData({ uid: currentUser.uid, ...s.data() }); })
      .catch(() => {});
  }, [currentUser]);

  const handlePostUpdate = async () => {
    if (!updateText.trim() || !updateProject.trim()) {
      toast.error('Add a project name and your update.');
      return;
    }
    setPosting(true);
    try {
      await logActivity({
        type: 'update',
        actorId: currentUser.uid,
        actorName: myData?.displayName || 'A member',
        projectTitle: updateProject.trim(),
        text: updateText.trim(),
      });
      toast.success('Update shared.');
      setUpdateText(''); setUpdateProject(''); setShowCompose(false);
      load(filter);
    } catch (e) {
      console.error(e);
      toast.error('Could not share your update.');
    }
    setPosting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Proof Wall</h1>
        <button
          onClick={() => setShowCompose(v => !v)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Share a project update
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-5">Verified milestones from across Loomiqe. Earned, not posted.</p>

      {/* Composer (work-focused, not personal) */}
      {showCompose && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
          <input
            value={updateProject}
            onChange={e => setUpdateProject(e.target.value)}
            placeholder="Which project is this about?"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <textarea
            value={updateText}
            onChange={e => setUpdateText(e.target.value)}
            placeholder="Share a real update on the work — progress, a milestone, what you need next."
            rows={3}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCompose(false)} className="text-gray-500 text-sm font-semibold px-3 py-1.5">Cancel</button>
            <button onClick={handlePostUpdate} disabled={posting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg disabled:opacity-50">
              {posting ? 'Sharing…' : 'Share update'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              filter === f.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Wall */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-gray-900 font-semibold">Nothing here yet</p>
          <p className="text-gray-500 text-sm mt-1">Earn a badge, ship a project, or lead one, and it shows up here as proof.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map(a => {
            const st = typeStyle[a.type] || typeStyle.update;
            const celebrated = uid && (a.celebratedBy || []).includes(uid);
            const count = a.celebrateCount || 0;
            const isMine = uid && a.actorId === uid && a.type === 'update';
            const isEditing = editingId === a.id;
            return (
              <div key={a.id} className="flex gap-3.5 items-start bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4">
                <div className={`w-10 h-10 ${st.shape} ${st.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 ${st.fg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={st.icon} /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-[15px] text-gray-900 leading-relaxed">{renderHeadline(a)}</div>

                  {/* Inline edit mode (own updates only) */}
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <input
                        value={editProject}
                        onChange={e => setEditProject(e.target.value)}
                        placeholder="Project name"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(a)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs font-semibold px-3 py-1.5">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    a.type === 'update' && a.text && (
                      <div className="text-sm text-gray-600 mt-1.5 leading-relaxed">{a.text}</div>
                    )
                  )}

                  <div className="text-xs text-gray-400 mt-1.5">
                    {a.type === 'update' ? 'Project update' : (ACTIVITY_TYPES[a.type]?.label || 'Activity')}
                    {a.meta && a.type !== 'milestone' ? <> · {a.meta}</> : null}
                    {a.createdAt ? <> · {fmtAgo(a.createdAt)}</> : null}
                  </div>

                  {/* Actions row: Love (all) + edit/delete (own updates) */}
                  {!isEditing && (
                    <div className="mt-2.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCelebrate(a)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                            celebrated ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={celebrated ? 'You loved this' : 'Love this'}
                        >
                          <span aria-hidden="true">{celebrated ? '❤️' : '🤍'}</span>
                          Love{count > 0 ? <span className="font-bold"> · {count}</span> : null}
                        </button>
                        {isMine && (
                          <>
                            <button onClick={() => startEdit(a)} className="text-xs font-semibold text-gray-500 hover:text-gray-800">Edit</button>
                            <button onClick={() => handleDelete(a)} className="text-xs font-semibold text-gray-500 hover:text-red-600">Delete</button>
                          </>
                        )}
                      </div>
                      {count > 0 && a.celebratedByNames && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          Loved by {(() => {
                            const names = Object.values(a.celebratedByNames);
                            if (names.length <= 2) return names.join(' and ');
                            return `${names.slice(0, 2).join(', ')} and ${names.length - 2} other${names.length - 2 > 1 ? 's' : ''}`;
                          })()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProofWall;
