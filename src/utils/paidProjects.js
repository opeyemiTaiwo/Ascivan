// src/utils/paidProjects.js
// Shared helpers for Paid Projects (Phase A).
//
// A paid project is posted by a Premium (subscriber) account. Each team role
// carries a payAmount (per person, set by the poster). Everyone's pay is
// visible by design. Paid projects NEVER award badges - members are
// compensated with money instead. Completion of a paid project moves it to
// 'awaiting_payment_confirmation' (owner marks paid, members confirm received
// - the confirmation/dispute UI ships in Phase B, but the data model is live
// now so earnings tracking works end to end).
//
// Earnings (member's Account page + dashboard):
//   PENDING = approved application on a paid project that is not yet
//             payment-confirmed for this member.
//   EARNED  = the member's paymentConfirmations entry is 'confirmed'.
//             The amount counted is amountPaid (set at confirmation or
//             adjusted during a dispute) falling back to the application's
//             payAmount. Dispute-page adjustments therefore flow into the
//             member's totals automatically.

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Format a money amount. USD platform-wide for now.
export const formatMoney = (amount, currency = 'USD') => {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);
  } catch {
    return `$${n.toLocaleString()}`;
  }
};

// Per-person pay range across a paid project's roles -> "$300" or "$200 - $500".
export const getPayRangeLabel = (teamRoles) => {
  const amounts = (teamRoles || []).map(r => Number(r.payAmount) || 0).filter(a => a > 0);
  if (amounts.length === 0) return null;
  const min = Math.min(...amounts), max = Math.max(...amounts);
  return min === max ? `${formatMoney(min)} / person` : `${formatMoney(min)} - ${formatMoney(max)} / person`;
};

// Total budget = sum of payAmount * count across roles.
export const computeTotalBudget = (teamRoles) =>
  (teamRoles || []).reduce((sum, r) => sum + (Number(r.payAmount) || 0) * (parseInt(r.count, 10) || 1), 0);

// Resolve this member's payment status on a paid project.
// Returns 'confirmed' | 'disputed' | 'pending' and the effective amount.
export const getMemberPaymentStatus = (project, email, applicationPayAmount) => {
  const entry = (project?.paymentConfirmations || {})[email] || null;
  const status = entry?.status || 'pending';
  const amount = Number(entry?.amountPaid ?? applicationPayAmount) || 0;
  return { status, amount };
};

// Compute a member's earnings across all paid projects they were APPROVED for.
// Source of truth for the amount is the application form (payAmount stored at
// apply time), overridden by amountPaid once payment is confirmed/adjusted.
// Returns { earnedTotal, pendingTotal, rows: [{projectId, projectTitle, role, amount, state}] }
export const computeMemberEarnings = async (uid, email) => {
  const result = { earnedTotal: 0, pendingTotal: 0, rows: [] };
  if (!uid) return result;
  try {
    const appQ = query(collection(db, 'project_applications'), where('applicantUid', '==', uid), where('status', '==', 'approved'));
    const appSnap = await getDocs(appQ);
    const paidApps = appSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(a => a.isPaid && (Number(a.payAmount) || 0) > 0);

    // Fetch each project once (dedupe project ids).
    const byProject = new Map();
    for (const a of paidApps) {
      if (!byProject.has(a.projectId)) byProject.set(a.projectId, []);
      byProject.get(a.projectId).push(a);
    }
    for (const [projectId, apps] of byProject.entries()) {
      let project = null;
      try {
        const snap = await getDoc(doc(db, 'projects', projectId));
        if (snap.exists()) project = { id: snap.id, ...snap.data() };
      } catch (_) {}
      for (const a of apps) {
        const { status, amount } = getMemberPaymentStatus(project, email || a.applicantEmail, a.payAmount);
        const projectClosed = project?.status === 'completed';
        let state;
        if (status === 'confirmed') { state = 'paid'; result.earnedTotal += amount; }
        else if (status === 'disputed') { state = 'disputed'; result.pendingTotal += amount; }
        else if (status === 'left' || status === 'forfeited') { state = 'forfeited'; }
        else { state = projectClosed ? 'awaiting' : 'pending'; result.pendingTotal += amount; }
        result.rows.push({
          projectId,
          projectTitle: a.projectTitle || project?.projectTitle || 'Untitled',
          role: a.role || '',
          amount,
          state, // pending | awaiting | paid | disputed | forfeited
        });
      }
    }
  } catch (e) {
    console.log('Earnings computation skipped:', e.message);
  }
  return result;
};
