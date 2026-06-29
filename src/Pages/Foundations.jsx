// src/Pages/Foundations.jsx
// The Foundations gate: a short, per-track checklist of free external courses that
// a newcomer completes before joining a project. Designed as a GATE, not a library —
// finite items, a visible finish line, and a hard CTA to a project at the end.
// Learners open a course in a new tab, then return and mark it complete.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { foundationsForTrack } from '../utils/foundationsContent';
import {
  isEligibleForTrack, submitContribution, getApprovedForTrack, rateContribution, levelForTrack,
} from '../utils/foundationsContributions';
import { toast } from 'react-toastify';

const Foundations = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contributeRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [content, setContent] = useState(null);
  const [completed, setCompleted] = useState({});
  const [opened, setOpened] = useState({});
  const [loading, setLoading] = useState(true);
  const [celebrated, setCelebrated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [community, setCommunity] = useState([]);
  const [showContribute, setShowContribute] = useState(false);
  const [cForm, setCForm] = useState({ title: '', url: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [myRatings, setMyRatings] = useState({}); // {contributionId: stars}

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    let active = true;
    (async () => {
      // Always set SOME content first so the page renders even if the user
      // fetch or community query fails (e.g. rules not yet published).
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        const data = snap.exists() ? snap.data() : {};
        if (!active) return;
        setUserData(data);
        const trackId = data.primarySkillTrack || 'notsure';
        setTrack(trackId);
        setContent(foundationsForTrack(trackId));
        const prog = (data.foundationsProgress && data.foundationsProgress[trackId]) || {};
        setCompleted(prog);
        try {
          const items = await getApprovedForTrack(trackId);
          if (active) setCommunity(items);
        } catch (_) { /* community optional; ignore */ }
      } catch (e) {
        console.error('Foundations load error:', e);
        // Fall back to the discovery checklist so the page is never blank.
        if (active) { setTrack('notsure'); setContent(foundationsForTrack('notsure')); }
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [currentUser]);

  // If arriving from the dashboard "Contribute" button (?contribute=1), open the
  // form and scroll to it once content + eligibility are known.
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('contribute') === '1' && isEligibleForTrack(userData, track)) {
      setShowContribute(true);
      setTimeout(() => {
        contributeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [loading, location.search, userData, track]);

  const requiredItems = content?.items.filter(it => !it.optional) || [];
  const doneCount = requiredItems.filter(it => completed[it.id]).length;
  const total = requiredItems.length;
  const allDone = total > 0 && doneCount === total;

  const markComplete = useCallback(async (itemId) => {
    const next = { ...completed, [itemId]: true };
    setCompleted(next);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        foundationsProgress: { [track]: next },
      }, { merge: true });
    } catch (e) { console.error('save progress failed', e); }
  }, [completed, track, currentUser]);

  useEffect(() => {
    if (!allDone || celebrated || !currentUser) return;
    setCelebrated(true);
    (async () => {
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: currentUser.uid,
          type: 'foundations_complete',
          message: 'You completed your Foundations. You\'re ready to join your first project.',
          isRead: false,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'users', currentUser.uid), { [`foundationsComplete.${track}`]: true });
      } catch (_) {}
    })();
  }, [allDone, celebrated, currentUser, track]);

  const eligible = isEligibleForTrack(userData, track);

  const handleContribute = async () => {
    if (!cForm.title.trim() || !cForm.url.trim() || !cForm.description.trim()) {
      toast.error('Add a title, a link to your content, and a short description.');
      return;
    }
    setSubmitting(true);
    try {
      // Find the author's badge level for this track (for display).
      // Author's current level in this track, derived live from their badge count.
      const authorLevel = levelForTrack(userData, track);
      await submitContribution({
        trackId: track,
        title: cForm.title,
        url: cForm.url,
        description: cForm.description,
        authorId: currentUser.uid,
        authorName: userData?.displayName || 'A member',
        authorBadgeLevel: authorLevel,
      });
      toast.success('Submitted for review. We\'ll notify you once it\'s approved.');
      setCForm({ title: '', url: '', description: '' });
      setShowContribute(false);
    } catch (e) {
      toast.error('Could not submit. Please try again.');
    }
    setSubmitting(false);
  };

  const handleRate = async (contributionId, stars) => {
    setMyRatings(p => ({ ...p, [contributionId]: stars }));
    try {
      await rateContribution(contributionId, currentUser.uid, stars);
      setCommunity(prev => prev.map(c => c.id === contributionId
        ? { ...c, ratingSum: (c.ratingSum || 0) + stars, ratingCount: (c.ratingCount || 0) + (myRatings[contributionId] ? 0 : 1) }
        : c));
      toast.success('Thanks for rating.');
    } catch (_) { toast.error('Could not save your rating.'); }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-10"><div className="h-6 w-48 bg-gray-100 rounded animate-pulse" /></div>;
  }
  if (!content) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Foundations</h1>
      <p className="text-blue-600 text-sm font-semibold mb-1">{content.label}</p>
      <p className="text-gray-500 text-sm mb-5">{content.intro}</p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">{doneCount} of {total} complete</span>
          {allDone && <span className="text-sm font-semibold text-green-600">Foundations complete</span>}
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: total ? `${(doneCount / total) * 100}%` : '0%' }} />
        </div>
      </div>

      {allDone && (
        <div className="bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200 rounded-xl p-6 text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">You're ready.</h2>
          <p className="text-gray-600 text-sm mb-4">You've completed your Foundations. Now put it to work on a real project and start earning your badge.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all">
            Find your first project
          </button>
        </div>
      )}

      <div className="space-y-3">
        {content.items.map((it, idx) => {
          const isDone = !!completed[it.id];
          const wasOpened = !!opened[it.id];
          return (
            <div key={it.id} className={`p-4 rounded-xl border transition-all ${isDone ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {isDone ? '✓' : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900">{it.title}</h3>
                    {it.optional && <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Optional</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{it.provider} · {it.duration}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <a href={it.url} target="_blank" rel="noopener noreferrer"
                      onClick={() => setOpened(p => ({ ...p, [it.id]: true }))}
                      className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all">
                      {isDone ? 'Revisit course' : 'Start course'}
                    </a>
                    {!isDone && (
                      <button onClick={() => markComplete(it.id)}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${wasOpened ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        Mark complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* From the community: lessons created by Associate+ badge-holders in this track. */}
      {(community.length > 0 || eligible) && (
        <div className="mt-8" ref={contributeRef}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-blue-600">From the community</h2>
            {eligible && (
              <button onClick={() => setShowContribute(s => !s)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                {showContribute ? 'Cancel' : '+ Contribute a lesson'}
              </button>
            )}
          </div>

          {eligible && showContribute && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-xs text-gray-500">Share <strong>your own original</strong> lesson (a video, article, or guide you created). Link to where it lives, we don't host files. It'll be reviewed before going live.</p>
              <input value={cForm.title} onChange={e => setCForm(p => ({ ...p, title: e.target.value }))} placeholder="Lesson title" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
              <input value={cForm.url} onChange={e => setCForm(p => ({ ...p, url: e.target.value }))} placeholder="Link to your content (YouTube, blog, doc...)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
              <textarea value={cForm.description} onChange={e => setCForm(p => ({ ...p, description: e.target.value }))} placeholder="What does it teach? (1-2 sentences)" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none" />
              <p className="text-xs text-gray-400">Lessons you publish remain part of Ascivan's community Foundations, credited to you, even if you later leave.</p>
              <div className="flex justify-end">
                <button onClick={handleContribute} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                  {submitting ? 'Submitting…' : 'Submit for review'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {community.map(c => {
              const avg = c.ratingCount ? (c.ratingSum / c.ratingCount) : 0;
              const mine = myRatings[c.id] || 0;
              return (
                <div key={c.id} className="p-4 rounded-xl border border-gray-200 bg-white">
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-900 hover:text-blue-600">{c.title}</a>
                  <p className="text-xs text-gray-500 mt-0.5">By {c.authorName}{c.authorBadgeLevel ? ` · ${c.authorBadgeLevel}` : ''}{c.authorLeft ? ' · former member' : ''}</p>
                  <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => handleRate(c.id, s)} className="text-base leading-none" title={`Rate ${s}`}>
                          <span className={(mine || Math.round(avg)) >= s ? 'text-orange-500' : 'text-gray-300'}>★</span>
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{avg ? avg.toFixed(1) : 'No ratings'}{c.ratingCount ? ` (${c.ratingCount})` : ''}</span>
                    {userData?.role === 'admin' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Remove this lesson from Foundations?')) return;
                          try {
                            const { doc: dref, deleteDoc } = await import('firebase/firestore');
                            await deleteDoc(dref(db, 'foundationsContributions', c.id));
                            setCommunity(prev => prev.filter(x => x.id !== c.id));
                            toast.success('Lesson removed.');
                          } catch (_) { toast.error('Could not remove.'); }
                        }}
                        className="text-xs text-red-500 hover:text-red-700 ml-auto"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6 text-center">
        Courses are hosted by their providers and are free or free to audit. Open a course, work through it, then mark it complete to keep your progress.
      </p>
    </div>
  );
};

export default Foundations;
