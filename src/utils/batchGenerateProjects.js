// src/utils/batchGenerateProjects.js
// Admin tool: publish a batch of varied starter projects from the template library
// in one click, so the board always has fresh, beginner-accessible supply.

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PROJECT_TEMPLATES } from './projectTemplates';
import { logActivity as logProof } from './activityFeed';

// Shuffle a copy of an array (Fisher-Yates).
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Pick `count` templates spread across as many different tracks as possible,
// so a batch feels diverse rather than 30 near-identical projects.
const pickVaried = (count) => {
  const byTrack = {};
  PROJECT_TEMPLATES.forEach(t => {
    const k = t.industryTrack || 'other';
    (byTrack[k] = byTrack[k] || []).push(t);
  });
  // Shuffle within each track, then round-robin across tracks.
  const tracks = shuffle(Object.keys(byTrack));
  const queues = tracks.map(k => shuffle(byTrack[k]));
  const picked = [];
  let exhausted = false;
  while (picked.length < count && !exhausted) {
    exhausted = true;
    for (const q of queues) {
      if (q.length) {
        picked.push(q.shift());
        exhausted = false;
        if (picked.length >= count) break;
      }
    }
  }
  return picked;
};

/**
 * Publish a batch of starter projects.
 * @param {number} count how many to create (default 24)
 * @returns {Promise<{created:number, errors:number}>}
 */
export const batchGenerateProjects = async (count = 24) => {
  const templates = pickVaried(count);
  let created = 0, errors = 0;

  for (const t of templates) {
    try {
      const newRef = await addDoc(collection(db, 'projects'), {
        projectTitle: t.projectTitle,
        projectDescription: t.projectDescription,
        projectGoals: t.projectGoals || null,
        industryTrack: t.industryTrack,
        timeline: 'flexible',
        proposedRoles: t.proposedRoles,
        teamRoles: [],
        maxTeamSize: 0,
        status: 'lead_recruitment',
        isActive: true,
        isGenerated: true,
        leadConfirmed: false,
        submitterId: null,
        submitterEmail: null,
        submitterName: 'Ascivan (Auto-generated)',
        isCompanyPost: false,
        viewCount: 0,
        applicationCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Proof Wall: "needs a lead" event so the batch shows there too.
      try {
        await logProof({
          type: 'lead',
          actorName: 'Ascivan',
          projectId: newRef.id,
          projectTitle: t.projectTitle,
          meta: 'Open to anyone, apply to lead',
        });
      } catch (_) { /* non-blocking */ }
      created++;
    } catch (e) {
      console.error('Batch generate failed for', t.projectTitle, e.message);
      errors++;
    }
  }

  return { created, errors };
};
