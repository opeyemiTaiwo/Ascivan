// src/utils/foundationsContributions.js
// Community-contributed Foundations lessons: eligibility, submission, review, rating.
// Contributors submit ONLY their own original content, as a link (we host nothing).
// Eligibility: an Associate+ badge (2+ completed projects) in the relevant track.

import {
  collection, addDoc, getDocs, query, where, doc, updateDoc,
  serverTimestamp, setDoc, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Badge levels in ascending order (from ProjectCompletion).
const LEVEL_ORDER = ['Novice', 'Associate', 'Advanced', 'Expert'];
const meetsAssociate = (level) => LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf('Associate');

// Map a track id (techdev) to the badge category used on badges (TechDev / legacy techmo).
// Badges store `category` like 'TechDev'; tracks use ids like 'techdev'. Normalise.
const trackToCategory = (trackId) => {
  if (!trackId) return null;
  const t = trackId.toLowerCase();
  if (t === 'techmo' || t === 'techpo') return ['TechMO', 'TechPO', 'techmo'];
  // Match case-insensitively against common forms.
  const base = trackId.replace(/^tech/i, '');
  return [trackId, `Tech${base}`, `Tech${base.charAt(0).toUpperCase()}${base.slice(1)}`];
};

// Which tracks is this user eligible to contribute to? Returns array of track ids.
// `userData` is the user doc (has `badges` array with {category, level}).
export const eligibleTracks = (userData) => {
  if (!userData || !Array.isArray(userData.badges)) return [];
  const eligible = new Set();
  userData.badges.forEach(b => {
    if (b && b.level && meetsAssociate(b.level)) {
      // Store the category in a normalised lowercase track id.
      const cat = (b.category || b.id || '').toString();
      eligible.add(cat);
    }
  });
  return Array.from(eligible);
};

// Is the user eligible for a specific track?
export const isEligibleForTrack = (userData, trackId) => {
  if (!userData || !Array.isArray(userData.badges)) return false;
  const forms = (trackToCategory(trackId) || []).map(s => s.toLowerCase());
  return userData.badges.some(b =>
    b && b.level && meetsAssociate(b.level) &&
    forms.includes((b.category || b.id || '').toString().toLowerCase())
  );
};

// Submit a new contribution (status: pending).
export const submitContribution = async ({ trackId, title, url, description, authorId, authorName, authorBadgeLevel }) => {
  return addDoc(collection(db, 'foundationsContributions'), {
    trackId,
    title: title.trim(),
    url: url.trim(),
    description: description.trim(),
    authorId,
    authorName,
    authorBadgeLevel: authorBadgeLevel || null,
    status: 'pending', // pending | approved | changes_requested | rejected
    reviewNote: null,
    ratingSum: 0,
    ratingCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Resubmit (after changes requested) — sets back to pending.
export const resubmitContribution = async (id, { title, url, description }) => {
  return updateDoc(doc(db, 'foundationsContributions', id), {
    title: title.trim(), url: url.trim(), description: description.trim(),
    status: 'pending', updatedAt: serverTimestamp(),
  });
};

// Admin review actions.
export const reviewContribution = async (id, action, note = '') => {
  const status = action === 'approve' ? 'approved'
    : action === 'changes' ? 'changes_requested'
    : 'rejected';
  return updateDoc(doc(db, 'foundationsContributions', id), {
    status, reviewNote: note || null, updatedAt: serverTimestamp(),
  });
};

// Fetch approved contributions for a track (for the Foundations community section).
export const getApprovedForTrack = async (trackId) => {
  const snap = await getDocs(query(
    collection(db, 'foundationsContributions'),
    where('trackId', '==', trackId)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.status === 'approved')
    .sort((a, b) => {
      const ra = a.ratingCount ? a.ratingSum / a.ratingCount : 0;
      const rb = b.ratingCount ? b.ratingSum / b.ratingCount : 0;
      return rb - ra; // best-rated first
    });
};

// Fetch a member's own contributions (any status) — for their dashboard/profile.
export const getMyContributions = async (authorId) => {
  const snap = await getDocs(query(
    collection(db, 'foundationsContributions'),
    where('authorId', '==', authorId)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

// Fetch pending+changes items for admin review.
export const getReviewQueue = async () => {
  const snap = await getDocs(collection(db, 'foundationsContributions'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.status === 'pending')
    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
};

// Aggregate an author's teaching rating across all their approved contributions
// (computed on read, so no cross-user writes are needed). Returns {avg, count, lessons}.
export const getAuthorTeachingRating = async (authorId) => {
  const snap = await getDocs(query(
    collection(db, 'foundationsContributions'),
    where('authorId', '==', authorId)
  ));
  const approved = snap.docs.map(d => d.data()).filter(c => c.status === 'approved');
  let sum = 0, count = 0;
  approved.forEach(c => { sum += (c.ratingSum || 0); count += (c.ratingCount || 0); });
  return { avg: count ? sum / count : 0, count, lessons: approved.length };
};
// double-voting; aggregates kept on the parent for cheap display).
export const rateContribution = async (contributionId, userId, stars) => {
  const ratingRef = doc(db, 'foundationsContributions', contributionId, 'ratings', userId);
  const parentRef = doc(db, 'foundationsContributions', contributionId);
  const existing = await getDoc(ratingRef);
  const parentSnap = await getDoc(parentRef);
  if (!parentSnap.exists()) return;
  const p = parentSnap.data();
  let sum = p.ratingSum || 0, count = p.ratingCount || 0;
  if (existing.exists()) {
    sum = sum - (existing.data().stars || 0) + stars; // replace previous
  } else {
    sum += stars; count += 1;
  }
  await setDoc(ratingRef, { stars, userId, updatedAt: serverTimestamp() });
  await updateDoc(parentRef, { ratingSum: sum, ratingCount: count });
};
