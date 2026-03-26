// api/admin/check-premium-expiry.js — Daily cron to expire premium memberships
const admin = require('../../lib/firebaseAdmin');

module.exports = async (req, res) => {
  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    const expiredSnap = await db.collection('users')
      .where('membershipPlan', '==', 'Premium')
      .where('premiumExpiresAt', '<=', now)
      .get();

    let count = 0;
    for (const doc of expiredSnap.docs) {
      await doc.ref.update({
        membershipPlan: 'Free',
        premiumExpiredAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      count++;
      console.log(`Premium expired for ${doc.data().email}`);
    }

    return res.status(200).json({ success: true, expired: count });
  } catch (err) {
    console.error('Premium expiry check error:', err);
    return res.status(500).json({ error: err.message });
  }
};
