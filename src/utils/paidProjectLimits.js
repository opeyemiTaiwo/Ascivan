// src/utils/paidProjectLimits.js — Check paid project limits for basic members
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const BASIC_PAID_LIMIT = 3; // per year

export const checkPaidProjectLimit = async (currentUser) => {
  if (!currentUser) return { allowed: false, reason: 'Not logged in' };

  try {
    // Check membership plan
    const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userSnap.exists()) return { allowed: false, reason: 'User not found' };
    
    const userData = userSnap.data();
    const plan = userData.membershipPlan || 'Free';
    const role = userData.role || 'member';

    // Admin and Premium members have unlimited access
    if (role === 'admin' || plan === 'Premium') {
      return { allowed: true, plan, remaining: Infinity, used: 0, limit: Infinity };
    }

    // For basic members, count completed paid projects this year
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    // Count completed paid projects where user is a member
    let completedPaidCount = 0;
    
    try {
      const completedQ = query(
        collection(db, 'projects'),
        where('members', 'array-contains', currentUser.uid),
        where('status', '==', 'completed'),
        where('pricingType', '==', 'paid')
      );
      const completedSnap = await getDocs(completedQ);
      completedSnap.docs.forEach(d => {
        const completedAt = d.data().completedAt?.toDate?.();
        if (completedAt && completedAt >= yearStart) completedPaidCount++;
      });
    } catch (e) {
      // If compound query fails (no index), try simpler approach
      try {
        const allCompletedQ = query(
          collection(db, 'projects'),
          where('members', 'array-contains', currentUser.uid),
          where('status', '==', 'completed')
        );
        const allSnap = await getDocs(allCompletedQ);
        allSnap.docs.forEach(d => {
          const data = d.data();
          if (data.pricingType === 'paid') {
            const completedAt = data.completedAt?.toDate?.();
            if (completedAt && completedAt >= yearStart) completedPaidCount++;
          }
        });
      } catch (e2) {
        console.log('Paid project count query skipped:', e2.message);
      }
    }

    // Also count completed paid projects where user is the owner
    try {
      const ownerQ = query(
        collection(db, 'projects'),
        where('submitterId', '==', currentUser.uid),
        where('status', '==', 'completed')
      );
      const ownerSnap = await getDocs(ownerQ);
      ownerSnap.docs.forEach(d => {
        const data = d.data();
        if (data.pricingType === 'paid') {
          const completedAt = data.completedAt?.toDate?.();
          if (completedAt && completedAt >= yearStart) completedPaidCount++;
        }
      });
    } catch (e) {
      console.log('Owner paid project count skipped:', e.message);
    }

    const remaining = Math.max(0, BASIC_PAID_LIMIT - completedPaidCount);
    const allowed = completedPaidCount < BASIC_PAID_LIMIT;

    return { allowed, plan, remaining, used: completedPaidCount, limit: BASIC_PAID_LIMIT };
  } catch (e) {
    console.error('Error checking paid project limit:', e);
    return { allowed: true, plan: 'Free', remaining: BASIC_PAID_LIMIT, used: 0, limit: BASIC_PAID_LIMIT };
  }
};
