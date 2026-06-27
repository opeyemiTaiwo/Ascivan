// src/utils/projectReview.js
// Admin review pipeline for project completion.
//
// A project must be reviewed and APPROVED by an admin before the owner can
// assign badges / mark it complete. Flow:
//
//   none  ->  submitted  ->  needs_changes  ->  submitted  ->  ...  ->  approved
//                       \->  rejected (terminal: no badges, no resubmit)
//                        \-> approved  (owner may now assign badges)
//
// The review subject is the project's submission link (from the Resources tab)
// PLUS the workspace link, which we auto-include on submit.

import { db } from '../firebase/config';
import {
  doc, updateDoc, addDoc, collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';

export const REVIEW_STATUS = {
  NONE: 'none',
  SUBMITTED: 'submitted',
  NEEDS_CHANGES: 'needs_changes',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Build the canonical workspace URL for a project (auto-included in submissions).
export const buildWorkspaceUrl = (projectId) =>
  `${typeof window !== 'undefined' ? window.location.origin : 'https://loomiqe.com'}/projects/${projectId}/workspace`;

// Notify a single user (by email) via the notifications collection.
const notifyByEmail = async (email, payload) => {
  if (!email) return;
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
    if (!snap.empty) {
      await addDoc(collection(db, 'notifications'), {
        userId: snap.docs[0].id,
        isRead: false,
        createdAt: serverTimestamp(),
        ...payload,
      });
    }
  } catch (e) { console.error('notifyByEmail failed:', e); }
};

// Notify a list of member emails.
const notifyMembers = async (memberEmails, payload) => {
  for (const email of memberEmails) {
    // eslint-disable-next-line no-await-in-loop
    await notifyByEmail(email, payload);
  }
};

// --- OWNER: submit (or re-submit) the project for admin review ---
// `submissionUrl` is the link from the Resources tab; workspace link is auto-included.
export const submitProjectForReview = async (project, owner, submissionUrl) => {
  const projectId = project.id;
  if (!submissionUrl || !submissionUrl.trim()) {
    throw new Error('A submission link is required before submitting for review. Add it on the Resources tab.');
  }
  const workspaceUrl = buildWorkspaceUrl(projectId);

  await updateDoc(doc(db, 'projects', projectId), {
    reviewStatus: REVIEW_STATUS.SUBMITTED,
    reviewSubmittedAt: serverTimestamp(),
    reviewSubmittedBy: owner?.email || null,
    reviewSubmissionUrl: submissionUrl.trim(),
    reviewWorkspaceUrl: workspaceUrl,
    reviewFeedback: null, // clear any prior "needs changes" note on resubmit
  });

  // Notify admins (via a queue collection the AdminPanel reads).
  try {
    await addDoc(collection(db, 'admin_notifications'), {
      type: 'project_review_submitted',
      projectId,
      projectTitle: project.projectTitle || project.title || 'Untitled project',
      submittedBy: owner?.email || null,
      submissionUrl: submissionUrl.trim(),
      workspaceUrl,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) { console.error('admin notify failed:', e); }

  return { workspaceUrl };
};

// --- ADMIN: send back for changes (unlimited back-and-forth) ---
export const requestChanges = async (project, admin, feedback, memberEmails = []) => {
  const projectId = project.id;
  await updateDoc(doc(db, 'projects', projectId), {
    reviewStatus: REVIEW_STATUS.NEEDS_CHANGES,
    reviewFeedback: feedback || 'Changes requested. Please review and re-submit.',
    reviewedAt: serverTimestamp(),
    reviewedBy: admin?.email || null,
  });

  const title = project.projectTitle || project.title || 'your project';
  // Owner
  await notifyByEmail(project.reviewSubmittedBy || project.submitterEmail, {
    type: 'project_needs_changes',
    projectId,
    projectTitle: title,
    message: `"${title}" needs changes before approval. Reviewer note: ${feedback || 'See details and re-submit.'}`,
  });
  // Team
  await notifyMembers(memberEmails, {
    type: 'project_needs_changes',
    projectId,
    projectTitle: title,
    message: `"${title}" needs changes before approval. Your project lead will update and re-submit.`,
  });
};

// --- ADMIN: approve (owner may now assign badges) ---
export const approveProjectReview = async (project, admin, memberEmails = []) => {
  const projectId = project.id;
  await updateDoc(doc(db, 'projects', projectId), {
    reviewStatus: REVIEW_STATUS.APPROVED,
    reviewApprovedAt: serverTimestamp(),
    reviewApprovedBy: admin?.email || null,
    reviewFeedback: null,
  });

  const title = project.projectTitle || project.title || 'your project';
  // Owner — can now assign badges
  await notifyByEmail(project.reviewSubmittedBy || project.submitterEmail, {
    type: 'project_review_approved',
    projectId,
    projectTitle: title,
    message: `"${title}" has been approved! You can now assign badges to your team.`,
  });
  // Team
  await notifyMembers(memberEmails, {
    type: 'project_review_approved',
    projectId,
    projectTitle: title,
    message: `"${title}" has been approved by Loomiqe! Your project lead will now assign badges.`,
  });
};

// --- ADMIN: reject (terminal: no badges, no resubmit) ---
export const rejectProjectReview = async (project, admin, feedback, memberEmails = []) => {
  const projectId = project.id;
  await updateDoc(doc(db, 'projects', projectId), {
    reviewStatus: REVIEW_STATUS.REJECTED,
    reviewRejectedAt: serverTimestamp(),
    reviewRejectedBy: admin?.email || null,
    reviewFeedback: feedback || 'This project did not meet the requirements for approval.',
  });

  const title = project.projectTitle || project.title || 'your project';
  await notifyByEmail(project.reviewSubmittedBy || project.submitterEmail, {
    type: 'project_review_rejected',
    projectId,
    projectTitle: title,
    message: `"${title}" was not approved. ${feedback || ''} No badges can be assigned and the project cannot be re-submitted.`,
  });
  await notifyMembers(memberEmails, {
    type: 'project_review_rejected',
    projectId,
    projectTitle: title,
    message: `"${title}" was not approved by Loomiqe. No badges will be assigned for this project.`,
  });
};

// Helper: fetch approved member emails for a project (for team notifications).
export const getProjectMemberEmails = async (projectId) => {
  try {
    const snap = await getDocs(query(
      collection(db, 'project_applications'),
      where('projectId', '==', projectId),
      where('status', '==', 'approved'),
    ));
    return snap.docs.map(d => d.data().applicantEmail).filter(Boolean);
  } catch (e) {
    console.error('getProjectMemberEmails failed:', e);
    return [];
  }
};
