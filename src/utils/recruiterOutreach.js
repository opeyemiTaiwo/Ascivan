// src/utils/recruiterOutreach.js
// Caps how many NEW people a free recruiter (company account) can contact per month.
// Talent (individuals) are NEVER capped and never hidden. Premium recruiters are unlimited.
//
// "Outreach" = starting a NEW conversation with someone not previously contacted.
// Replies inside an existing conversation do NOT count.
//
// NOTE (security): this is client-side enforcement so the UI can block and inform.
// For tamper-proof enforcement, back it with a Firestore security rule on the
// `outreach` documents. Client-side is a reasonable launch starting point.

import { doc, getDoc, setDoc, increment, serverTimestamp, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const FREE_RECRUITER_OUTREACH_LIMIT = 5; // new contacts per month on the free tier
export const FREE_JOB_POST_LIMIT = 2; // job posts per month on the free tier

// Current period key like "2026-06" (per calendar month).
const periodKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const isPremiumRecruiter = (userData) =>
  userData?.membershipPlan === 'Premium' || userData?.role === 'admin';

// A recruiter is anyone who is a company account OR has posted a job (either/both).
const isRecruiterByFlags = (userData) =>
  userData?.isCompany === true || userData?.hasPostedJob === true;

// Fallback for users who posted a job BEFORE the hasPostedJob flag existed:
// check the hub_posts collection once for any job by this user.
const hasPostedJobFallback = async (uid) => {
  try {
    const q = query(
      collection(db, 'hub_posts'),
      where('posterId', '==', uid),
      where('category', '==', 'job'),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    console.error('hasPostedJob fallback failed:', e);
    return false;
  }
};

// Returns { limited, remaining, isRecruiter, premium }.
// `limited` is true only when a free recruiter has hit the cap this month.
export const getOutreachStatus = async (currentUserData, currentUid) => {
  let recruiter = isRecruiterByFlags(currentUserData);
  // Fallback for legacy job-posters without the flag set yet
  if (!recruiter) {
    recruiter = await hasPostedJobFallback(currentUid);
  }
  if (!recruiter) {
    return { limited: false, remaining: Infinity, isRecruiter: false, premium: false };
  }
  if (isPremiumRecruiter(currentUserData)) {
    return { limited: false, remaining: Infinity, isRecruiter: true, premium: true };
  }
  // Free recruiter - read this month's counter.
  let used = 0;
  try {
    const ref = doc(db, 'outreach', `${currentUid}_${periodKey()}`);
    const snap = await getDoc(ref);
    used = snap.exists() ? (snap.data().count || 0) : 0;
  } catch (e) {
    console.error('Outreach status read failed:', e);
  }
  const remaining = Math.max(0, FREE_RECRUITER_OUTREACH_LIMIT - used);
  return { limited: remaining <= 0, remaining, isRecruiter: true, premium: false };
};

// Call AFTER a new conversation is created, to record one outreach.
// No-op for non-recruiters and Premium recruiters.
export const recordOutreach = async (currentUserData, currentUid) => {
  let recruiter = isRecruiterByFlags(currentUserData);
  if (!recruiter) recruiter = await hasPostedJobFallback(currentUid);
  if (!recruiter || isPremiumRecruiter(currentUserData)) return;
  try {
    const ref = doc(db, 'outreach', `${currentUid}_${periodKey()}`);
    await setDoc(
      ref,
      { recruiterId: currentUid, period: periodKey(), count: increment(1), updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error('Outreach record failed:', e);
  }
};

// --- Job posting limit (free: 2/month, Premium: unlimited) ---

// Returns { limited, remaining, premium }. Premium accounts are never limited.
export const getJobPostStatus = async (currentUserData, currentUid) => {
  if (isPremiumRecruiter(currentUserData)) {
    return { limited: false, remaining: Infinity, premium: true };
  }
  let used = 0;
  try {
    const ref = doc(db, 'jobposts_quota', `${currentUid}_${periodKey()}`);
    const snap = await getDoc(ref);
    used = snap.exists() ? (snap.data().count || 0) : 0;
  } catch (e) {
    console.error('Job-post status read failed:', e);
  }
  const remaining = Math.max(0, FREE_JOB_POST_LIMIT - used);
  return { limited: remaining <= 0, remaining, premium: false };
};

// Call AFTER a job is successfully posted, to record it. No-op for Premium.
export const recordJobPost = async (currentUserData, currentUid) => {
  if (isPremiumRecruiter(currentUserData)) return;
  try {
    const ref = doc(db, 'jobposts_quota', `${currentUid}_${periodKey()}`);
    await setDoc(
      ref,
      { userId: currentUid, period: periodKey(), count: increment(1), updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error('Job-post record failed:', e);
  }
};
