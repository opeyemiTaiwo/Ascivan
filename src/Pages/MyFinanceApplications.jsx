// src/Pages/MyFinanceApplications.jsx
// Tracks finance opportunities (scholarships, grants, etc.) the user has applied to or saved

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  collection, query, where, onSnapshot, orderBy,
  doc, deleteDoc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const statusColors = {
  interested:  { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/30',   label: 'Interested'    },
  applied:     { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', label: 'Applied'       },
  in_review:   { bg: 'bg-orange-500/20', text: 'text-orange-500', border: 'border-orange-500/30', label: 'Under Review'  },
  awarded:     { bg: 'bg-blue-500/20',  text: 'text-blue-500',  border: 'border-blue-500/30',  label: 'Awarded'       },
  not_selected:{ bg: 'bg-red-500/20',    text: 'text-red-300',    border: 'border-red-500/30',    label: 'Not Selected'  },
};

const categoryColors = {
  scholarships:    'text-blue-500',
  loans:           'text-blue-400',
  'work-study':    'text-orange-400',
  grants:          'text-blue-400',
  assistantships:  'text-blue-500',
  fellowships:     'text-orange-500',
};

const MyFinanceApplications = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [entries, setEntries]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Manual-add modal state
  const [showAddModal, setShowAddModal]   = useState(false);
  const [addForm, setAddForm]             = useState({
    title: '', category: 'scholarships', resourceUrl: '', notes: '', status: 'applied',
  });
  const [addSaving, setAddSaving] = useState(false);

  // Status-update modal
  const [editEntry, setEditEntry]   = useState(null);
  const [editStatus, setEditStatus] = useState('applied');
  const [editNotes, setEditNotes]   = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true, state: { from: '/finance/my-applications', message: 'Please sign in to view your finance applications' } });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'finance_applications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q,
      (snap) => {
        setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Error loading finance applications:', err);
        toast.error('Error loading your finance tracker');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  // ── Filters ──────────────────────────────────────────────────────────
  const filtered = entries.filter(e => {
    const statusMatch   = filterStatus === 'all'   || e.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || e.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const statCounts = {
    total:        entries.length,
    applied:      entries.filter(e => e.status === 'applied').length,
    awarded:      entries.filter(e => e.status === 'awarded').length,
    in_review:    entries.filter(e => e.status === 'in_review').length,
    not_selected: entries.filter(e => e.status === 'not_selected').length,
  };

  // ── Add manually ─────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addForm.title.trim()) { toast.error('Title is required'); return; }
    setAddSaving(true);
    try {
      await addDoc(collection(db, 'finance_applications'), {
        userId:      currentUser.uid,
        userEmail:   currentUser.email,
        title:       addForm.title.trim(),
        category:    addForm.category,
        resourceUrl: addForm.resourceUrl.trim() || null,
        notes:       addForm.notes.trim() || null,
        status:      addForm.status,
        source:      'manual',
        createdAt:   serverTimestamp(),
        updatedAt:   serverTimestamp(),
      });
      toast.success('Added to your finance tracker!');
      setShowAddModal(false);
      setAddForm({ title: '', category: 'scholarships', resourceUrl: '', notes: '', status: 'applied' });
    } catch (err) {
      console.error('Error adding entry:', err);
      toast.error('Failed to add entry');
    } finally {
      setAddSaving(false);
    }
  };

  // ── Update status / notes ─────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editEntry) return;
    setEditSaving(true);
    try {
      await updateDoc(doc(db, 'finance_applications', editEntry.id), {
        status:    editStatus,
        notes:     editNotes.trim() || null,
        updatedAt: serverTimestamp(),
      });
      toast.success('Updated!');
      setEditEntry(null);
    } catch (err) {
      console.error('Error updating entry:', err);
      toast.error('Failed to update');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this entry from your tracker?')) return;
    try {
      await deleteDoc(doc(db, 'finance_applications', id));
      toast.success('Removed');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to remove entry');
    }
  };

  const inputCls = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm transition-all min-h-[44px]";
  const labelCls = "block text-blue-400 font-semibold mb-1.5 text-sm";

  if (authLoading || !currentUser) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000' }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-20 sm:py-28">

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Finance{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-400">
                Applied To
              </span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Track scholarships, grants, and financial opportunities you have applied to
            </p>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
            {[
              { label: 'Total',        value: statCounts.total,        color: 'text-white'       },
              { label: 'Applied',      value: statCounts.applied,      color: 'text-orange-400'  },
              { label: 'Under Review', value: statCounts.in_review,    color: 'text-orange-500'  },
              { label: 'Awarded',      value: statCounts.awarded,      color: 'text-blue-400'   },
              { label: 'Not Selected', value: statCounts.not_selected, color: 'text-red-400'     },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-center">
                <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-[10px] xs:text-xs mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Filter + Add button ── */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 space-y-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-white font-semibold text-sm mb-2">Filter by Status</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all',          label: 'All'          },
                      { id: 'interested',   label: 'Interested'   },
                      { id: 'applied',      label: 'Applied'      },
                      { id: 'in_review',    label: 'Under Review' },
                      { id: 'awarded',      label: 'Awarded'      },
                      { id: 'not_selected', label: 'Not Selected' },
                    ].map(f => (
                      <button key={f.id} onClick={() => setFilterStatus(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                          filterStatus === f.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-600 hover:bg-white/20'
                        }`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-2">Filter by Category</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all',            label: 'All'            },
                      { id: 'scholarships',   label: 'Scholarships'   },
                      { id: 'loans',          label: 'Loans'          },
                      { id: 'work-study',     label: 'Work-Study'     },
                      { id: 'grants',         label: 'Grants'         },
                      { id: 'assistantships', label: 'Assistantships' },
                      { id: 'fellowships',    label: 'Fellowships'    },
                    ].map(f => (
                      <button key={f.id} onClick={() => setFilterCategory(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                          filterCategory === f.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/10 text-gray-600 hover:bg-white/20'
                        }`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto sm:self-start flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Track New
              </button>
            </div>
          </div>

          {/* ── List ── */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading your tracker...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-white text-xl font-bold mb-2">
                {entries.length === 0 ? 'Nothing tracked yet' : 'No results'}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {entries.length === 0
                  ? 'Browse finance resources and start tracking what you apply to.'
                  : 'No entries match your selected filters.'}
              </p>
              {entries.length === 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/finance"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-sm transition-all hover:from-blue-500 hover:to-blue-600">
                    Browse Resources
                  </Link>
                  <button onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/20">
                    Add Manually
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(entry => {
                const status   = statusColors[entry.status]  || statusColors.applied;
                const catColor = categoryColors[entry.category] || 'text-gray-400';
                const date     = entry.createdAt?.toDate?.() || (entry.createdAt ? new Date(entry.createdAt) : null);
                const updated  = entry.updatedAt?.toDate?.() || null;

                return (
                  <div key={entry.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/[0.07] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-sm sm:text-base">{entry.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${status.bg} ${status.text} border ${status.border}`}>
                            {status.label}
                          </span>
                        </div>

                        {entry.category && (
                          <p className={`text-xs font-semibold capitalize mb-1 ${catColor}`}>
                            {entry.category}
                          </p>
                        )}

                        {entry.notes && (
                          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-1 line-clamp-2">{entry.notes}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-500 text-xs">
                          {date && <span>Added {date.toLocaleDateString()}</span>}
                          {updated && updated.getTime() !== date?.getTime() && (
                            <span>Updated {updated.toLocaleDateString()}</span>
                          )}
                          {entry.resourceUrl && (
                            <a href={entry.resourceUrl} target="_blank" rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-500 font-medium underline underline-offset-2 transition-colors"
                              onClick={e => e.stopPropagation()}>
                              View Resource
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 mt-1 sm:mt-0">
                        <button
                          onClick={() => { setEditEntry(entry); setEditStatus(entry.status); setEditNotes(entry.notes || ''); }}
                          className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-600 rounded-lg text-xs font-semibold transition-all min-h-[40px]">
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-semibold transition-all min-h-[40px]">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Back to Dashboard ── */}
          <div className="mt-10 text-center">
            <Link to="/dashboard" className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* ── Add Entry Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
             onClick={() => setShowAddModal(false)}>
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]"
               onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-5 border-b border-white/10 flex-shrink-0">
              <h3 className="text-white font-bold text-base sm:text-lg">Track a Finance Opportunity</h3>
              <p className="text-gray-400 text-xs mt-0.5">Add a scholarship, grant, or other opportunity you have applied to</p>
            </div>
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className={labelCls}>Title *</label>
                <input type="text" value={addForm.title}
                  onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                  className={inputCls} placeholder="e.g., Gates Scholarship 2025" />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={addForm.category}
                  onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                  className={inputCls}>
                  <option value="scholarships">Scholarships</option>
                  <option value="loans">Loans</option>
                  <option value="work-study">Work-Study</option>
                  <option value="grants">Grants</option>
                  <option value="assistantships">Assistantships</option>
                  <option value="fellowships">Fellowships</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={addForm.status}
                  onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))}
                  className={inputCls}>
                  <option value="interested">Interested</option>
                  <option value="applied">Applied</option>
                  <option value="in_review">Under Review</option>
                  <option value="awarded">Awarded</option>
                  <option value="not_selected">Not Selected</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Resource URL</label>
                <input type="url" value={addForm.resourceUrl}
                  onChange={e => setAddForm(p => ({ ...p, resourceUrl: e.target.value }))}
                  className={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={addForm.notes}
                  onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))}
                  className={inputCls + ' resize-none'} rows={3}
                  placeholder="Deadline, requirements, amount, etc." />
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-white/10 flex gap-3 flex-shrink-0">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all min-h-[44px]">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={addSaving}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 min-h-[44px]">
                {addSaving ? 'Saving...' : 'Add to Tracker'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Status Modal ── */}
      {editEntry && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
             onClick={() => setEditEntry(null)}>
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-t-2xl sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80dvh] sm:max-h-[90vh]"
               onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-5 border-b border-white/10 flex-shrink-0">
              <h3 className="text-white font-bold text-base">Update Status</h3>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{editEntry.title}</p>
            </div>
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className={labelCls}>Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className={inputCls}>
                  <option value="interested">Interested</option>
                  <option value="applied">Applied</option>
                  <option value="in_review">Under Review</option>
                  <option value="awarded">Awarded</option>
                  <option value="not_selected">Not Selected</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  className={inputCls + ' resize-none'} rows={3}
                  placeholder="Any updates, deadlines, amounts..." />
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-white/10 flex gap-3 flex-shrink-0">
              <button onClick={() => setEditEntry(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all min-h-[44px]">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 min-h-[44px]">
                {editSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        select option { background-color: #111; color: white; }
      `}</style>
    </>
  );
};

export default MyFinanceApplications;
