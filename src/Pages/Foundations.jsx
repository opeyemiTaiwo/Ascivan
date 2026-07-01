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
import {
  isEligibleForTrack, submitContribution, getApprovedForTrack, rateContribution, levelForTrack, eligibleTrackList, badgeTrackIds,
} from '../utils/foundationsContributions';
import { foundationsForTrack, FOUNDATIONS } from '../utils/foundationsContent';
import { lessonsForTrack } from '../utils/foundationsLessons';
import { getVideoEmbed } from '../utils/videoEmbed';
import { toast } from 'react-toastify';

const Foundations = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contributeRef = useRef(null);
  const lessonTopRef = useRef(null);
  const skipFirstScrollRef = useRef(true);
  const [track, setTrack] = useState(null);
  const [allTracks, setAllTracks] = useState([]); // every track to show as a tab
  const [content, setContent] = useState(null);
  const [completed, setCompleted] = useState({});
  const [opened, setOpened] = useState({});
  const [expanded, setExpanded] = useState({});
  const [activeIdx, setActiveIdx] = useState(0); // current topic in the lesson player
  const [subIdx, setSubIdx] = useState(0); // current subtopic (page) within the active topic
  const [showContents, setShowContents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [celebrated, setCelebrated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [community, setCommunity] = useState([]);
  const [showContribute, setShowContribute] = useState(false);
  const [workspaceContributor, setWorkspaceContributor] = useState(false);
  const [cForm, setCForm] = useState({ title: '', url: '', description: '' });
  const [cTrack, setCTrack] = useState(''); // which eligible track the lesson is for
  const [submitting, setSubmitting] = useState(false);
  const [myRatings, setMyRatings] = useState({}); // {contributionId: stars}

  // Whenever the learner moves to a different topic (via next/prev lesson or the
  // contents list), jump back to its first subtopic page.
  useEffect(() => { setSubIdx(0); }, [activeIdx]);

  // Bring the lesson content to a consistent spot (just below the sticky header)
  // whenever the page or topic changes, so paging never jumps the window up/down
  // by an amount that depends on how long the previous page was.
  useEffect(() => {
    if (skipFirstScrollRef.current) { skipFirstScrollRef.current = false; return; }
    lessonTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeIdx, subIdx]);

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
        // Build the full set of tracks to show: every track they hold a badge in,
        // PLUS their profile track. This reflects who they've actually become, not
        // just their initial pick. Dedupe, keep only ones we have content for.
        const fromBadges = badgeTrackIds(data); // e.g. ['TechLeads']
        const profileTrack = data.primarySkillTrack;
        const ordered = [];
        fromBadges.forEach(t => { if (t && !ordered.includes(t)) ordered.push(t); });
        if (profileTrack && !ordered.includes(profileTrack)) ordered.push(profileTrack);
        // Only keep tracks that have a Foundations checklist; fall back to notsure.
        let valid = ordered.filter(t => FOUNDATIONS[t]);
        // Admins see EVERY track's courses (for review/management), not just their own.
        if (data.role === 'admin') {
          valid = Object.keys(FOUNDATIONS).filter(t => t !== 'notsure' && t !== 'universal' && t !== 'company');
        }
        // Companies don't take skill tracks - they get a short course on how the
        // badge and rating system works, so they can read member profiles.
        if (data.isCompany) {
          valid = ['company'];
        }
        const tabs = valid.length ? valid : ['notsure'];
        if (active) setAllTracks(tabs);

        const trackId = tabs[0];
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
  // form and scroll to it. When coming from a workspace (?fromWorkspace=1), project
  // collaborators can contribute even without an Associate badge.
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    const fromWs = params.get('fromWorkspace') === '1';
    if (fromWs) setWorkspaceContributor(true);
    if (params.get('contribute') === '1' && (fromWs || eligibleTrackList(userData).length > 0)) {
      setShowContribute(true);
      setTimeout(() => {
        contributeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [loading, location.search, userData, track]);

  const lessons = lessonsForTrack(track);
  const requiredItems = (lessons?.topics || []).filter(t => !t.optional);
  const doneCount = requiredItems.filter(t => completed[t.id]).length;
  const total = requiredItems.length;
  const allDone = total > 0 && doneCount === total;

  const markComplete = useCallback(async (itemId) => {
    const next = { ...completed, [itemId]: true };
    setCompleted(next);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        [`foundationsProgress.${track}`]: next,
      }, { merge: true });
    } catch (e) { console.error('save progress failed', e); }
    // Auto-advance to the next lesson for a smooth flow.
    setActiveIdx(i => {
      const topics = (lessonsForTrack(track)?.topics || []);
      const ni = Math.min(topics.length - 1, i + 1);
      return ni;
    });
  }, [completed, track, currentUser]);

  useEffect(() => {
    if (!allDone || celebrated || !currentUser) return;
    setCelebrated(true);
    (async () => {
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: currentUser.uid,
          type: 'foundations_complete',
          message: track === 'company'
            ? 'You finished the Badges & Ratings guide. You can now read member profiles with confidence.'
            : 'You completed your Foundations. You\'re ready to join your first project.',
          isRead: false,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'users', currentUser.uid), { [`foundationsComplete.${track}`]: true });
      } catch (_) {}
    })();
  }, [allDone, celebrated, currentUser, track]);

  // The tracks this member can contribute to. Normally any track they hold an
  // Associate+ badge in. Workspace collaborators can contribute to any track,
  // even without a badge (they teach what they did on their project).
  const badgeEligibleTracks = eligibleTrackList(userData);
  const ALL_TRACK_OPTIONS = [
    { id: 'TechDev', label: 'TechDev (Development)' },
    { id: 'TechArchs', label: 'TechArchs (Low/No-Code)' },
    { id: 'TechQA', label: 'TechQA (Quality Assurance)' },
    { id: 'TechGuard', label: 'TechGuard (Security)' },
    { id: 'TechPO', label: 'TechPO (Product/Project Owner)' },
    { id: 'TechLeads', label: 'TechLeads (Non-Technical)' },
  ];
  const myEligibleTracks = workspaceContributor ? ALL_TRACK_OPTIONS : badgeEligibleTracks;
  const eligible = myEligibleTracks.length > 0;

  const switchTrack = async (trackId) => {
    if (trackId === track) return;
    setTrack(trackId);
    setContent(foundationsForTrack(trackId));
    setShowContribute(false);
    setExpanded({});
    setActiveIdx(0);
    setCelebrated(false);
    const prog = (userData?.foundationsProgress && userData.foundationsProgress[trackId]) || {};
    setCompleted(prog);
    setCommunity([]);
    try {
      const items = await getApprovedForTrack(trackId);
      setCommunity(items);
    } catch (_) {}
  };

  const handleContribute = async () => {
    const chosenTrack = cTrack || (myEligibleTracks[0] && myEligibleTracks[0].id);
    if (!cForm.title.trim() || !cForm.url.trim() || !cForm.description.trim()) {
      toast.error('Add a title, a link to your content, and a short description.');
      return;
    }
    if (!chosenTrack) { toast.error('Select which track this lesson is for.'); return; }
    setSubmitting(true);
    try {
      const authorLevel = levelForTrack(userData, chosenTrack);
      await submitContribution({
        trackId: chosenTrack,
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
  if (!lessons) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Foundations</h1>

      {/* Track tabs: all the tracks this member has badges in, plus their profile track. */}
      {allTracks.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {allTracks.map(t => (
            <button
              key={t}
              onClick={() => switchTrack(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                t === track ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {FOUNDATIONS[t]?.label || t}
            </button>
          ))}
        </div>
      )}

      <p className="text-blue-600 text-sm font-semibold mb-1">{lessons.label}</p>
      <p className="text-gray-500 text-sm mb-5">{lessons.intro}</p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">{doneCount} of {total} complete</span>
          {allDone && <span className="text-sm font-semibold text-green-600">Foundations complete</span>}
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: total ? `${(doneCount / total) * 100}%` : '0%' }} />
        </div>
      </div>

      {allDone && track !== 'company' && (
        <div className="bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200 rounded-xl p-6 text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">You're ready.</h2>
          <p className="text-gray-600 text-sm mb-4">You've completed your Foundations. Now put it to work on a real project and start earning your badge.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all">
            Find your first project
          </button>
        </div>
      )}

      {/* Contents: jump to any topic. Compact, collapsible on mobile. */}
      <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">
        <button onClick={() => setShowContents(s => !s)} className="w-full flex items-center justify-between px-4 py-3 text-left">
          <span className="text-sm font-bold text-gray-900">Contents · {lessons.topics.length} lessons</span>
          <span className={`text-gray-400 transition-transform ${showContents ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {showContents && (
          <div className="border-t border-gray-100 max-h-72 overflow-y-auto">
            {lessons.topics.map((t, i) => {
              const done = !!completed[t.id];
              return (
                <button key={t.id} onClick={() => { setActiveIdx(i); setShowContents(false); }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 border-b border-gray-50 last:border-0 ${i === activeIdx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${done ? 'bg-green-500 text-white' : i === activeIdx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className={`text-sm ${i === activeIdx ? 'font-bold text-blue-700' : 'text-gray-700'}`}>{t.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* The active lesson (one topic at a time). */}
      {(() => {
        const topic = lessons.topics[activeIdx];
        if (!topic) return null;
        const isDone = !!completed[topic.id];
        const isLast = activeIdx === lessons.topics.length - 1;
        const isFirst = activeIdx === 0;
        const subs = topic.subtopics;
        const safeSub = Math.min(subIdx, subs.length - 1); // guard against stale index
        const sub = subs[safeSub];
        const atFirstSub = safeSub === 0;
        const atLastSub = safeSub === subs.length - 1;
        const prevDisabled = atFirstSub && isFirst;
        const goNext = () => {
          if (!atLastSub) setSubIdx(s => s + 1);
          else if (!isLast) setActiveIdx(i => Math.min(lessons.topics.length - 1, i + 1));
        };
        const goPrev = () => {
          if (!atFirstSub) setSubIdx(s => Math.max(0, s - 1));
          else if (!isFirst) setActiveIdx(i => Math.max(0, i - 1));
        };
        return (
          <div className={`rounded-2xl border ${isDone ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-white'} p-6 sm:p-8 shadow-sm`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Lesson {activeIdx + 1} of {lessons.topics.length}</span>
              {topic.optional && <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Optional</span>}
              {isDone && <span className="text-xs font-semibold text-green-600 ml-auto flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Completed</span>}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight tracking-tight">{topic.title}</h2>
            <p className="text-base text-gray-500 mb-6 leading-relaxed border-l-4 border-blue-100 pl-4">{topic.summary}</p>

            {/* One subtopic per page. Step indicator shows progress within the lesson. */}
            <div ref={lessonTopRef} className="flex items-center gap-2 mb-4 scroll-mt-24">
              <span className="text-xs font-semibold text-gray-400">Step {safeSub + 1} of {subs.length}</span>
              <div className="flex-1 flex gap-1">
                {subs.map((_, di) => (
                  <button key={di} onClick={() => setSubIdx(di)}
                    aria-label={`Go to step ${di + 1}`}
                    className={`h-1.5 flex-1 rounded-full transition-all ${di === safeSub ? 'bg-blue-600' : di < safeSub ? 'bg-blue-200' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>

            <div key={safeSub} className="min-h-[140px]">
              <h4 className="text-base font-bold text-gray-900 mb-1.5">{sub.heading}</h4>
              {sub.body && <p className="text-[15px] text-gray-700 leading-7 whitespace-pre-line">{sub.body}</p>}
              {sub.code && (
                <pre className="mt-3 bg-gray-900 text-gray-100 rounded-xl p-4 text-[13px] overflow-x-auto leading-relaxed shadow-sm"><code>{sub.code}</code></pre>
              )}
              {sub.diagram && (
                <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3" dangerouslySetInnerHTML={{ __html: sub.diagram }} />
              )}
              {sub.tip && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 leading-relaxed flex gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                  <span><strong className="font-semibold">Tip:</strong> {sub.tip}</span>
                </div>
              )}
              {sub.exercise && (
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-900 leading-relaxed flex gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span><strong className="font-semibold">Try this:</strong> {sub.exercise}</span>
                </div>
              )}
            </div>

            {/* Mark complete appears once the learner reaches the final step of the lesson. */}
            {!isDone && atLastSub && (
              <button onClick={() => markComplete(topic.id)} className="mt-7 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Mark complete
              </button>
            )}

            {/* Pager: steps within a lesson, rolling over to the next/previous lesson at the edges. */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
              <button onClick={goPrev} disabled={prevDisabled}
                className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${prevDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}>
                ← Previous
              </button>
              {!atLastSub ? (
                <button onClick={goNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm">
                  Next →
                </button>
              ) : !isLast ? (
                <button onClick={goNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm">
                  Next lesson →
                </button>
              ) : (
                <span className="text-xs text-gray-400 font-medium">Last step</span>
              )}
            </div>
          </div>
        );
      })()}

      {/* From the community: lessons created by Associate+ badge-holders in this track. */}
      {(community.length > 0 || eligible) && (
        <div className="mt-8" ref={contributeRef}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-blue-600">From the community</h2>
            {eligible && (
              <button onClick={() => setShowContribute(s => !s)} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg">
                {showContribute ? 'Cancel' : '+ Contribute a lesson'}
              </button>
            )}
          </div>

          {eligible && !showContribute && (
            <p className="text-sm text-gray-500 mb-3">{workspaceContributor
              ? 'As a project collaborator you can contribute a lesson to any track to help newcomers and get rated. No badge needed.'
              : `You're an ${myEligibleTracks.map(t => `${t.level} in ${t.id}`).join(', ')}. You can contribute a lesson to ${myEligibleTracks.length > 1 ? 'those tracks' : `the ${myEligibleTracks[0].id} track`} to help newcomers and boost your ranking.`}</p>
          )}

          {eligible && showContribute && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-xs text-gray-500">Teach. Help others. Get rated.</p>
              {myEligibleTracks.length > 1 ? (
                <select value={cTrack || myEligibleTracks[0].id} onChange={e => setCTrack(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
                  {myEligibleTracks.map(t => <option key={t.id} value={t.id}>{t.id} - {t.label}{t.level ? ` (${t.level})` : ''}</option>)}
                </select>
              ) : (
                <p className="text-xs text-blue-600 font-medium">Contributing to: {myEligibleTracks[0]?.id} - {myEligibleTracks[0]?.label}{myEligibleTracks[0]?.level ? ` (${myEligibleTracks[0].level})` : ''}</p>
              )}
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
                  <h4 className="text-sm font-bold text-gray-900">{c.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">By {c.authorName}{c.authorBadgeLevel ? ` · ${c.authorBadgeLevel}` : ''}{c.authorLeft ? ' · former member' : ''}</p>
                  <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  {(() => {
                    const vid = getVideoEmbed(c.url);
                    if (vid) {
                      return (
                        <div className="mt-3">
                          <div className="relative w-full rounded-lg overflow-hidden border border-gray-200" style={{ paddingTop: '56.25%' }}>
                            <iframe
                              src={vid.embedUrl}
                              title={c.title}
                              className="absolute top-0 left-0 w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Video by {c.authorName} · plays via {vid.provider}</p>
                        </div>
                      );
                    }
                    return (
                      <div className="mt-3">
                        <a href={c.url} target="_blank" rel="noopener noreferrer"
                          className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all">
                          Open lesson
                        </a>
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-3 mt-3">
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
